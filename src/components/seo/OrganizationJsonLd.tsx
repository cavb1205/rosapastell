import { SITE_NAME, SITE_URL, SOCIAL_LINKS, WHATSAPP_NUMBER } from "@/lib/constants";

export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness", "ClothingStore"],
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo-rosapastell.png`,
    image: `${SITE_URL}/logo-rosapastell.png`,
    description: "Tienda de pijamas para mujer en Ibagué, Colombia. Más de 10 años vistiendo tus sueños. Envíos a todo el país.",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ibagué",
      addressRegion: "Tolima",
      addressCountry: "CO",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 4.438889,
      longitude: -75.232222,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: `+${WHATSAPP_NUMBER}`,
        contactType: "customer service",
        contactOption: "TollFree",
        areaServed: "CO",
        availableLanguage: "Spanish",
      },
    ],
    sameAs: [
      SOCIAL_LINKS.facebook,
      SOCIAL_LINKS.instagram,
      SOCIAL_LINKS.tiktok,
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Pijamas para Mujer",
      url: `${SITE_URL}/colecciones`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
