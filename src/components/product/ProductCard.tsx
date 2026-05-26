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
        <WishlistButton
          productId={product.id}
          name={product.name}
          slug={product.slug}
          price={String(displayPrice)}
          image={product.images[0]?.src || ""}
          className="absolute top-3 right-3 h-8 w-8 shadow-sm md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 transition-opacity"
        />
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
        {(() => {
          const sizes = product.inStockSizes
            ?? product.attributes.find((a) => a.name.toLowerCase() === "talla")?.options;
          return sizes && sizes.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {sizes.map((size) => (
                <span
                  key={size}
                  className="text-[11px] text-warm-500 border border-warm-200 rounded px-1.5 py-0.5"
                >
                  {size}
                </span>
              ))}
            </div>
          ) : null;
        })()}
      </div>
    </Link>
  );
}
