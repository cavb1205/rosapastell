"use client";

import { useAuthStore } from "@/store/auth";
import { formatPrice } from "@/lib/formatters";

interface ProductPriceClientProps {
  price: string;
  regularPrice: string;
  salePrice: string;
  onSale: boolean;
  wholesalePrice: number | null;
  wholesaleSalePrice: number | null;
}

export function ProductPriceClient({
  price,
  regularPrice,
  salePrice,
  onSale,
  wholesalePrice,
  wholesaleSalePrice,
}: ProductPriceClientProps) {
  const isWholesale = useAuthStore((s) => s.user?.isWholesale ?? false);

  const displayPrice = isWholesale && wholesalePrice !== null
    ? wholesaleSalePrice ?? wholesalePrice
    : onSale && salePrice
    ? salePrice
    : price;

  const crossedPrice = isWholesale && wholesalePrice !== null
    ? wholesaleSalePrice !== null ? String(wholesalePrice) : null
    : onSale && salePrice ? regularPrice : null;

  return (
    <div className="mt-2 flex items-center gap-2">
      <span className="text-base font-semibold text-burgundy-700">
        {formatPrice(displayPrice)}
      </span>
      {crossedPrice && (
        <span className="text-sm text-warm-400 line-through">
          {formatPrice(crossedPrice)}
        </span>
      )}
    </div>
  );
}

export function ProductBadgeClient({
  onSale,
  salePrice,
  wholesalePrice,
}: {
  onSale: boolean;
  salePrice: string;
  wholesalePrice: number | null;
}) {
  const isWholesale = useAuthStore((s) => s.user?.isWholesale ?? false);

  if (isWholesale && wholesalePrice !== null) {
    return (
      <span className="absolute top-3 left-3 bg-burgundy-700 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
        Mayorista
      </span>
    );
  }

  if (!isWholesale && onSale && salePrice) {
    return (
      <span className="absolute top-3 left-3 bg-burgundy-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
        Oferta
      </span>
    );
  }

  return null;
}
