"use client";

import { useState } from "react";
import type { WooProduct, WooVariation } from "@/types/product";
import { formatPrice } from "@/lib/formatters";
import { SizeSelector } from "./SizeSelector";
import { AddToCart } from "./AddToCart";
import { WHATSAPP_URL } from "@/lib/constants";
import { MessageCircle } from "lucide-react";

interface ProductDetailProps {
  product: WooProduct;
  variations: WooVariation[];
}

export function ProductDetail({ product, variations }: ProductDetailProps) {
  const [selectedVariation, setSelectedVariation] = useState<WooVariation | null>(null);
  const [selectedSize, setSelectedSize] = useState("");

  function handleSizeSelect(variation: WooVariation, size: string) {
    setSelectedVariation(variation);
    setSelectedSize(size);
  }

  const displayPrice = selectedVariation?.price || product.price;
  const regularPrice = selectedVariation?.regular_price || product.regular_price;
  const onSale = selectedVariation?.on_sale ?? product.on_sale;

  return (
    <div className="flex flex-col">
      <h1 className="font-heading text-3xl sm:text-4xl text-warm-900 leading-tight">
        {product.name}
      </h1>

      {/* Price */}
      <div className="mt-4 flex items-baseline gap-3">
        <span className="text-3xl font-bold text-burgundy-500">
          {formatPrice(displayPrice)}
        </span>
        {onSale && regularPrice && regularPrice !== displayPrice && (
          <span className="text-lg text-warm-400 line-through">
            {formatPrice(regularPrice)}
          </span>
        )}
      </div>

      {/* Short description */}
      {product.short_description && (
        <div
          className="mt-4 text-sm text-warm-600 leading-relaxed prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: product.short_description }}
        />
      )}

      {/* Size selector */}
      {variations.length > 0 && (
        <div className="mt-6">
          <SizeSelector
            variations={variations}
            selectedVariation={selectedVariation}
            onSelect={handleSizeSelect}
          />
        </div>
      )}

      {/* Add to cart */}
      <div className="mt-6 space-y-3">
        <AddToCart
          product={product}
          selectedVariation={selectedVariation}
          selectedSize={selectedSize}
        />
        <a
          href={`${WHATSAPP_URL}?text=${encodeURIComponent(`Hola! Estoy interesada en: ${product.name}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 rounded-full border-2 border-[#25D366] px-8 py-4 text-sm font-semibold text-[#25D366] hover:bg-[#f0fdf4] transition-colors"
        >
          <MessageCircle className="h-5 w-5" />
          Consultar por WhatsApp
        </a>
      </div>

      {/* Description accordion */}
      {product.description && (
        <details className="mt-8 group border-t border-warm-100 pt-6">
          <summary className="flex items-center justify-between cursor-pointer text-sm font-semibold text-warm-700 list-none">
            Descripción del producto
            <span className="ml-2 text-warm-400 group-open:rotate-180 transition-transform">▾</span>
          </summary>
          <div
            className="mt-4 text-sm text-warm-600 leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </details>
      )}

      {/* SKU */}
      {product.sku && (
        <p className="mt-6 text-xs text-warm-400">SKU: {product.sku}</p>
      )}
    </div>
  );
}
