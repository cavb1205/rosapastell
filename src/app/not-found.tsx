import Link from "next/link";
import { Search } from "lucide-react";
// Esta frontera también puede prepararse en rutas válidas: mantenerla sin
// consultas evita trabajo de WooCommerce que no es necesario para navegar.
export default function NotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">

      {/* Hero */}
      <div className="text-center max-w-lg mx-auto mb-14">
        <p className="font-heading text-8xl text-burgundy-200 leading-none select-none">404</p>
        <h1 className="font-heading text-3xl text-warm-900 mt-2 mb-3">
          Página no encontrada
        </h1>
        <p className="text-warm-500 mb-8">
          La página que buscas no existe o fue movida. Puedes buscar lo que necesitas o explorar nuestras colecciones.
        </p>

        {/* Buscador */}
        <form action="/buscar" method="get" className="relative max-w-sm mx-auto">
          <Search aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400 pointer-events-none" />
          <input
            type="search"
            name="q"
            aria-label="Buscar productos"
            placeholder="Buscar pijamas..."
            className="w-full rounded-full border border-warm-200 bg-white pl-11 pr-5 py-3 text-sm text-warm-800 focus:outline-none focus:ring-2 focus:ring-burgundy-200 hover:border-warm-300 transition-colors"
          />
        </form>
      </div>

      {/* Links de navegación */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-12">
        <Link
          href="/"
          prefetch={false}
          className="inline-flex justify-center rounded-full bg-burgundy-500 px-6 py-3 text-sm font-semibold text-white hover:bg-burgundy-600 transition-colors"
        >
          Ir al inicio
        </Link>
        <Link
          href="/colecciones"
          prefetch={false}
          className="inline-flex justify-center rounded-full border border-warm-200 px-6 py-3 text-sm font-semibold text-warm-600 hover:bg-warm-50 transition-colors"
        >
          Ver colecciones
        </Link>
      </div>
    </div>
  );
}
