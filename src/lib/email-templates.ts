import { SITE_NAME, SITE_URL, WHATSAPP_URL } from "@/lib/constants";
import { formatPrice } from "@/lib/formatters";

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
                Realiza tu pago y envíanos el comprobante por WhatsApp para confirmar el despacho.
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
                    <a href="${WHATSAPP_URL}"
                      style="display:inline-block;background:#25D366;color:#ffffff;
                        font-size:14px;font-weight:700;padding:14px 32px;border-radius:50px;
                        text-decoration:none;letter-spacing:0.3px;">
                      Enviar comprobante por WhatsApp
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
