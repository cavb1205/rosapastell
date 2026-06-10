import { SITE_NAME, SITE_URL } from "@/lib/constants";

/**
 * Schema WebSite con SearchAction — habilita la caja de búsqueda de sitelinks
 * en los resultados de Google. El target apunta a /buscar?q={término}.
 */
export function WebsiteJsonLd() {
  const base = SITE_URL.replace(/\/$/, "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: base,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${base}/buscar?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
