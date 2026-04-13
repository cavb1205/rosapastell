import type { WooReview } from "@/types/review";

const WP_URL = process.env.WOOCOMMERCE_URL!;
const CK = process.env.WOOCOMMERCE_CONSUMER_KEY!;
const CS = process.env.WOOCOMMERCE_CONSUMER_SECRET!;

export async function getProductReviews(productId: number): Promise<WooReview[]> {
  try {
    const res = await fetch(
      `${WP_URL}/wp-json/wc/v3/products/reviews?status=approved&product=${productId}&per_page=20&consumer_key=${CK}&consumer_secret=${CS}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getFeaturedReviews(limit = 12): Promise<WooReview[]> {
  try {
    const res = await fetch(
      `${WP_URL}/wp-json/wc/v3/products/reviews?status=approved&per_page=${limit}&orderby=date_gmt&order=desc&consumer_key=${CK}&consumer_secret=${CS}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const data: WooReview[] = await res.json();
    // Solo mostrar reseñas con 4+ estrellas y que tengan texto
    return data.filter((r) => r.rating >= 4 && r.review.trim().length > 10);
  } catch {
    return [];
  }
}
