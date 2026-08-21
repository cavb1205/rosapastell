import type { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/woocommerce";
import { getFeaturedReviews } from "@/lib/reviews";
import { HeroBanner } from "@/components/home/HeroBanner";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { NewArrivals } from "@/components/home/NewArrivals";
import { ReviewsCarousel } from "@/components/home/ReviewsCarousel";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";
import { WebsiteJsonLd } from "@/components/seo/WebsiteJsonLd";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/lib/constants";

export const revalidate = 300;

export const metadata: Metadata = {
  title: `${SITE_NAME} | Pijamas para Mujer en Colombia`,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: `${SITE_NAME} | Pijamas para Mujer en Colombia`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Pijamas para Mujer en Colombia`,
    description: SITE_DESCRIPTION,
  },
};

export default async function HomePage() {
  const [categoriesResult, newArrivalsResult, reviews] = await Promise.all([
    getCategories({ parent: 0 }).catch(() => [] as Awaited<ReturnType<typeof getCategories>>),
    getProducts({ orderby: "date", order: "desc", per_page: 8 }).catch(() => ({
      data: [],
      totalPages: 0,
      total: 0,
    })),
    getFeaturedReviews(12).catch(() => []),
  ]);

  const mainCategories = categoriesResult
    .filter((c) => c.count > 0 && c.slug !== "uncategorized")

  return (
    <>
      <OrganizationJsonLd />
      <WebsiteJsonLd />
      <HeroBanner />

      {/* Intro con H1 — contenido textual indexable para SEO */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-2 pb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-rose-400 mb-2">
          Más de 10 años vistiendo tus sueños
        </p>
        <h1 className="font-heading text-3xl sm:text-4xl text-warm-900">
          Pijamas para Mujer en Colombia
        </h1>
        <p className="mt-3 text-warm-500 text-sm sm:text-base leading-relaxed">
          En Rosa Pastell diseñamos pijamas suaves, femeninas y de la mejor
          calidad para acompañar tu descanso. Encuentra una amplia variedad de
          estilos, tallas y colores, con envíos a todo el país y atención al por
          mayor.
        </p>
      </section>

      {mainCategories.length > 0 && (
        <CategoryShowcase categories={mainCategories} />
      )}
      {newArrivalsResult.data.length > 0 && (
        <NewArrivals products={newArrivalsResult.data} />
      )}
      <ReviewsCarousel reviews={reviews} />
    </>
  );
}
