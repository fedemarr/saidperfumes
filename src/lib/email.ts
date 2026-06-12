import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM = process.env.EMAIL_FROM ?? "SAID Perfumes <noreply@saidperfumes.com>";
const ADMIN = process.env.EMAIL_ADMIN ?? "admin@saidperfumes.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SAID Perfumes</title>
</head>
<body style="margin:0;padding:0;background:#000000;font-family:Georgia,serif;color:#FFFFFF;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#0D0D0D;border:1px solid #2A2A2A;border-radius:8px;">
          <tr>
            <td align="center" style="padding:40px 40px 24px;">
              <h1 style="margin:0;font-size:28px;font-weight:bold;letter-spacing:6px;color:#C9A84C;text-transform:uppercase;">SAID</h1>
              <p style="margin:4px 0 0;font-size:11px;letter-spacing:4px;color:#A0A0A0;text-transform:uppercase;">Perfumes</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 40px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:24px 40px;border-top:1px solid #2A2A2A;">
              <p style="margin:0;font-size:12px;color:#666666;">© ${new Date().getFullYear()} SAID Perfumes. Todos los derechos reservados.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function goldButton(href: string, text: string): string {
  return `<a href="${href}" style="display:inline-block;padding:14px 32px;background:#C9A84C;color:#000000;text-decoration:none;font-weight:bold;font-size:14px;letter-spacing:2px;text-transform:uppercase;border-radius:2px;margin-top:24px;">${text}</a>`;
}

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const url = `${APP_URL}/verify-email?token=${token}`;
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Confirmá tu cuenta en SAID Perfumes",
    html: baseTemplate(`
      <h2 style="color:#FFFFFF;font-size:22px;margin:0 0 16px;">Hola, ${name}!</h2>
      <p style="color:#A0A0A0;line-height:1.6;margin:0 0 8px;">Gracias por registrarte en SAID Perfumes.</p>
      <p style="color:#A0A0A0;line-height:1.6;margin:0;">Hacé click en el botón para confirmar tu cuenta. El enlace expira en <strong style="color:#FFFFFF;">24 horas</strong>.</p>
      <div style="text-align:center;">${goldButton(url, "Confirmar cuenta")}</div>
      <p style="color:#555;font-size:12px;margin-top:24px;">Si no creaste esta cuenta, ignorá este email.</p>
    `),
  });
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const url = `${APP_URL}/reset-password?token=${token}`;
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Restablecer contraseña — SAID Perfumes",
    html: baseTemplate(`
      <h2 style="color:#FFFFFF;font-size:22px;margin:0 0 16px;">Hola, ${name}!</h2>
      <p style="color:#A0A0A0;line-height:1.6;margin:0 0 8px;">Recibimos una solicitud para restablecer tu contraseña.</p>
      <p style="color:#A0A0A0;line-height:1.6;margin:0;">Hacé click en el botón para crear una nueva contraseña. El enlace expira en <strong style="color:#FFFFFF;">1 hora</strong>.</p>
      <div style="text-align:center;">${goldButton(url, "Restablecer contraseña")}</div>
      <p style="color:#555;font-size:12px;margin-top:24px;">Si no solicitaste esto, ignorá este email. Tu contraseña no cambiará.</p>
    `),
  });
}

function orderItemsHtml(items: { name: string; brand: string; quantity: number; unitPrice: number }[]): string {
  return items
    .map(
      (i) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #2A2A2A;color:#FFFFFF;font-size:14px;">${i.brand} — ${i.name}</td>
      <td style="padding:12px 0;border-bottom:1px solid #2A2A2A;color:#A0A0A0;text-align:center;">${i.quantity}</td>
      <td style="padding:12px 0;border-bottom:1px solid #2A2A2A;color:#C9A84C;text-align:right;">$${(i.unitPrice * i.quantity).toLocaleString("es-AR")}</td>
    </tr>`
    )
    .join("");
}

export async function sendOrderConfirmationEmail(
  email: string,
  name: string,
  order: {
    orderNumber: string;
    items: { name: string; brand: string; quantity: number; unitPrice: number }[];
    total: number;
    discount: number;
    shippingCost: number;
    paymentMethod: string;
    shippingAddress: { street: string; city: string; province: string; zip: string };
  }
) {
  const transferInstructions =
    order.paymentMethod === "TRANSFERENCIA"
      ? `<div style="background:#161616;border:1px solid #C9A84C;border-radius:4px;padding:20px;margin-top:20px;">
          <p style="color:#C9A84C;font-weight:bold;margin:0 0 12px;font-size:14px;letter-spacing:1px;text-transform:uppercase;">Datos para transferir</p>
          <p style="color:#FFFFFF;margin:4px 0;font-size:14px;">CBU: <strong>${process.env.NEXT_PUBLIC_BANK_CBU ?? ""}</strong></p>
          <p style="color:#FFFFFF;margin:4px 0;font-size:14px;">Alias: <strong>${process.env.NEXT_PUBLIC_BANK_ALIAS ?? ""}</strong></p>
          <p style="color:#FFFFFF;margin:4px 0;font-size:14px;">Titular: <strong>${process.env.NEXT_PUBLIC_BANK_HOLDER ?? ""}</strong></p>
          <p style="color:#FFFFFF;margin:4px 0;font-size:14px;">Monto: <strong style="color:#C9A84C;">$${order.total.toLocaleString("es-AR")}</strong></p>
          <div style="background:#0D0D0D;border:1px solid #2A2A2A;border-radius:4px;padding:16px;margin-top:16px;">
            <p style="color:#FFFFFF;margin:0 0 6px;font-size:14px;line-height:1.6;">Una vez realizada la transferencia, mandanos el comprobante por WhatsApp al <strong style="color:#C9A84C;">+54 9 11 3786-8379</strong> para confirmar el pago.</p>
            <p style="color:#A0A0A0;margin:0;font-size:13px;line-height:1.6;">El equipo de SAID Perfumes te confirma el pago y te envía el código de seguimiento de tu pedido.</p>
          </div>
          <p style="color:#C9A84C;font-size:15px;font-weight:bold;margin-top:16px;text-align:center;">¡Muchas gracias por tu compra!</p>
        </div>`
      : "";

  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: `Orden #${order.orderNumber} confirmada — SAID Perfumes`,
    html: baseTemplate(`
      <h2 style="color:#FFFFFF;font-size:22px;margin:0 0 8px;">¡Gracias, ${name}!</h2>
      <p style="color:#A0A0A0;margin:0 0 24px;">Tu pedido <strong style="color:#C9A84C;">#${order.orderNumber}</strong> fue recibido.</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <th style="text-align:left;color:#A0A0A0;font-size:12px;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;">Producto</th>
          <th style="text-align:center;color:#A0A0A0;font-size:12px;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;">Cant.</th>
          <th style="text-align:right;color:#A0A0A0;font-size:12px;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;">Total</th>
        </tr>
        ${orderItemsHtml(order.items)}
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
        ${order.discount > 0 ? `<tr><td style="color:#A0A0A0;padding:4px 0;">Descuento transferencia</td><td style="text-align:right;color:#22C55E;">-$${order.discount.toLocaleString("es-AR")}</td></tr>` : ""}
        <tr><td style="color:#A0A0A0;padding:4px 0;">Envío</td><td style="text-align:right;color:#FFFFFF;">${order.shippingCost === 0 ? "Gratis" : "$" + order.shippingCost.toLocaleString("es-AR")}</td></tr>
        <tr><td style="color:#FFFFFF;font-weight:bold;padding-top:8px;border-top:1px solid #2A2A2A;">Total</td><td style="text-align:right;color:#C9A84C;font-weight:bold;font-size:18px;padding-top:8px;border-top:1px solid #2A2A2A;">$${order.total.toLocaleString("es-AR")}</td></tr>
      </table>
      <p style="color:#A0A0A0;font-size:14px;margin-top:20px;">Envío a: ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.province} (${order.shippingAddress.zip})</p>
      ${transferInstructions}
    `),
  });
}

export async function sendNewOrderAdminEmail(
  order: { orderNumber: string; total: number; paymentMethod: string; user: { name: string | null; email: string } }
) {
  await getResend().emails.send({
    from: FROM,
    to: ADMIN,
    subject: `Nueva orden #${order.orderNumber} — $${order.total.toLocaleString("es-AR")}`,
    html: baseTemplate(`
      <h2 style="color:#C9A84C;font-size:22px;margin:0 0 16px;">Nueva venta!</h2>
      <p style="color:#FFFFFF;font-size:16px;">Orden: <strong>#${order.orderNumber}</strong></p>
      <p style="color:#FFFFFF;font-size:16px;">Cliente: ${order.user.name ?? ""} (${order.user.email})</p>
      <p style="color:#FFFFFF;font-size:16px;">Total: <strong style="color:#C9A84C;">$${order.total.toLocaleString("es-AR")}</strong></p>
      <p style="color:#FFFFFF;font-size:16px;">Método de pago: ${order.paymentMethod}</p>
      ${goldButton(`${APP_URL}/admin/pedidos`, "Ver en Admin")}
    `),
  });
}

export async function sendPaymentConfirmedEmail(email: string, name: string, orderNumber: string) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: `Pago confirmado — Orden #${orderNumber}`,
    html: baseTemplate(`
      <h2 style="color:#22C55E;font-size:22px;margin:0 0 16px;">¡Pago confirmado!</h2>
      <p style="color:#A0A0A0;line-height:1.6;">Hola <strong style="color:#FFFFFF;">${name}</strong>, tu pago para la orden <strong style="color:#C9A84C;">#${orderNumber}</strong> fue confirmado exitosamente.</p>
      <p style="color:#A0A0A0;line-height:1.6;margin-top:12px;">Estamos preparando tu pedido. Te avisaremos cuando sea despachado.</p>
      ${goldButton(`${APP_URL}/mis-pedidos`, "Ver mis pedidos")}
    `),
  });
}

export async function sendOrderShippedEmail(email: string, name: string, orderNumber: string, trackingCode?: string) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: `Tu pedido está en camino — Orden #${orderNumber}`,
    html: baseTemplate(`
      <h2 style="color:#FFFFFF;font-size:22px;margin:0 0 16px;">¡Tu pedido está en camino!</h2>
      <p style="color:#A0A0A0;line-height:1.6;">Hola <strong style="color:#FFFFFF;">${name}</strong>, la orden <strong style="color:#C9A84C;">#${orderNumber}</strong> fue despachada.</p>
      ${trackingCode ? `<p style="color:#A0A0A0;margin-top:12px;">Código de seguimiento: <strong style="color:#FFFFFF;">${trackingCode}</strong></p>` : ""}
      ${goldButton(`${APP_URL}/mis-pedidos`, "Ver mis pedidos")}
    `),
  });
}
