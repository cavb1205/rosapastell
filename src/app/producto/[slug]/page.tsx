import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getProductVariations,
  getProducts,
} from "@/lib/woocommerce";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ProductJsonLd } from "@/components/seo/ProductJsonLd";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { formatPrice } from "@/lib/formatters";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { getProductReviews } from "@/lib/reviews";

// ISR: páginas generadas bajo demanda en el primer request, cacheadas 60s
// No usamos generateStaticParams para evitar sobrecargar WordPress en el build
export const revalidate = 60;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const description = `Compra ${product.name} en ${SITE_NAME}. ${formatPrice(product.price)} COP. Envíos a toda Colombia.`;
  const canonical = `${SITE_URL}/producto/${slug}`;
  const ogImages = product.images.map((img) => ({
    url: img.src,
    alt: img.alt || product.name,
    width: 800,
    height: 800,
  }));

  return {
    title: product.name,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${product.name} | ${SITE_NAME}`,
      description,
      url: canonical,
      type: "website",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | ${SITE_NAME}`,
      description,
      images: ogImages.slice(0, 1).map((i) => ({ url: i.url, alt: i.alt })),
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const category = product.categories[0];

  const [variations, relatedResult, reviews] = await Promise.all([
    product.type === "variable" ? getProductVariations(product.id) : Promise.resolve([]),
    product.related_ids.length > 0
      ? getProducts({ include: product.related_ids.slice(0, 4).join(","), per_page: 4 })
      : category
        ? getProducts({ category: String(category.id), per_page: 5, exclude: String(product.id) })
        : Promise.resolve({ data: [], totalPages: 0, total: 0 }),
    getProductReviews(product.id),
  ]);

  const relatedProducts = relatedResult.data.slice(0, 4);

  return (
    <>
      <ProductJsonLd product={product} reviews={reviews} />
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", href: "/" },
          ...(category
            ? [{ name: category.name, href: `/categorias/${category.slug}` }]
            : []),
          { name: product.name, href: `/producto/${slug}` },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-warm-400 mb-6" aria-label="Ruta de navegación">
          <ol className="flex items-center gap-2 flex-wrap">
            <li><a href="/" className="hover:text-burgundy-500 transition-colors">Inicio</a></li>
            {category && (
              <>
                <li aria-hidden>/</li>
                <li>
                  <a
                    href={`/categorias/${category.slug}`}
                    className="hover:text-burgundy-500 transition-colors"
                  >
                    {category.name}
                  </a>
                </li>
              </>
            )}
            <li aria-hidden>/</li>
            <li className="text-warm-700 font-medium truncate max-w-50">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <ProductGallery images={product.images} productName={product.name} />
          <ProductDetail product={product} variations={variations} />
        </div>

        <ProductReviews productId={product.id} />

        <RecentlyViewed
          current={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            image: product.images[0]?.src ?? "",
          }}
        />

        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-14 border-t border-warm-100">
            <div className="flex items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-rose-400 mb-1.5">
                  También te puede gustar
                </p>
                <h2 className="font-heading text-2xl sm:text-3xl text-warm-900">
                  {product.related_ids.length > 0
                    ? "Productos Relacionados"
                    : category
                      ? `Más de ${category.name}`
                      : "Más Productos"}
                </h2>
              </div>
              {category && (
                <a
                  href={`/categorias/${category.slug}`}
                  className="shrink-0 text-sm font-medium text-burgundy-500 hover:text-burgundy-700 transition-colors underline underline-offset-4"
                >
                  Ver colección →
                </a>
              )}
            </div>
            <ProductGrid products={relatedProducts} />
          </section>
        )}
      </div>
    </>
  );
}
