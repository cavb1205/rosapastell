import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Nosotros | ${SITE_NAME}`,
  description: `Conoce la historia de ${SITE_NAME}, más de 10 años vistiendo los sueños de las mujeres colombianas con pijamas de calidad.`,
};

export default function NosotrosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-heading text-4xl text-warm-900 mb-6">
        Sobre Rosa Pastell
      </h1>
      <div className="prose prose-warm max-w-none">
        <p className="text-lg text-warm-600 leading-relaxed mb-6">
          Somos una tienda colombiana especializada en pijamas para mujer, ubicada en
          Ibagué, Tolima. Con más de 10 años en el mercado, hemos vestido los sueños
          de miles de mujeres en todo el país.
        </p>
        <h2 className="font-heading text-2xl text-warm-900 mt-8 mb-3">
          Nuestra Misión
        </h2>
        <p className="text-warm-600 leading-relaxed">
          Ofrecer pijamas de alta calidad con diseños únicos y precios accesibles,
          para que cada noche sea un momento de confort y estilo.
        </p>
        <h2 className="font-heading text-2xl text-warm-900 mt-8 mb-3">
          Nuestra Visión
        </h2>
        <p className="text-warm-600 leading-relaxed">
          Ser la marca de pijamas preferida por las mujeres colombianas, reconocida
          por la calidad de nuestros productos y la excelencia en el servicio al cliente.
        </p>
        <h2 className="font-heading text-2xl text-warm-900 mt-8 mb-3">
          ¿Por qué elegirnos?
        </h2>
        <ul className="space-y-2 text-warm-600">
          <li>✦ Más de 10 años de experiencia en el mercado colombiano</li>
          <li>✦ Diseños exclusivos y materiales de calidad</li>
          <li>✦ Envíos a todo el territorio nacional</li>
          <li>✦ Atención personalizada por WhatsApp</li>
          <li>✦ Garantía en todos nuestros productos</li>
        </ul>
      </div>
    </div>
  );
}
