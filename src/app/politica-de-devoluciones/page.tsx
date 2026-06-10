import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Política de Cambios y Devoluciones | ${SITE_NAME}`,
  description: `Conoce nuestra política de cambios y devoluciones en ${SITE_NAME}. Tienes 5 días hábiles para solicitar un cambio por talla o color.`,
  alternates: { canonical: `${SITE_URL}/politica-de-devoluciones` },
  openGraph: {
    title: `Política de Cambios y Devoluciones | ${SITE_NAME}`,
    description: `Tienes 5 días hábiles para solicitar un cambio por talla o color. Conoce las condiciones.`,
    url: `${SITE_URL}/politica-de-devoluciones`,
  },
};

export default function PoliticaDevolucionesPage() {
  const updated = "9 de junio de 2026";

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-heading text-4xl text-warm-900 mb-2">
        Política de Cambios y Devoluciones
      </h1>
      <p className="text-xs text-warm-400 mb-12">Última actualización: {updated}</p>

      <div className="space-y-10 text-sm text-warm-600 leading-relaxed">

        <section>
          <h2 className="font-heading text-xl text-warm-900 mb-3">¿Puedo realizar un cambio?</h2>
          <p>
            Sí. En <strong className="text-warm-800">Rosa Pastell</strong> aceptamos cambios por talla o color
            dentro de los <strong className="text-warm-800">5 días hábiles</strong> siguientes a la fecha de
            recepción del pedido, siempre que se cumplan las condiciones descritas en esta política.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-warm-900 mb-3">Condiciones para el cambio</h2>
          <p className="mb-3">Para que tu solicitud de cambio sea aceptada, la prenda debe:</p>
          <ul className="space-y-2 pl-4">
            <li className="flex gap-2">
              <span className="text-burgundy-400 flex-shrink-0">✦</span>
              <span>Estar <strong className="text-warm-800">sin uso</strong> — no lavada, no estrenada.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-burgundy-400 flex-shrink-0">✦</span>
              <span>Conservar todas sus <strong className="text-warm-800">etiquetas originales</strong> intactas.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-burgundy-400 flex-shrink-0">✦</span>
              <span>Estar en su <strong className="text-warm-800">empaque original</strong>, en buen estado.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-burgundy-400 flex-shrink-0">✦</span>
              <span>La solicitud debe realizarse dentro de los <strong className="text-warm-800">5 días hábiles</strong> posteriores a la recepción.</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl text-warm-900 mb-3">Costo del envío</h2>
          <p>
            El costo del envío para el cambio <strong className="text-warm-800">corre por cuenta del cliente</strong>.
            Rosa Pastell no cubre los gastos de transporte generados por cambios de talla o color.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-warm-900 mb-3">Excepciones — cuándo no aplica el cambio</h2>
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 space-y-3">
            <p className="font-semibold text-warm-800">⚠️ Por disposición legal, los siguientes productos no tienen cambio ni devolución:</p>
            <ul className="space-y-2 pl-2">
              <li className="flex gap-2">
                <span className="text-burgundy-400 flex-shrink-0">✦</span>
                <span><strong className="text-warm-800">Prendas de uso personal</strong> (ropa interior, pijamas usadas, etc.), según el Estatuto del Consumidor colombiano.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-burgundy-400 flex-shrink-0">✦</span>
                <span><strong className="text-warm-800">Artículos en oferta o liquidación.</strong></span>
              </li>
              <li className="flex gap-2">
                <span className="text-burgundy-400 flex-shrink-0">✦</span>
                <span>Prendas que no cumplan con las condiciones descritas anteriormente (sin etiqueta, usadas o sin empaque).</span>
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="font-heading text-xl text-warm-900 mb-3">Defectos de fábrica</h2>
          <p>
            Si recibes un producto con un defecto de fabricación, contáctanos por WhatsApp
            dentro de los <strong className="text-warm-800">5 días hábiles</strong> siguientes a la recepción,
            con fotos del defecto. En ese caso, Rosa Pastell asume el costo del envío del cambio.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-warm-900 mb-3">¿Cómo solicitar un cambio?</h2>
          <ol className="space-y-3 pl-2">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-500">1</span>
              <span>Escríbenos por <strong className="text-warm-800">WhatsApp</strong> con tu número de pedido y el motivo del cambio.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-500">2</span>
              <span>Te confirmaremos la disponibilidad de la talla o color que necesitas.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-500">3</span>
              <span>Envía la prenda a la dirección que te indicaremos, en su empaque original con etiquetas.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-500">4</span>
              <span>Una vez recibamos y verifiquemos la prenda, enviamos el cambio.</span>
            </li>
          </ol>
        </section>

      </div>

      <div className="mt-12 bg-cream-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-warm-800 mb-1">¿Tienes dudas sobre tu pedido?</p>
          <p className="text-sm text-warm-500">Escríbenos por WhatsApp y te ayudamos.</p>
        </div>
        <Link
          href="/como-comprar"
          className="flex-shrink-0 rounded-full bg-burgundy-500 px-6 py-3 text-sm font-semibold text-white hover:bg-burgundy-600 transition-colors"
        >
          Cómo comprar
        </Link>
      </div>
    </div>
  );
}
