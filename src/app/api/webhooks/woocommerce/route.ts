import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { sendEmail } from "@/lib/email";
import { SITE_NAME } from "@/lib/constants";
import { formatPrice } from "@/lib/formatters";
import {
  orderShippedEmailHtml,
  orderCancelledEmailHtml,
  orderRefundedEmailHtml,
} from "@/lib/email-templates";

const WEBHOOK_SECRET = process.env.WOOCOMMERCE_WEBHOOK_SECRET!;

/**
 * WooCommerce firma los webhooks con HMAC-SHA256 usando el secret configurado.
 * La firma viene en el header `x-wc-webhook-signature` como base64.
 */
function verifySignature(body: string, signature: string | null): boolean {
  if (!signature || !WEBHOOK_SECRET) return false;
  const expected = createHmac("sha256", WEBHOOK_SECRET)
    .update(body, "utf8")
    .digest("base64");
  return expected === signature;
}

// Idempotencia: evitar enviar el mismo email dos veces si WooCommerce reenvía el webhook
const processedEvents = new Map<string, number>();

setInterval(() => {
  const cutoff = Date.now() - 3_600_000;
  for (const [key, ts] of processedEvents) {
    if (ts < cutoff) processedEvents.delete(key);
  }
}, 600_000);

interface WooWebhookOrder {
  id: number;
  number: string;
  status: string;
  total: string;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    city?: string;
  };
  shipping: {
    address_1: string;
    city: string;
  };
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-wc-webhook-signature");

  if (!verifySignature(rawBody, signature)) {
    // Debug temporal — eliminar después de confirmar que funciona
    const expected = WEBHOOK_SECRET
      ? createHmac("sha256", WEBHOOK_SECRET).update(rawBody, "utf8").digest("base64")
      : "NO_SECRET_CONFIGURED";
    console.warn("[WC Webhook] Firma inválida", {
      hasSecret: !!WEBHOOK_SECRET,
      secretLength: WEBHOOK_SECRET?.length,
      receivedSig: signature?.substring(0, 10) + "...",
      expectedSig: expected.substring(0, 10) + "...",
      bodyLength: rawBody.length,
      bodyPreview: rawBody.substring(0, 100),
    });
    return NextResponse.json({
      error: "Unauthorized",
      debug: {
        hasSecret: !!WEBHOOK_SECRET,
        secretLength: WEBHOOK_SECRET?.length,
        hasSignatureHeader: !!signature,
        bodyLength: rawBody.length,
      },
    }, { status: 401 });
  }

  // WooCommerce envía un ping al crear el webhook — responder OK
  const topic = request.headers.get("x-wc-webhook-topic");
  if (topic === "action.woocommerce_webhook_ping" || !topic) {
    return NextResponse.json({ ok: true });
  }

  let order: WooWebhookOrder;
  try {
    order = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = order.billing?.email;
  const firstName = order.billing?.first_name || "Cliente";

  if (!email || !order.number) {
    return NextResponse.json({ ok: true });
  }

  // Idempotencia
  const idempotencyKey = `${order.id}-${order.status}`;
  if (processedEvents.has(idempotencyKey)) {
    return NextResponse.json({ ok: true });
  }

  const total = formatPrice(parseFloat(order.total));
  const city = order.shipping?.city || order.billing?.city || "";
  const address = order.shipping?.address_1 || "";

  try {
    switch (order.status) {
      case "completed": {
        await sendEmail({
          to: [{ email, name: firstName }],
          subject: `Tu pedido #${order.number} fue enviado — ${SITE_NAME}`,
          htmlContent: orderShippedEmailHtml({
            orderNumber: order.number,
            firstName,
            total,
            city,
            address,
          }),
        });
        break;
      }

      case "cancelled": {
        await sendEmail({
          to: [{ email, name: firstName }],
          subject: `Tu pedido #${order.number} fue cancelado — ${SITE_NAME}`,
          htmlContent: orderCancelledEmailHtml({
            orderNumber: order.number,
            firstName,
            total,
          }),
        });
        break;
      }

      case "refunded": {
        await sendEmail({
          to: [{ email, name: firstName }],
          subject: `Reembolso de tu pedido #${order.number} — ${SITE_NAME}`,
          htmlContent: orderRefundedEmailHtml({
            orderNumber: order.number,
            firstName,
            total,
          }),
        });
        break;
      }

      default:
        // Otros estados (processing, on-hold, pending) no generan email adicional
        return NextResponse.json({ ok: true });
    }

    processedEvents.set(idempotencyKey, Date.now());
    console.log(`[WC Webhook] Email enviado para orden ${order.number} (${order.status})`);
  } catch (err) {
    console.error(`[WC Webhook] Error enviando email para orden ${order.number}:`, err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
