import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { sendPaymentConfirmedEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // MP sends different notification types
    if (body.type !== "payment") {
      return NextResponse.json({ ok: true });
    }

    const paymentId = body.data?.id;
    if (!paymentId) return NextResponse.json({ ok: true });

    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
    });

    const payment = await new Payment(client).get({ id: paymentId });

    if (payment.status !== "approved") {
      return NextResponse.json({ ok: true });
    }

    const orderNumber = payment.external_reference;
    if (!orderNumber) return NextResponse.json({ ok: true });

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { user: true },
    });

    if (!order || order.status === "PAID") {
      return NextResponse.json({ ok: true });
    }

    await prisma.order.update({
      where: { orderNumber },
      data: { status: "PAID", paidAt: new Date() },
    });

    const email = order.user?.email ?? order.guestEmail ?? "";
    const name = order.user?.name ?? order.guestName ?? "";
    if (email) {
      sendPaymentConfirmedEmail(email, name, order.orderNumber).catch(console.error);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[webhook] error:", err);
    return NextResponse.json({ ok: true }); // Always 200 to MP
  }
}
