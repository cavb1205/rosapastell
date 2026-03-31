import Image from "next/image";
import Link from "next/link";
import type { WooProduct } from "@/types/product";
import { formatPrice } from "@/lib/formatters";

interface ProductCardProps {
  product: WooProduct;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const mainImage = product.images[0];
  const hasDiscount = product.on_sale && product.sale_price;

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-square overflow-hidden bg-cream-100">
        {mainImage ? (
          <Image
            src={mainImage.src}
            alt={mainImage.alt || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-warm-300">
            <span className="text-sm">Sin imagen</span>
          </div>
        )}
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-burgundy-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            Oferta
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium text-warm-800 line-clamp-2 group-hover:text-burgundy-500 transition-colors">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-base font-semibold text-burgundy-500">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-warm-400 line-through">
              {formatPrice(product.regular_price)}
            </span>
          )}
        </div>
        {product.attributes.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {product.attributes
              .find((a) => a.name.toLowerCase() === "talla")
              ?.options.map((size) => (
                <span
                  key={size}
                  className="text-[11px] text-warm-500 border border-warm-200 rounded px-1.5 py-0.5"
                >
                  {size}
                </span>
              ))}
          </div>
        )}
      </div>
    </Link>
  );
}
