import { getCategories, getProducts } from "@/lib/woocommerce";
import { getFeaturedReviews } from "@/lib/reviews";
import { HeroBanner } from "@/components/home/HeroBanner";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { NewArrivals } from "@/components/home/NewArrivals";
import { ReviewsCarousel } from "@/components/home/ReviewsCarousel";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";

export const revalidate = 300;

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
    .slice(0, 8);

  return (
    <>
      <OrganizationJsonLd />
      <HeroBanner />
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
