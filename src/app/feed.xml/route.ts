import { getProducts } from "@/lib/woocommerce";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import type { WooProduct } from "@/types/product";

// Feed de productos para Google Merchant Center (Google Shopping).
// Se regenera vía ISR cada 6 horas; Merchant Center lo rastrea a diario.
export const dynamic = "force-static";
export const revalidate = 21600;

// Categoría de Google para pijamas/ropa de descanso.
// https://support.google.com/merchants/answer/6324436
const GOOGLE_PRODUCT_CATEGORY =
  "Apparel & Accessories > Clothing > Sleepwear & Loungewear";

/** Escapa caracteres reservados de XML. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Limpia HTML y entidades comunes de las descripciones de WooCommerce. */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#8217;|&#8216;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/** Formatea un precio de WooCommerce (COP) al formato que exige Google: "12345.00 COP". */
function formatPrice(value: string): string | null {
  const n = parseFloat(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return `${n.toFixed(2)} COP`;
}

/** Construye el bloque <item> de un producto, o null si no es apto para el feed. */
function buildItem(p: WooProduct, base: string): string | null {
  const image = p.images?.[0]?.src;
  if (!image) return null; // Google exige imagen

  // Precio regular y de oferta. Si hay regular_price válido lo usamos como base.
  const regular =
    p.regular_price && parseFloat(p.regular_price) > 0
      ? p.regular_price
      : p.price;
  const price = formatPrice(regular);
  if (!price) return null; // Google exige precio

  const salePrice =
    p.on_sale && p.sale_price ? formatPrice(p.sale_price) : null;

  const description =
    stripHtml(p.description || p.short_description || p.name).slice(0, 4900) ||
    p.name;

  const productType = p.categories
    .map((c) => c.name)
    .filter(Boolean)
    .join(" > ");

  const additionalImages = (p.images ?? [])
    .slice(1, 11)
    .map(
      (img) =>
        `    <g:additional_image_link>${escapeXml(img.src)}</g:additional_image_link>`
    )
    .join("\n");

  // Identificadores: las pijamas son marca propia sin GTIN.
  // Si hay SKU lo enviamos como MPN (brand + mpn satisface a Google);
  // si no, declaramos que no existen identificadores únicos.
  const identifierLines = p.sku
    ? `    <g:mpn>${escapeXml(p.sku)}</g:mpn>`
    : `    <g:identifier_exists>no</g:identifier_exists>`;

  // Atributos de ropa. Solo emitimos color/talla cuando el producto tiene UN
  // único valor (sin ambigüedad); con varias tallas se omite, porque a nivel
  // de producto sería dato incorrecto y enumerarlas exige traer variaciones
  // (carga extra al VPS que queremos evitar). Usa p.attributes ya presente.
  const singleAttr = (names: string[]): string | null => {
    const attr = p.attributes?.find((a) =>
      names.includes(a.name.toLowerCase().trim())
    );
    const opt = attr?.options?.[0]?.trim();
    return attr && attr.options.length === 1 && opt ? opt : null;
  };
  const color = singleAttr(["color"]);
  const size = singleAttr(["talla", "size", "tamaño"]);

  return [
    "  <item>",
    `    <g:id>${p.id}</g:id>`,
    `    <g:title>${escapeXml(p.name)}</g:title>`,
    `    <g:description>${escapeXml(description)}</g:description>`,
    `    <g:link>${base}/producto/${escapeXml(p.slug)}</g:link>`,
    `    <g:image_link>${escapeXml(image)}</g:image_link>`,
    additionalImages,
    `    <g:availability>in_stock</g:availability>`,
    `    <g:condition>new</g:condition>`,
    `    <g:price>${price}</g:price>`,
    salePrice ? `    <g:sale_price>${salePrice}</g:sale_price>` : "",
    `    <g:brand>${escapeXml(SITE_NAME)}</g:brand>`,
    identifierLines,
    `    <g:gender>female</g:gender>`,
    `    <g:age_group>adult</g:age_group>`,
    color ? `    <g:color>${escapeXml(color)}</g:color>` : "",
    size ? `    <g:size>${escapeXml(size)}</g:size>` : "",
    `    <g:google_product_category>${escapeXml(GOOGLE_PRODUCT_CATEGORY)}</g:google_product_category>`,
    productType
      ? `    <g:product_type>${escapeXml(productType)}</g:product_type>`
      : "",
    "  </item>",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function GET(): Promise<Response> {
  const base = SITE_URL.replace(/\/$/, "");
  const items: string[] = [];

  try {
    let page = 1;
    let totalPages = 1;

    // getProducts ya filtra status=publish y stock_status=instock.
    while (page <= totalPages) {
      const result = await getProducts({ per_page: 100, page });
      for (const p of result.data) {
        const item = buildItem(p, base);
        if (item) items.push(item);
      }
      totalPages = result.totalPages;
      page++;
    }
  } catch (error) {
    // API no disponible — registramos y devolvemos un feed vacío pero válido.
    console.error("[feed.xml] Error generando el feed de productos:", error);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${base}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
${items.join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control":
        "public, max-age=0, s-maxage=21600, stale-while-revalidate=86400",
    },
  });
}
