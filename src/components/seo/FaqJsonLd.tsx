interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Schema FAQPage — habilita rich results de preguntas frecuentes en Google.
 * IMPORTANTE: las preguntas/respuestas deben ser visibles en la página
 * (política de Google), no solo en el structured data.
 */
export function FaqJsonLd({ items }: { items: FaqItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
