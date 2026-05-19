import { SITE_NAME, SITE_URL, WHATSAPP_URL } from "@/lib/constants";
import { formatPrice } from "@/lib/formatters";

/* ─── Email base wrapper ─── */
function emailWrapper(title: string, body: string): string {
  const logoUrl = `${SITE_URL}/logo-rosapastell.png`;
  const primaryColor = "#F89BBB";
  const mutedText = "#9c7c7c";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f7eef2;font-family:'Trebuchet MS',Calibri,'Gill Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7eef2;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <img src="${logoUrl}" alt="${SITE_NAME}" height="48"
                style="display:block;max-width:220px;height:auto;" />
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;border-radius:20px;padding:32px;box-shadow:0 4px 24px rgba(248,155,187,0.15);">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 8px 0;text-align:center;">
              <p style="margin:0;font-size:12px;color:#c4a0a8;line-height:1.6;">
                ${SITE_NAME} · Ibagué, Colombia<br />
                <a href="${SITE_URL}" style="color:${primaryColor};text-decoration:none;">
                  ${SITE_URL.replace("https://", "")}
                </a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* ─── Welcome email ─── */
interface WelcomeEmailParams {
  firstName: string;
}

export function welcomeEmailHtml({ firstName }: WelcomeEmailParams): string {
  const primaryColor = "#F89BBB";
  const darkText = "#3d2c2c";
  const mutedText = "#9c7c7c";

  const body = `
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${primaryColor};">
      Bienvenida
    </p>
    <h1 style="margin:0 0 8px;font-size:26px;color:${darkText};font-weight:700;">
      ¡Hola, ${firstName}!
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:${mutedText};line-height:1.6;">
      Tu cuenta en <strong style="color:${darkText};">${SITE_NAME}</strong> fue creada exitosamente.
      Ya puedes explorar nuestras colecciones, guardar tus favoritos y hacer tus pedidos de forma más rápida.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td align="center">
          <a href="${SITE_URL}/colecciones"
            style="display:inline-block;background:${primaryColor};color:#ffffff;
              font-size:14px;font-weight:700;padding:14px 32px;border-radius:50px;
              text-decoration:none;letter-spacing:0.3px;">
            Ver Colecciones
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:13px;color:${mutedText};line-height:1.6;text-align:center;">
      ¿Tienes preguntas? Escríbenos por
      <a href="${WHATSAPP_URL}" style="color:${primaryColor};text-decoration:none;font-weight:600;">WhatsApp</a>.
    </p>`;

  return emailWrapper(`Bienvenida a ${SITE_NAME}`, body);
}

/* ─── Password reset email ─── */
interface PasswordResetEmailParams {
  firstName: string;
  resetUrl: string;
}

export function passwordResetEmailHtml({ firstName, resetUrl }: PasswordResetEmailParams): string {
  const primaryColor = "#F89BBB";
  const darkText = "#3d2c2c";
  const mutedText = "#9c7c7c";

  const body = `
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${primaryColor};">
      Recuperar contraseña
    </p>
    <h1 style="margin:0 0 8px;font-size:26px;color:${darkText};font-weight:700;">
      Hola, ${firstName}
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:${mutedText};line-height:1.6;">
      Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong style="color:${darkText};">${SITE_NAME}</strong>.
      Haz clic en el botón para crear una nueva contraseña.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td align="center">
          <a href="${resetUrl}"
            style="display:inline-block;background:${primaryColor};color:#ffffff;
              font-size:14px;font-weight:700;padding:14px 32px;border-radius:50px;
              text-decoration:none;letter-spacing:0.3px;">
            Restablecer Contraseña
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 8px;font-size:13px;color:${mutedText};line-height:1.6;text-align:center;">
      Este enlace expira en 1 hora. Si no solicitaste este cambio, puedes ignorar este email.
    </p>
    <p style="margin:0;font-size:11px;color:#c4a0a8;line-height:1.6;text-align:center;word-break:break-all;">
      ${resetUrl}
    </p>`;

  return emailWrapper("Restablecer contraseña", body);
}

/* ─── Order shipped / completed email ─── */
interface OrderShippedParams {
  orderNumber: string | number;
  firstName: string;
  total: string;
  city: string;
  address: string;
}

export function orderShippedEmailHtml(p: OrderShippedParams): string {
  const primaryColor = "#F89BBB";
  const darkText = "#3d2c2c";
  const mutedText = "#9c7c7c";
  const bgLight = "#fdf6f8";
  const waLink = `${WHATSAPP_URL}?text=${encodeURIComponent(`Hola, tengo una consulta sobre mi pedido #${p.orderNumber}`)}`;

  const body = `
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#5a9a6a;">
      Pedido enviado
    </p>
    <h1 style="margin:0 0 8px;font-size:26px;color:${darkText};font-weight:700;">
      ¡Tu pedido va en camino!
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:${mutedText};line-height:1.6;">
      ${p.firstName}, tu pedido <strong style="color:${darkText};">#${p.orderNumber}</strong>
      por <strong style="color:${darkText};">${p.total}</strong> ha sido despachado.
    </p>

    <div style="background:${bgLight};border-radius:12px;padding:16px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;
        letter-spacing:1px;color:${mutedText};">Envío a</p>
      <p style="margin:0;font-size:13px;color:${darkText};">
        ${p.address}, ${p.city}, Colombia
      </p>
    </div>

    <p style="margin:0 0 24px;font-size:13px;color:${mutedText};line-height:1.6;text-align:center;">
      Si tienes preguntas sobre tu envío, escríbenos por WhatsApp.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${waLink}"
            style="display:inline-block;background:#25D366;color:#ffffff;
              font-size:14px;font-weight:700;padding:14px 32px;border-radius:50px;
              text-decoration:none;letter-spacing:0.3px;">
            Contactar por WhatsApp
          </a>
        </td>
      </tr>
    </table>`;

  return emailWrapper(`Pedido #${p.orderNumber} enviado`, body);
}

/* ─── Order cancelled email ─── */
interface OrderCancelledParams {
  orderNumber: string | number;
  firstName: string;
  total: string;
}

export function orderCancelledEmailHtml(p: OrderCancelledParams): string {
  const darkText = "#3d2c2c";
  const mutedText = "#9c7c7c";
  const waLink = `${WHATSAPP_URL}?text=${encodeURIComponent(`Hola, tengo una consulta sobre mi pedido #${p.orderNumber}`)}`;

  const body = `
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#d97706;">
      Pedido cancelado
    </p>
    <h1 style="margin:0 0 8px;font-size:26px;color:${darkText};font-weight:700;">
      Tu pedido fue cancelado
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:${mutedText};line-height:1.6;">
      ${p.firstName}, tu pedido <strong style="color:${darkText};">#${p.orderNumber}</strong>
      por <strong style="color:${darkText};">${p.total}</strong> ha sido cancelado.
    </p>

    <p style="margin:0 0 24px;font-size:13px;color:${mutedText};line-height:1.6;text-align:center;">
      Si crees que esto fue un error o necesitas ayuda, contáctanos por WhatsApp.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td align="center">
          <a href="${waLink}"
            style="display:inline-block;background:#25D366;color:#ffffff;
              font-size:14px;font-weight:700;padding:14px 32px;border-radius:50px;
              text-decoration:none;letter-spacing:0.3px;">
            Contactar por WhatsApp
          </a>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${SITE_URL}/colecciones"
            style="display:inline-block;color:${darkText};
              font-size:13px;font-weight:600;text-decoration:underline;
              text-underline-offset:3px;">
            Seguir comprando
          </a>
        </td>
      </tr>
    </table>`;

  return emailWrapper(`Pedido #${p.orderNumber} cancelado`, body);
}

/* ─── Order refunded email ─── */
interface OrderRefundedParams {
  orderNumber: string | number;
  firstName: string;
  total: string;
}

export function orderRefundedEmailHtml(p: OrderRefundedParams): string {
  const darkText = "#3d2c2c";
  const mutedText = "#9c7c7c";
  const waLink = `${WHATSAPP_URL}?text=${encodeURIComponent(`Hola, tengo una consulta sobre el reembolso de mi pedido #${p.orderNumber}`)}`;

  const body = `
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#6366f1;">
      Reembolso procesado
    </p>
    <h1 style="margin:0 0 8px;font-size:26px;color:${darkText};font-weight:700;">
      Tu reembolso fue procesado
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:${mutedText};line-height:1.6;">
      ${p.firstName}, el reembolso de tu pedido <strong style="color:${darkText};">#${p.orderNumber}</strong>
      por <strong style="color:${darkText};">${p.total}</strong> ha sido procesado.
      El dinero puede tardar entre 3 a 10 días hábiles en reflejarse según tu banco.
    </p>

    <p style="margin:0 0 24px;font-size:13px;color:${mutedText};line-height:1.6;text-align:center;">
      ¿Tienes preguntas? Escríbenos por WhatsApp.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${waLink}"
            style="display:inline-block;background:#25D366;color:#ffffff;
              font-size:14px;font-weight:700;padding:14px 32px;border-radius:50px;
              text-decoration:none;letter-spacing:0.3px;">
            Contactar por WhatsApp
          </a>
        </td>
      </tr>
    </table>`;

  return emailWrapper(`Reembolso del pedido #${p.orderNumber}`, body);
}

/* ─── Order confirmation email ─── */
interface OrderItem {
  name: string;
  size: string;
  quantity: number;
  price: number;
  image?: string;
}

interface OrderConfirmationParams {
  orderNumber: string | number;
  firstName: string;
  items: OrderItem[];
  subtotal: number;
  discount?: number;
  couponCode?: string;
  total: number;
  city: string;
  address: string;
  paymentMethod?: "wompi" | "whatsapp";
}

export function orderConfirmationHtml(p: OrderConfirmationParams): string {
  const logoUrl = `${SITE_URL}/logo-rosapastell.png`;
  const primaryColor = "#F89BBB";
  const darkText = "#3d2c2c";
  const mutedText = "#9c7c7c";
  const bgLight = "#fdf6f8";

  const itemRows = p.items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f3e8ec;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:56px;vertical-align:top;">
                ${
                  item.image
                    ? `<img src="${item.image}" alt="${item.name}" width="48" height="48"
                        style="border-radius:8px;object-fit:cover;display:block;" />`
                    : `<div style="width:48px;height:48px;background:#f3e8ec;border-radius:8px;"></div>`
                }
              </td>
              <td style="padding-left:12px;vertical-align:top;">
                <p style="margin:0;font-size:14px;font-weight:600;color:${darkText};">${item.name}</p>
                <p style="margin:4px 0 0;font-size:12px;color:${mutedText};">Talla ${item.size} × ${item.quantity}</p>
              </td>
              <td style="text-align:right;vertical-align:top;white-space:nowrap;">
                <p style="margin:0;font-size:14px;font-weight:600;color:${darkText};">
                  ${formatPrice(item.price * item.quantity)}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    )
    .join("");

  const discountRow =
    p.discount && p.discount > 0
      ? `<tr>
          <td style="padding:4px 0;font-size:13px;color:#5a9a6a;">
            Descuento${p.couponCode ? ` (${p.couponCode})` : ""}
          </td>
          <td style="padding:4px 0;text-align:right;font-size:13px;color:#5a9a6a;">
            −${formatPrice(p.discount)}
          </td>
        </tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Confirmación de pedido #${p.orderNumber}</title>
</head>
<body style="margin:0;padding:0;background:#f7eef2;font-family:'Trebuchet MS',Calibri,'Gill Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7eef2;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <img src="${logoUrl}" alt="${SITE_NAME}" height="48"
                style="display:block;max-width:220px;height:auto;" />
            </td>
          </tr>

          <!-- Card principal -->
          <tr>
            <td style="background:#ffffff;border-radius:20px;padding:32px;box-shadow:0 4px 24px rgba(248,155,187,0.15);">

              <!-- Cabecera -->
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${primaryColor};">
                Confirmación de pedido
              </p>
              <h1 style="margin:0 0 8px;font-size:26px;color:${darkText};font-weight:700;">
                ¡Gracias, ${p.firstName}!
              </h1>
              <p style="margin:0 0 24px;font-size:14px;color:${mutedText};line-height:1.6;">
                Recibimos tu pedido <strong style="color:${darkText};">#${p.orderNumber}</strong>.
                ${p.paymentMethod === "wompi"
                  ? "Tu pago fue procesado exitosamente. Pronto prepararemos tu envío."
                  : "Escríbenos por WhatsApp con tu número de pedido para enviarte los datos de pago y confirmar tu compra."}
              </p>

              <!-- Productos -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="border-top:1px solid #f3e8ec;margin-bottom:16px;">
                ${itemRows}
              </table>

              <!-- Totales -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="margin-bottom:24px;">
                <tr>
                  <td style="padding:4px 0;font-size:13px;color:${mutedText};">Subtotal</td>
                  <td style="padding:4px 0;text-align:right;font-size:13px;color:${mutedText};">
                    ${formatPrice(p.subtotal)}
                  </td>
                </tr>
                ${discountRow}
                <tr>
                  <td style="padding:12px 0 0;font-size:16px;font-weight:700;color:${darkText};
                    border-top:1px solid #f3e8ec;">Total</td>
                  <td style="padding:12px 0 0;text-align:right;font-size:16px;font-weight:700;
                    color:${primaryColor};border-top:1px solid #f3e8ec;">
                    ${formatPrice(p.total)}
                  </td>
                </tr>
              </table>

              <!-- Dirección -->
              <div style="background:${bgLight};border-radius:12px;padding:16px;margin-bottom:24px;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;
                  letter-spacing:1px;color:${mutedText};">Envío a</p>
                <p style="margin:0;font-size:13px;color:${darkText};">
                  ${p.address}, ${p.city}, Colombia
                </p>
              </div>

              <!-- CTA WhatsApp -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${WHATSAPP_URL}?text=${encodeURIComponent(p.paymentMethod === "wompi" ? `Hola, tengo una consulta sobre mi pedido #${p.orderNumber}` : `Hola, quiero confirmar mi pedido #${p.orderNumber} y recibir los datos de pago`)}"
                      style="display:inline-block;background:#25D366;color:#ffffff;
                        font-size:14px;font-weight:700;padding:14px 32px;border-radius:50px;
                        text-decoration:none;letter-spacing:0.3px;">
                      ${p.paymentMethod === "wompi" ? "Contactar por WhatsApp" : "Solicitar datos de pago por WhatsApp"}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 8px 0;text-align:center;">
              <p style="margin:0;font-size:12px;color:#c4a0a8;line-height:1.6;">
                ${SITE_NAME} · Ibagué, Colombia<br />
                <a href="${SITE_URL}" style="color:${primaryColor};text-decoration:none;">
                  ${SITE_URL.replace("https://", "")}
                </a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
