import Link from "next/link";

export function HeroBanner() {
  return (
    <section className="relative bg-gradient-to-br from-rose-50 via-cream-100 to-rose-100 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-rose-500 mb-3">
            Más de 10 años vistiendo tus sueños
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-warm-900 leading-tight">
            Pijamas con estilo y comodidad
          </h1>
          <p className="mt-4 text-lg text-warm-600 max-w-lg leading-relaxed">
            Descubre nuestra colección de pijamas diseñadas para tu descanso.
            Envíos a toda Colombia.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/colecciones"
              className="inline-flex items-center justify-center rounded-full bg-burgundy-500 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-burgundy-600 transition-colors"
            >
              Ver Colecciones
            </Link>
            <Link
              href="/como-comprar"
              className="inline-flex items-center justify-center rounded-full border-2 border-burgundy-500 px-8 py-3.5 text-sm font-semibold text-burgundy-500 hover:bg-burgundy-50 transition-colors"
            >
              Cómo Comprar
            </Link>
          </div>
        </div>
      </div>
      {/* Decorative element */}
      <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-rose-200/30 blur-3xl" />
      <div className="absolute -right-10 bottom-0 h-60 w-60 rounded-full bg-cream-200/40 blur-2xl" />
    </section>
  );
}
