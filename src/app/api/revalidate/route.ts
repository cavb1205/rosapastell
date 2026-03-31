import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

const WEBHOOK_SECRET = process.env.WOOCOMMERCE_WEBHOOK_SECRET;

/**
 * WooCommerce firma el cuerpo crudo con HMAC-SHA256 y lo envía en
 * X-WC-Webhook-Signature como Base64. Verificamos antes de procesar.
 */
function verifySignature(rawBody: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) return false;

  const expected = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody, "utf8")
    .digest("base64");

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;

  return crypto.timingSafeEqual(a, b);
}

/** Invalida las páginas que muestran stock: categorías, colecciones y homepage. */
function revalidateCatalog(): string[] {
  revalidatePath("/categorias/[slug]", "page");
  revalidatePath("/colecciones");
  revalidatePath("/");
  return ["/categorias/[slug]", "/colecciones", "/"];
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  if (WEBHOOK_SECRET) {
    const signature = request.headers.get("x-wc-webhook-signature") ?? "";
    if (!signature || !verifySignature(rawBody, signature)) {
      console.warn("[WC Webhook] Firma inválida — request rechazado");
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const topic = request.headers.get("x-wc-webhook-topic") ?? "";
  const revalidated: string[] = [];

  // ── Eventos de PRODUCTO (actualización manual de stock/precio/imagen) ──
  if (topic.startsWith("product.")) {
    const slug = body.slug as string | undefined;

    if (slug) {
      revalidatePath(`/producto/${slug}`);
      revalidated.push(`/producto/${slug}`);
    }

    revalidated.push(...revalidateCatalog());

    console.log(`[WC Webhook] ${topic} slug=${slug ?? "—"} → ${revalidated.join(", ")}`);
    return NextResponse.json({ revalidated: true, topic, paths: revalidated });
  }

  // ── Eventos de ORDEN (compra o cancelación cambia el stock) ──
  if (topic === "order.created" || topic === "order.updated") {
    // Las páginas de catálogo usan stock_status=instock — deben actualizarse
    // cuando un producto se agota por compra o se repone por cancelación.
    revalidated.push(...revalidateCatalog());

    // Intentar revalidar páginas de producto específicas a partir de los
    // line_items (el payload de orden incluye product_id pero no el slug,
    // así que solo podemos revalidar si hay un campo slug disponible).
    const lineItems = body.line_items as Array<{ product_id?: number; slug?: string }> | undefined;
    if (Array.isArray(lineItems)) {
      for (const item of lineItems) {
        if (item.slug) {
          revalidatePath(`/producto/${item.slug}`);
          revalidated.push(`/producto/${item.slug}`);
        }
      }
    }

    console.log(`[WC Webhook] ${topic} orden #${body.number ?? "?"} → ${revalidated.join(", ")}`);
    return NextResponse.json({ revalidated: true, topic, paths: revalidated });
  }

  return NextResponse.json({ revalidated: false, reason: "topic ignorado", topic });
}
