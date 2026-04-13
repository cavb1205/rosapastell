import Link from "next/link";
import type { WooProduct } from "@/types/product";
import { ProductGrid } from "@/components/product/ProductGrid";

interface NewArrivalsProps {
  products: WooProduct[];
}

export function NewArrivals({ products }: NewArrivalsProps) {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-heading text-3xl sm:text-4xl text-warm-900">
              Nuevos Productos
            </h2>
            <p className="mt-2 text-warm-500">
              Lo más reciente de nuestra tienda
            </p>
          </div>
          <Link
            href="/colecciones"
            className="hidden sm:inline-flex text-sm font-medium text-burgundy-500 hover:text-burgundy-600 transition-colors"
          >
            Ver todo &rarr;
          </Link>
        </div>
        <ProductGrid products={products} />
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/colecciones"
            className="inline-flex text-sm font-medium text-burgundy-700 hover:text-burgundy-800 transition-colors"
          >
            Ver todos los productos &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
