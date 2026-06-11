import Image from "next/image";
import Link from "next/link";
import type { WooProduct } from "@/types/product";
import { WishlistButton } from "./WishlistButton";
import { ProductPriceClient, ProductBadgeClient } from "./ProductPriceClient";

interface ProductCardProps {
  product: WooProduct;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const mainImage = product.images[0];
  const stock = product.stock_quantity;
  const lowStock = stock !== null && stock > 0 && stock <= 3;
  const lastUnit = stock === 1;

  // Fallback price for wishlist button (retail price)
  const displayPrice = product.on_sale && product.sale_price
    ? product.sale_price
    : product.price;

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgba(248,155,187,0.35)] transition-shadow duration-300">
      <Link href={`/producto/${product.slug}`} className="block">
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
          <ProductBadgeClient
            onSale={product.on_sale}
            salePrice={product.sale_price}
            wholesalePrice={product.wholesalePrice}
          />
          {lowStock && (
            <span className="absolute bottom-3 left-3 bg-amber-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {lastUnit ? "¡Última unidad!" : `Solo quedan ${stock}`}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-sm font-medium text-warm-800 line-clamp-2 group-hover:text-burgundy-500 transition-colors">
            {product.name}
          </h3>
          <ProductPriceClient
            price={product.price}
            regularPrice={product.regular_price}
            salePrice={product.sale_price}
            onSale={product.on_sale}
            wholesalePrice={product.wholesalePrice}
            wholesaleSalePrice={product.wholesaleSalePrice}
          />
          {product.attributes.some((a) => a.name.toLowerCase() === "talla") && (
            <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-burgundy-500 group-hover:text-burgundy-600 transition-colors">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0022 16z" />
                <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
                <line x1="12" y1="22.08" x2="12" y2="11.73" />
              </svg>
              Ver tallas disponibles
            </span>
          )}
        </div>
      </Link>
      <WishlistButton
        productId={product.id}
        name={product.name}
        slug={product.slug}
        price={String(displayPrice)}
        image={product.images[0]?.src || ""}
        className="absolute top-3 right-3 h-8 w-8 shadow-sm md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 transition-opacity"
      />
    </div>
  );
}
