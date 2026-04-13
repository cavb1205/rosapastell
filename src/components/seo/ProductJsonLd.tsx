import type { WooProduct } from "@/types/product";
import type { WooReview } from "@/types/review";
import { SITE_URL, SITE_NAME } from "@/lib/constants";

interface ProductJsonLdProps {
  product: WooProduct;
  reviews?: WooReview[];
}

export function ProductJsonLd({ product, reviews }: ProductJsonLdProps) {
  const url = `${SITE_URL}/producto/${product.slug}`;

  // Precio válido por 30 días desde hoy (señal positiva para Google Shopping)
  const priceValidUntil = new Date();
  priceValidUntil.setDate(priceValidUntil.getDate() + 30);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_description
      ? product.short_description.replace(/<[^>]*>/g, "").trim()
      : product.name,
    image: product.images.map((img) => img.src),
    sku: product.sku || undefined,
    url,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    ...(product.categories.length > 0 && {
      category: product.categories.map((c) => c.name).join(" > "),
    }),
    ...(reviews && reviews.length > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1),
        reviewCount: reviews.length,
        bestRating: 5,
        worstRating: 1,
      },
      review: reviews.slice(0, 5).map((r) => ({
        "@type": "Review",
        author: { "@type": "Person", name: r.reviewer },
        datePublished: r.date_created,
        reviewBody: r.review.replace(/<[^>]*>/g, "").trim(),
        reviewRating: {
          "@type": "Rating",
          ratingValue: r.rating,
          bestRating: 5,
          worstRating: 1,
        },
      })),
    }),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "COP",
      price: product.price,
      priceValidUntil: priceValidUntil.toISOString().split("T")[0],
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.stock_status === "instock"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
