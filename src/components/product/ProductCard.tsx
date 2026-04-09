"use client";

import Image from "next/image";
import Link from "next/link";
import type { WooProduct } from "@/types/product";
import { formatPrice } from "@/lib/formatters";
import { useAuthStore } from "@/store/auth";
import { WishlistButton } from "./WishlistButton";

interface ProductCardProps {
  product: WooProduct;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const isWholesale = useAuthStore((s) => s.user?.isWholesale ?? false);

  const mainImage = product.images[0];

  // Precio efectivo según rol
  const displayPrice = isWholesale && product.wholesalePrice !== null
    ? product.wholesaleSalePrice ?? product.wholesalePrice
    : product.on_sale && product.sale_price
    ? product.sale_price
    : product.price;

  const crossedPrice = isWholesale && product.wholesalePrice !== null
    ? product.wholesaleSalePrice !== null ? String(product.wholesalePrice) : null
    : product.on_sale && product.sale_price ? product.regular_price : null;

  const showWholesaleBadge = isWholesale && product.wholesalePrice !== null;
  const showSaleBadge = !isWholesale && product.on_sale && product.sale_price;

  const stock = product.stock_quantity;
  const lowStock = stock !== null && stock > 0 && stock <= 3;
  const lastUnit = stock === 1;

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgba(248,155,187,0.35)] transition-shadow duration-300"
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
        {/* Badges top-left: prioridad mayorista > oferta */}
        {showWholesaleBadge && (
          <span className="absolute top-3 left-3 bg-burgundy-700 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            Mayorista
          </span>
        )}
        {showSaleBadge && (
          <span className="absolute top-3 left-3 bg-burgundy-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            Oferta
          </span>
        )}
        {/* Badge stock bajo — esquina inferior izquierda */}
        {lowStock && (
          <span className="absolute bottom-3 left-3 bg-amber-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            {lastUnit ? "¡Última unidad!" : `Solo quedan ${stock}`}
          </span>
        )}
        {/* Wishlist — esquina superior derecha */}
        <WishlistButton
          productId={product.id}
          name={product.name}
          slug={product.slug}
          price={displayPrice}
          image={product.images[0]?.src || ""}
          className="absolute top-3 right-3 h-8 w-8 shadow-sm md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 transition-opacity"
        />
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium text-warm-800 line-clamp-2 group-hover:text-burgundy-500 transition-colors">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-base font-semibold text-burgundy-500">
            {formatPrice(displayPrice)}
          </span>
          {crossedPrice && (
            <span className="text-sm text-warm-400 line-through">
              {formatPrice(crossedPrice)}
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
