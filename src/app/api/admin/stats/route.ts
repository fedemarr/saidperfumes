import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Prohibido" }, { status: 403 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalRevenue,
    totalOrders,
    newUsers,
    pendingOrders,
    recentOrders,
    lowStock,
    ordersLast30,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] }, createdAt: { gte: startOfMonth } },
      _sum: { total: true },
    }),
    prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        items: { include: { product: { select: { name: true, brand: true, images: true, slug: true } } } },
      },
    }),
    prisma.product.findMany({
      where: { stock: { lt: 5 }, isActive: true },
      take: 5,
      orderBy: { stock: "asc" },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { total: true, createdAt: true },
    }),
  ]);

  // Group revenue by day for chart
  const revenueByDay: Record<string, number> = {};
  ordersLast30.forEach((o) => {
    const day = o.createdAt.toISOString().split("T")[0];
    revenueByDay[day] = (revenueByDay[day] ?? 0) + Number(o.total);
  });
  const revenueChart = Object.entries(revenueByDay)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({
    totalRevenue: Number(totalRevenue._sum.total ?? 0),
    totalOrders,
    newUsers,
    pendingOrders,
    revenueChart,
    recentOrders: recentOrders.map((o) => ({
      ...o,
      subtotal: Number(o.subtotal),
      discount: Number(o.discount),
      shippingCost: Number(o.shippingCost),
      total: Number(o.total),
      items: o.items.map((i) => ({ ...i, unitPrice: Number(i.unitPrice) })),
    })),
    lowStockProducts: lowStock.map((p) => ({
      ...p,
      price: Number(p.price),
      priceCash: p.priceCash ? Number(p.priceCash) : null,
      priceTransfer: p.priceTransfer ? Number(p.priceTransfer) : null,
    })),
  });
}
