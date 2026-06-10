import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

const WEBHOOK_SECRET = process.env.WOOCOMMERCE_WEBHOOK_SECRET;

/**
 * Verificación dual: acepta el request si CUALQUIERA de los dos métodos es válido.
 * 1. HMAC-SHA256 via header x-wc-webhook-signature (método estándar de WC)
 * 2. Token secreto en query param ?secret= (fallback porque el header suele
 *    filtrarse detrás de proxy/CDN antes de llegar a la función)
 *
 * Importante: si el header está presente pero NO coincide, igual se intenta
 * el token de la URL (no se corta en el método 1).
 */
function verifyRequest(request: NextRequest, rawBody: string): boolean {
  if (!WEBHOOK_SECRET) return false;

  // Método 1: HMAC signature header
  const signature = request.headers.get("x-wc-webhook-signature");
  if (signature) {
    const expected = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(rawBody, "utf8")
      .digest("base64");
    try {
      if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
        return true;
      }
    } catch {
      // longitudes distintas u otro error — seguimos al método 2
    }
  }

  // Método 2: Token en URL (fallback)
  const urlSecret = request.nextUrl.searchParams.get("secret");
  if (urlSecret) {
    try {
      return crypto.timingSafeEqual(
        Buffer.from(urlSecret),
        Buffer.from(WEBHOOK_SECRET),
      );
    } catch {
      return false;
    }
  }

  return false;
}

/** Invalida las páginas que muestran stock: categorías, colecciones, homepage e índice de búsqueda. */
function revalidateCatalog(): string[] {
  revalidatePath("/categorias/[slug]", "page");
  revalidatePath("/colecciones");
  revalidatePath("/");
  revalidatePath("/api/search/index");
  return ["/categorias/[slug]", "/colecciones", "/", "/api/search/index"];
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  if (!WEBHOOK_SECRET) {
    console.error("[WC Webhook] WOOCOMMERCE_WEBHOOK_SECRET no configurado");
    return NextResponse.json({ error: "Configuración inválida" }, { status: 500 });
  }

  if (!verifyRequest(request, rawBody)) {
    console.warn("[WC Webhook] Verificación fallida — request rechazado");
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // El "ping" que WooCommerce envía al guardar el webhook trae el cuerpo vacío
  // o no-JSON. Respondemos 200 para que la prueba de entrega pase sin error.
  if (!rawBody.trim()) {
    return NextResponse.json({ ok: true, ping: true });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: true, ping: true });
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
