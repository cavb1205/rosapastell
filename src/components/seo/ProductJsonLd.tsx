import type { WooProduct } from "@/types/product";
import { SITE_URL, SITE_NAME } from "@/lib/constants";

interface ProductJsonLdProps {
  product: WooProduct;
}

export function ProductJsonLd({ product }: ProductJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_description.replace(/<[^>]*>/g, ""),
    image: product.images.map((img) => img.src),
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/producto/${product.slug}`,
      priceCurrency: "COP",
      price: product.price,
      availability:
        product.stock_status === "instock"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
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
