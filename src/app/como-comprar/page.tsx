import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Cómo Comprar | ${SITE_NAME}`,
  description: `Aprende cómo comprar en ${SITE_NAME}. Proceso de compra fácil y seguro con envíos a toda Colombia.`,
  alternates: { canonical: `${SITE_URL}/como-comprar` },
  openGraph: {
    title: `¿Cómo Comprar? | ${SITE_NAME}`,
    description: `Comprar en Rosa Pastell es fácil: elige tu pijama, selecciona talla, paga online o por WhatsApp. Envíos a todo Colombia.`,
    url: `${SITE_URL}/como-comprar`,
  },
  twitter: {
    card: "summary_large_image",
    title: `¿Cómo Comprar? | ${SITE_NAME}`,
    description: `Proceso de compra sencillo con envíos a toda Colombia. Paga online o por transferencia.`,
  },
};

const steps = [
  {
    step: "01",
    title: "Elige tus pijamas",
    description:
      "Navega por nuestro catálogo y selecciona los productos que más te gusten. Filtra por categoría, talla o precio.",
  },
  {
    step: "02",
    title: "Selecciona tu talla",
    description:
      "Elige tu talla antes de agregar al carrito. Si tienes dudas, consúltanos por WhatsApp.",
  },
  {
    step: "03",
    title: "Finaliza tu compra",
    description:
      "Completa tus datos de envío. Puedes pagar en línea con tarjeta, PSE o Nequi, o por transferencia bancaria.",
  },
  {
    step: "04",
    title: "Recibe tu pedido",
    description:
      "Hacemos envíos a todo Colombia. Te notificamos cuando tu pedido sea despachado.",
  },
];

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: `Cómo comprar en ${SITE_NAME}`,
  description: `Pasos para comprar pijamas en ${SITE_NAME} con envío a toda Colombia.`,
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.description,
  })),
};

export default function ComoComprarPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <h1 className="font-heading text-4xl text-warm-900 mb-4">
        Cómo Comprar
      </h1>
      <p className="text-warm-500 mb-12">
        Comprar en Rosa Pastell es fácil, seguro y rápido.
      </p>

      <div className="space-y-8">
        {steps.map((step) => (
          <div key={step.step} className="flex gap-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
              <span className="text-sm font-bold text-rose-500">{step.step}</span>
            </div>
            <div>
              <h2 className="font-semibold text-warm-900 mb-1">{step.title}</h2>
              <p className="text-sm text-warm-600 leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-cream-100 rounded-2xl p-6">
        <h2 className="font-heading text-xl text-warm-900 mb-3">
          Métodos de pago
        </h2>
        <ul className="space-y-2 text-sm text-warm-600">
          <li>✦ <strong>Pago en línea:</strong> Tarjeta de crédito/débito, PSE, Nequi, Bancolombia</li>
          <li>✦ <strong>Transferencia bancaria:</strong> Envíanos tu comprobante por WhatsApp</li>
          <li>✦ <strong>Nequi:</strong> Transferencia rápida y confirmación inmediata</li>
        </ul>
      </div>

      <div className="mt-6 bg-cream-100 rounded-2xl p-6">
        <h2 className="font-heading text-xl text-warm-900 mb-3">Garantía</h2>
        <p className="text-sm text-warm-600 leading-relaxed">
          Todos nuestros productos tienen garantía. Si recibes un producto con
          defectos de fábrica, contáctanos por WhatsApp dentro de los 5 días
          hábiles siguientes a la recepción.
        </p>
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/categorias/pijama-victoria"
          className="inline-flex rounded-full bg-burgundy-500 px-8 py-3.5 text-sm font-semibold text-white hover:bg-burgundy-600 transition-colors"
        >
          Ver Catálogo
        </Link>
      </div>
    </div>
  );
}
