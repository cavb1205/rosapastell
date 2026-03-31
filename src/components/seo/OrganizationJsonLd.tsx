import { SITE_NAME, SITE_URL, SOCIAL_LINKS } from "@/lib/constants";

export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+57-315-608-2381",
      contactType: "customer service",
      areaServed: "CO",
      availableLanguage: "Spanish",
    },
    sameAs: [SOCIAL_LINKS.facebook, SOCIAL_LINKS.instagram],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
