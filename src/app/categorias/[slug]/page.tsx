import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  getCategories,
  getCategoryBySlug,
  getProducts,
  getAllCategorySlugs,
} from "@/lib/woocommerce";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Pagination } from "@/components/catalog/Pagination";
import { SortSelector } from "@/components/catalog/SortSelector";
import { SizeFilter } from "@/components/catalog/SizeFilter";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { SITE_NAME } from "@/lib/constants";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; orderby?: string; talla?: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllCategorySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) return {};

  const description = `Compra ${category.name} en ${SITE_NAME}. ${category.count} estilos disponibles. Envíos a toda Colombia.`;
  return {
    title: `${category.name} | ${SITE_NAME}`,
    description,
    openGraph: {
      title: `${category.name} | ${SITE_NAME}`,
      description,
      url: `/categorias/${slug}`,
      images: category.image
        ? [{ url: category.image.src, alt: category.name }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.name} | ${SITE_NAME}`,
      description,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page: pageParam, orderby = "popularity", talla } = await searchParams;
  const page = Math.max(1, Number(pageParam || 1));

  const [category, allCategories] = await Promise.all([
    getCategoryBySlug(slug),
    getCategories({ parent: 0 }),
  ]);

  if (!category) notFound();

  const sortMap: Record<string, { orderby: string; order: string }> = {
    popularity: { orderby: "popularity", order: "desc" },
    date: { orderby: "date", order: "desc" },
    price: { orderby: "price", order: "asc" },
    "price-desc": { orderby: "price", order: "desc" },
  };

  const sortParams = sortMap[orderby] || sortMap.popularity;

  const { data: rawProducts, totalPages } = await getProducts({
    category: String(category.id),
    page,
    // Cuando hay filtro de talla traemos más para compensar el filtrado client
    per_page: talla ? 100 : 16,
    ...sortParams,
  });

  // Filtrar por talla sobre los resultados (atributo local de WooCommerce)
  const products = talla
    ? rawProducts.filter((p) =>
        p.attributes.some(
          (a) =>
            a.name.toLowerCase() === "talla" &&
            a.options.some((o) => o.toLowerCase() === talla.toLowerCase())
        )
      )
    : rawProducts;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", href: "/" },
          { name: category.name, href: `/categorias/${slug}` },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-warm-400 mb-6" aria-label="Ruta de navegación">
          <ol className="flex items-center gap-2">
            <li>
              <a href="/" className="hover:text-burgundy-500 transition-colors">
                Inicio
              </a>
            </li>
            <li aria-hidden>/</li>
            <li className="text-warm-700 font-medium">{category.name}</li>
          </ol>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl text-warm-900">
              {category.name}
            </h1>
            <p className="mt-1 text-warm-500 text-sm">
              {category.count} productos
            </p>
          </div>

          {/* Category links */}
          <div className="flex flex-wrap gap-2">
            {allCategories
              .filter((c) => c.count > 0 && c.slug !== "uncategorized")
              .slice(0, 6)
              .map((c) => (
                <a
                  key={c.id}
                  href={`/categorias/${c.slug}`}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    c.slug === slug
                      ? "bg-burgundy-500 text-white border-burgundy-500"
                      : "border-warm-200 text-warm-600 hover:border-burgundy-300 hover:text-burgundy-500"
                  }`}
                >
                  {c.name}
                </a>
              ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <Suspense>
            <SizeFilter />
          </Suspense>
          <Suspense>
            <SortSelector />
          </Suspense>
        </div>

        {products.length === 0 ? (
          <div className="py-20 text-center text-warm-400">
            <p className="text-lg font-medium mb-2">Sin resultados</p>
            <p className="text-sm">No hay productos disponibles en talla {talla}.</p>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}

        {!talla && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath={`/categorias/${slug}`}
            searchParams={orderby !== "popularity" ? { orderby } : {}}
          />
        )}
      </div>
    </>
  );
}
