"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Check, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/store/cart";
import type { WooProduct, WooVariation } from "@/types/product";

interface AddToCartProps {
  product: WooProduct;
  selectedVariation: WooVariation | null;
  selectedSize: string;
}

export function AddToCart({
  product,
  selectedVariation,
  selectedSize,
}: AddToCartProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  // Reset quantity when the user switches size
  useEffect(() => {
    setQuantity(1);
  }, [selectedVariation?.id]);

  const isDisabled =
    product.type === "variable" && !selectedVariation;

  const outOfStock =
    selectedVariation
      ? selectedVariation.stock_status === "outofstock"
      : product.stock_status === "outofstock";

  const maxStock =
    selectedVariation?.stock_quantity ??
    product.stock_quantity ??
    99;

  function handleAddToCart() {
    if (isDisabled || outOfStock) return;

    const price = selectedVariation
      ? parseFloat(selectedVariation.price)
      : parseFloat(product.price);

    addItem({
      productId: product.id,
      variationId: selectedVariation?.id,
      name: product.name,
      price,
      size: selectedSize || "Única",
      quantity,
      image: product.images[0]?.src || "",
      slug: product.slug,
    });

    setAdded(true);
    setQuantity(1);
    setTimeout(() => setAdded(false), 2000);
  }

  if (outOfStock) {
    return (
      <button
        disabled
        className="w-full rounded-full bg-warm-200 px-8 py-4 text-sm font-semibold text-warm-400 cursor-not-allowed"
      >
        Agotado
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {/* Quantity stepper */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-warm-700">Cantidad</span>
        <div className="flex items-center border border-warm-200 rounded-full overflow-hidden">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Reducir cantidad"
            className="px-3 py-2 text-warm-600 hover:bg-warm-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-8 text-center text-sm font-semibold text-warm-900 select-none">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
            disabled={quantity >= maxStock}
            aria-label="Aumentar cantidad"
            className="px-3 py-2 text-warm-600 hover:bg-warm-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* At-limit notice */}
      {quantity >= maxStock && maxStock < 99 && (
        <p className="text-xs text-amber-600">
          Máximo disponible para esta talla
        </p>
      )}

      {/* Add to cart button */}
      <button
        onClick={handleAddToCart}
        disabled={isDisabled}
        className={`w-full flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-semibold transition-all ${
          added
            ? "bg-sage-300 text-white"
            : isDisabled
            ? "bg-warm-200 text-warm-400 cursor-not-allowed"
            : "bg-burgundy-500 text-white hover:bg-burgundy-600 active:scale-98"
        }`}
      >
        {added ? (
          <>
            <Check className="h-5 w-5" />
            Agregado al carrito
          </>
        ) : (
          <>
            <ShoppingBag className="h-5 w-5" />
            {isDisabled ? "Selecciona una talla" : "Agregar al carrito"}
          </>
        )}
      </button>
    </div>
  );
}
