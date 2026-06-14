import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validations/order";
import { generateOrderNumber, hasFreeShipping } from "@/lib/utils";
import { sendOrderConfirmationEmail, sendNewOrderAdminEmail } from "@/lib/email";
import { verifyTurnstile } from "@/lib/turnstile";
import { z } from "zod";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const data = checkoutSchema.parse(body);

    if (body.turnstileToken) {
      const turnstileOk = await verifyTurnstile(body.turnstileToken);
      if (!turnstileOk) {
        return NextResponse.json({ error: "Verificación de seguridad fallida. Recargá la página e intentá de nuevo." }, { status: 400 });
      }
    }

    const { items }: { items: { productId: string; quantity: number }[] } = body;
    if (!items?.length) {
      return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
    }

    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    let subtotal = 0;
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Producto no encontrado: ${item.productId}`);
      const unitPrice =
        data.paymentMethod === "TRANSFERENCIA" && product.priceTransfer
          ? Number(product.priceTransfer)
          : Number(product.price);
      subtotal += unitPrice * item.quantity;
      return { productId: item.productId, quantity: item.quantity, unitPrice };
    });

    const regularTotal = items.reduce((sum, item) => {
      const p = products.find((pr) => pr.id === item.productId);
      return sum + Number(p?.price ?? 0) * item.quantity;
    }, 0);

    const discount = data.paymentMethod === "TRANSFERENCIA" ? regularTotal - subtotal : 0;
    const shippingCost = hasFreeShipping(subtotal) ? 0 : 0;
    const total = subtotal + shippingCost;
    const orderNumber = generateOrderNumber();

    // Use session user if logged in, otherwise use guest info from shipping form
    const guestEmail = session?.user.email ?? data.shipping.email;
    const guestName = session?.user.name ?? data.shipping.name;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session?.user.id ?? undefined,
        guestEmail: session ? undefined : guestEmail,
        guestName: session ? undefined : guestName,
        status: "PENDING",
        paymentMethod: data.paymentMethod,
        subtotal,
        discount,
        shippingCost,
        total,
        shippingAddress: data.shipping,
        notes: data.notes,
        items: { create: orderItems },
      },
      include: { items: { include: { product: true } } },
    });

    // Send confirmation to guest or session user
    sendOrderConfirmationEmail(guestEmail, guestName, {
      orderNumber: order.orderNumber,
      items: order.items.map((i) => ({
        name: i.product.name,
        brand: i.product.brand,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
      })),
      total: Number(order.total),
      discount: Number(order.discount),
      shippingCost: Number(order.shippingCost),
      paymentMethod: order.paymentMethod,
      shippingAddress: order.shippingAddress as { street: string; city: string; province: string; zip: string },
    }).then(() => console.log(`[email] confirmation sent to ${guestEmail}`))
      .catch((err) => console.error("[email] confirmation failed:", err));

    sendNewOrderAdminEmail({
      orderNumber: order.orderNumber,
      total: Number(order.total),
      paymentMethod: order.paymentMethod,
      user: { name: guestName, email: guestEmail },
    }).catch(console.error);

    return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Error de validación" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: { include: { product: { select: { name: true, brand: true, images: true, slug: true } } } },
    },
  });

  return NextResponse.json(
    orders.map((o) => ({
      ...o,
      subtotal: Number(o.subtotal),
      discount: Number(o.discount),
      shippingCost: Number(o.shippingCost),
      total: Number(o.total),
      items: o.items.map((i) => ({ ...i, unitPrice: Number(i.unitPrice) })),
    }))
  );
}
