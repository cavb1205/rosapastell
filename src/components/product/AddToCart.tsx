"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
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
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const isDisabled =
    product.type === "variable" && !selectedVariation;

  const outOfStock =
    selectedVariation
      ? selectedVariation.stock_status === "outofstock"
      : product.stock_status === "outofstock";

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
      quantity: 1,
      image: product.images[0]?.src || "",
      slug: product.slug,
    });

    setAdded(true);
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
  );
}
