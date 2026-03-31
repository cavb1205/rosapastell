import type { MetadataRoute } from "next";
import { getProducts, getCategories } from "@/lib/woocommerce";
import { SITE_URL } from "@/lib/constants";

// Regenerar sitemap cada hora via ISR
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL.replace(/\/$/, "");
  const now = new Date();

  // ── Páginas estáticas ─────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: base,                      lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${base}/colecciones`,     lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${base}/nosotros`,        lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/como-comprar`,    lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/buscar`,          lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  // ── Categorías ────────────────────────────────────────────────────
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await getCategories({ hide_empty: 1 });
    categoryPages = categories
      .filter((c) => c.slug !== "uncategorized" && c.count > 0)
      .map((c) => ({
        url: `${base}/categorias/${c.slug}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.8,
      }));
  } catch {
    // API no disponible en build — continuar sin categorías
  }

  // ── Productos (con date_modified real) ────────────────────────────
  let productPages: MetadataRoute.Sitemap = [];
  try {
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const result = await getProducts({
        per_page: 100,
        page,
        status: "publish",
        _fields: "slug,date_modified",
      });

      for (const p of result.data) {
        productPages.push({
          url: `${base}/producto/${p.slug}`,
          lastModified: p.date_modified ? new Date(p.date_modified) : now,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }

      totalPages = result.totalPages;
      page++;
    }
  } catch {
    // API no disponible en build — continuar sin productos
  }

  return [...staticPages, ...categoryPages, ...productPages];
}
