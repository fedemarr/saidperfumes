import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPaymentConfirmedEmail, sendOrderShippedEmail } from "@/lib/email";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Prohibido" }, { status: 403 }), session: null };
  }
  return { error: null, session };
}

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const status = req.nextUrl.searchParams.get("status");
  const page = Number(req.nextUrl.searchParams.get("page") ?? 1);
  const limit = 20;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        items: { include: { product: { select: { name: true, brand: true, images: true, slug: true } } } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({
    orders: orders.map((o) => ({
      ...o,
      subtotal: Number(o.subtotal),
      discount: Number(o.discount),
      shippingCost: Number(o.shippingCost),
      total: Number(o.total),
      items: o.items.map((i) => ({ ...i, unitPrice: Number(i.unitPrice) })),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { orderId, status, trackingCode } = await req.json();
  if (!orderId || !status) {
    return NextResponse.json({ error: "Datos requeridos" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = { status };
  if (status === "PAID") updateData.paidAt = new Date();
  if (status === "SHIPPED") updateData.shippedAt = new Date();
  if (status === "DELIVERED") updateData.deliveredAt = new Date();

  const order = await prisma.order.update({
    where: { id: orderId },
    data: updateData,
    include: { user: true },
  });

  if (status === "PAID") {
    sendPaymentConfirmedEmail(order.user.email, order.user.name ?? "", order.orderNumber).catch(console.error);
  }
  if (status === "SHIPPED") {
    sendOrderShippedEmail(order.user.email, order.user.name ?? "", order.orderNumber, trackingCode).catch(console.error);
  }

  return NextResponse.json({ success: true });
}
