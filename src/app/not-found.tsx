import Link from "next/link";
import { Search } from "lucide-react";
import { getProducts, getCategories } from "@/lib/woocommerce";
import { ProductCard } from "@/components/product/ProductCard";

export default async function NotFound() {
  const [productsResult, categories] = await Promise.all([
    getProducts({ per_page: 4, orderby: "popularity", order: "desc" }).catch(() => ({
      data: [],
      totalPages: 0,
      total: 0,
    })),
    getCategories({ parent: 0 }).catch(() => []),
  ]);

  const topCategories = categories
    .filter((c) => c.count > 0 && c.slug !== "uncategorized")
    .slice(0, 5);

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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400 pointer-events-none" />
          <input
            type="search"
            name="q"
            placeholder="Buscar pijamas..."
            className="w-full rounded-full border border-warm-200 bg-white pl-11 pr-5 py-3 text-sm text-warm-800 focus:outline-none focus:ring-2 focus:ring-burgundy-200 hover:border-warm-300 transition-colors"
          />
        </form>
      </div>

      {/* Categorías rápidas */}
      {topCategories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-14">
          {topCategories.map((c) => (
            <Link
              key={c.id}
              href={`/categorias/${c.slug}`}
              className="text-sm px-4 py-2 rounded-full border border-warm-200 text-warm-600 hover:border-burgundy-300 hover:text-burgundy-500 transition-colors"
            >
              {c.name}
            </Link>
          ))}
          <Link
            href="/colecciones"
            className="text-sm px-4 py-2 rounded-full bg-burgundy-50 border border-burgundy-200 text-burgundy-600 hover:bg-burgundy-100 transition-colors"
          >
            Ver todas →
          </Link>
        </div>
      )}

      {/* Productos populares */}
      {productsResult.data.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-burgundy-400 text-center mb-2">
            Mientras tanto
          </p>
          <h2 className="font-heading text-2xl text-warm-900 text-center mb-8">
            Productos Populares
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {productsResult.data.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 2} />
            ))}
          </div>
        </div>
      )}

      {/* Links de navegación */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-12">
        <Link
          href="/"
          className="inline-flex justify-center rounded-full bg-burgundy-500 px-6 py-3 text-sm font-semibold text-white hover:bg-burgundy-600 transition-colors"
        >
          Ir al inicio
        </Link>
        <Link
          href="/colecciones"
          className="inline-flex justify-center rounded-full border border-warm-200 px-6 py-3 text-sm font-semibold text-warm-600 hover:bg-warm-50 transition-colors"
        >
          Ver colecciones
        </Link>
      </div>
    </div>
  );
}
