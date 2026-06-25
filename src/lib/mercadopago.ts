import { MercadoPagoConfig, Preference } from "mercadopago";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function getClient() {
  return new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  });
}

export async function createPaymentPreference(order: {
  id: string;
  orderNumber: string;
  total: number;
  items: { name: string; brand: string; quantity: number; unitPrice: number }[];
}) {
  const client = getClient();
  const preference = new Preference(client);

  // Charge card price: base total + 20%
  const cardTotal = Math.round(order.total * 1.20);

  const response = await preference.create({
    body: {
      external_reference: order.orderNumber,
      items: [
        {
          id: order.id,
          title: `Pedido SAID Perfumes #${order.orderNumber}`,
          quantity: 1,
          unit_price: cardTotal,
          currency_id: "ARS",
        },
      ],
      back_urls: {
        success: `${APP_URL}/checkout/resultado?status=approved&order=${order.orderNumber}`,
        failure: `${APP_URL}/checkout/resultado?status=failure&order=${order.orderNumber}`,
        pending: `${APP_URL}/checkout/resultado?status=pending&order=${order.orderNumber}`,
      },
      auto_return: "approved",
      notification_url: `${APP_URL}/api/payments/webhook`,
    },
  });

  return response;
}
