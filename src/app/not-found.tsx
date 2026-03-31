import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="font-heading text-6xl text-rose-300 mb-4">404</h1>
      <h2 className="font-heading text-2xl text-warm-900 mb-3">
        Página no encontrada
      </h2>
      <p className="text-warm-500 mb-8">
        La página que buscas no existe o fue movida.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="inline-flex rounded-full bg-burgundy-500 px-6 py-3 text-sm font-semibold text-white hover:bg-burgundy-600 transition-colors"
        >
          Ir al inicio
        </Link>
        <Link
          href="/categorias/pijama-victoria"
          className="inline-flex rounded-full border border-warm-200 px-6 py-3 text-sm font-semibold text-warm-600 hover:bg-warm-50 transition-colors"
        >
          Ver productos
        </Link>
      </div>
    </div>
  );
}
