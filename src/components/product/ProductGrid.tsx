import type { WooProduct } from "@/types/product";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: WooProduct[];
  priorityCount?: number;
}

export function ProductGrid({
  products,
  priorityCount = 4,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-warm-500 text-lg">No se encontraron productos.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 gap-y-6">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < priorityCount}
        />
      ))}
    </div>
  );
}
