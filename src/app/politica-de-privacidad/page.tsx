import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Política de Privacidad | ${SITE_NAME}`,
  description: `Conoce cómo ${SITE_NAME} recopila, usa y protege tu información personal.`,
  openGraph: {
    title: `Política de Privacidad | ${SITE_NAME}`,
    description: `Conoce cómo ${SITE_NAME} recopila, usa y protege tu información personal.`,
    url: "/politica-de-privacidad",
  },
};

export default function PrivacyPage() {
  const updated = "2 de abril de 2026";

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-heading text-4xl text-warm-900 mb-2">
        Política de Privacidad
      </h1>
      <p className="text-xs text-warm-400 mb-12">Última actualización: {updated}</p>

      <div className="space-y-10 text-sm text-warm-600 leading-relaxed">

        <section>
          <h2 className="font-heading text-xl text-warm-900 mb-3">1. Responsable del tratamiento</h2>
          <p>
            <strong className="text-warm-800">Rosa Pastell</strong> es responsable del tratamiento de los datos
            personales que recopila a través del sitio web{" "}
            <span className="text-burgundy-500">{SITE_URL}</span> y sus canales de atención.
            Para cualquier consulta relacionada con el tratamiento de tus datos puedes
            contactarnos a través de WhatsApp o al correo electrónico de la tienda.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-warm-900 mb-3">2. Datos que recopilamos</h2>
          <p className="mb-3">Recopilamos únicamente los datos necesarios para procesar tus pedidos y brindarte una mejor experiencia:</p>
          <ul className="space-y-2 pl-4">
            <li className="flex gap-2"><span className="text-burgundy-400 flex-shrink-0">✦</span> <span><strong className="text-warm-800">Datos de contacto:</strong> nombre, apellido, correo electrónico y número de teléfono.</span></li>
            <li className="flex gap-2"><span className="text-burgundy-400 flex-shrink-0">✦</span> <span><strong className="text-warm-800">Datos de envío:</strong> dirección, ciudad, departamento y código postal.</span></li>
            <li className="flex gap-2"><span className="text-burgundy-400 flex-shrink-0">✦</span> <span><strong className="text-warm-800">Datos de la cuenta:</strong> si te registras, guardamos tu nombre, email y contraseña cifrada.</span></li>
            <li className="flex gap-2"><span className="text-burgundy-400 flex-shrink-0">✦</span> <span><strong className="text-warm-800">Datos de navegación:</strong> páginas visitadas, productos vistos y acciones en el sitio (a través de cookies).</span></li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl text-warm-900 mb-3">3. Finalidad del tratamiento</h2>
          <p className="mb-3">Usamos tus datos para:</p>
          <ul className="space-y-2 pl-4">
            <li className="flex gap-2"><span className="text-burgundy-400 flex-shrink-0">✦</span> Procesar y gestionar tus pedidos.</li>
            <li className="flex gap-2"><span className="text-burgundy-400 flex-shrink-0">✦</span> Coordinar el envío y entrega de tus productos.</li>
            <li className="flex gap-2"><span className="text-burgundy-400 flex-shrink-0">✦</span> Enviarte confirmaciones y actualizaciones sobre tu pedido.</li>
            <li className="flex gap-2"><span className="text-burgundy-400 flex-shrink-0">✦</span> Atender tus solicitudes, preguntas o reclamaciones.</li>
            <li className="flex gap-2"><span className="text-burgundy-400 flex-shrink-0">✦</span> Mejorar la experiencia de navegación en el sitio.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl text-warm-900 mb-3">4. Base legal</h2>
          <p>
            El tratamiento de tus datos se realiza con base en el consentimiento que otorgas
            al registrarte, realizar una compra o navegar el sitio, y en el cumplimiento de
            la relación contractual generada por tu pedido. Rosa Pastell cumple con la{" "}
            <strong className="text-warm-800">Ley 1581 de 2012</strong> (Ley de Protección de
            Datos Personales de Colombia) y sus decretos reglamentarios.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-warm-900 mb-3">5. Compartir información con terceros</h2>
          <p className="mb-3">
            No vendemos ni cedemos tus datos personales a terceros. Solo los compartimos
            cuando es estrictamente necesario para completar tu pedido:
          </p>
          <ul className="space-y-2 pl-4">
            <li className="flex gap-2"><span className="text-burgundy-400 flex-shrink-0">✦</span> <strong className="text-warm-800">Operadores logísticos</strong> (Envía u otros) para gestionar la entrega.</li>
            <li className="flex gap-2"><span className="text-burgundy-400 flex-shrink-0">✦</span> <strong className="text-warm-800">Plataformas de comunicación</strong> (WhatsApp Business) para confirmar pedidos.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl text-warm-900 mb-3">6. Conservación de datos</h2>
          <p>
            Conservamos tus datos mientras mantengas una cuenta activa o durante el tiempo
            necesario para cumplir con obligaciones legales y fiscales. Si solicitas la
            eliminación de tu cuenta, borraremos tus datos personales en un plazo máximo
            de 30 días hábiles, salvo que la ley exija conservarlos.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-warm-900 mb-3">7. Tus derechos</h2>
          <p className="mb-3">
            De acuerdo con la Ley 1581 de 2012, tienes derecho a:
          </p>
          <ul className="space-y-2 pl-4">
            <li className="flex gap-2"><span className="text-burgundy-400 flex-shrink-0">✦</span> <strong className="text-warm-800">Conocer</strong> los datos que tenemos sobre ti.</li>
            <li className="flex gap-2"><span className="text-burgundy-400 flex-shrink-0">✦</span> <strong className="text-warm-800">Actualizar y rectificar</strong> tu información cuando sea inexacta.</li>
            <li className="flex gap-2"><span className="text-burgundy-400 flex-shrink-0">✦</span> <strong className="text-warm-800">Solicitar la supresión</strong> de tus datos cuando no sean necesarios.</li>
            <li className="flex gap-2"><span className="text-burgundy-400 flex-shrink-0">✦</span> <strong className="text-warm-800">Revocar el consentimiento</strong> otorgado para el tratamiento.</li>
            <li className="flex gap-2"><span className="text-burgundy-400 flex-shrink-0">✦</span> <strong className="text-warm-800">Presentar quejas</strong> ante la Superintendencia de Industria y Comercio (SIC).</li>
          </ul>
          <p className="mt-3">
            Para ejercer cualquiera de estos derechos, contáctanos por WhatsApp o al correo
            electrónico de la tienda indicando tu solicitud.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-warm-900 mb-3">8. Cookies</h2>
          <p>
            Utilizamos cookies propias para mantener tu sesión activa y recordar los
            productos en tu carrito. No utilizamos cookies de publicidad de terceros.
            Puedes desactivar las cookies desde la configuración de tu navegador, aunque
            esto puede afectar el funcionamiento del carrito y el inicio de sesión.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-warm-900 mb-3">9. Seguridad</h2>
          <p>
            Aplicamos medidas técnicas y organizativas para proteger tu información:
            conexión cifrada (HTTPS), contraseñas almacenadas con hash seguro y acceso
            restringido a los datos. Sin embargo, ningún sistema es 100% infalible; te
            recomendamos usar contraseñas seguras y únicas.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-warm-900 mb-3">10. Cambios a esta política</h2>
          <p>
            Podemos actualizar esta política cuando sea necesario. Te informaremos de
            cambios significativos mediante un aviso en el sitio. El uso continuado del
            sitio después de la actualización implica la aceptación de la nueva versión.
          </p>
        </section>

      </div>

      <div className="mt-12 bg-cream-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-warm-800 mb-1">¿Tienes preguntas sobre tus datos?</p>
          <p className="text-sm text-warm-500">Escríbenos por WhatsApp y te respondemos.</p>
        </div>
        <Link
          href="/como-comprar"
          className="flex-shrink-0 rounded-full bg-burgundy-500 px-6 py-3 text-sm font-semibold text-white hover:bg-burgundy-600 transition-colors"
        >
          Contactarnos
        </Link>
      </div>
    </div>
  );
}
