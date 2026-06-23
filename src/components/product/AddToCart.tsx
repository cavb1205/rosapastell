"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Check, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";
import { useStoreStatus } from "@/components/StoreStatusProvider";
import type { WooProduct, WooVariation, WooAttribute } from "@/types/product";
import { buildCartAttributes, getSizeFromVariation, variantText } from "@/lib/variations";

interface AddToCartProps {
  product: WooProduct;
  axes: WooAttribute[];
  selection: Record<string, string>;
  selectedVariation: WooVariation | null;
}

export function AddToCart({
  product,
  axes,
  selection,
  selectedVariation,
}: AddToCartProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const showCartToast = useUIStore((s) => s.showCartToast);
  const isWholesale = useAuthStore((s) => s.user?.isWholesale ?? false);
  const { paused, message } = useStoreStatus();

  // Reset quantity when the user switches size
  useEffect(() => {
    setQuantity(1);
  }, [selectedVariation?.id]);

  const isDisabled =
    product.type === "variable" && !selectedVariation;

  // Ejes aún sin elegir → mensaje "Selecciona talla y color"
  const missingAxes = axes.filter(
    (a) => !selection[a.name.trim().toLowerCase()]
  );
  const missingLabel = missingAxes
    .map((a) => a.name.toLowerCase())
    .join(" y ");

  const outOfStock =
    selectedVariation
      ? selectedVariation.stock_status === "outofstock"
      : product.stock_status === "outofstock";

  const totalStock =
    selectedVariation?.stock_quantity ??
    product.stock_quantity ??
    99;

  // Cantidad ya en el carrito para este producto/variación
  const currentInCart = cartItems.find(
    (i) =>
      i.productId === product.id &&
      i.variationId === (selectedVariation?.id ?? i.variationId)
  )?.quantity ?? 0;

  // Stock restante disponible para agregar
  const maxAddable = Math.max(0, totalStock - currentInCart);
  const atStockLimit = maxAddable === 0;

  // Clampear cantidad si el stock disponible baja (ej: después de agregar al carrito)
  useEffect(() => {
    setQuantity((q) => Math.min(q, Math.max(1, maxAddable)));
  }, [maxAddable]);

  function handleAddToCart() {
    if (paused || isDisabled || outOfStock || atStockLimit) return;

    const source = selectedVariation ?? product;
    const price =
      isWholesale && source.wholesalePrice !== null
        ? (source.wholesaleSalePrice ?? source.wholesalePrice)
        : parseFloat(source.price);

    const size = getSizeFromVariation(selectedVariation);
    const attributes = selectedVariation
      ? buildCartAttributes(axes, selectedVariation)
      : undefined;
    // Imagen de la variación (color) si tiene una propia, si no la principal
    const image = selectedVariation?.image?.src || product.images[0]?.src || "";

    addItem({
      productId: product.id,
      variationId: selectedVariation?.id,
      name: product.name,
      price,
      size,
      attributes,
      quantity,
      image,
      slug: product.slug,
      stockQuantity: totalStock < 99 ? totalStock : undefined,
    });

    showCartToast({
      name: product.name,
      size,
      variant: attributes ? variantText(attributes) : undefined,
      quantity,
      image,
    });
    setAdded(true);
    setQuantity(1);
    setTimeout(() => setAdded(false), 2000);
  }

  // Tienda en pausa (lanzamiento de colección): prevalece sobre el resto de
  // estados. Se muestran los productos pero no se puede comprar todavía.
  if (paused) {
    return (
      <div className="space-y-2">
        <button
          disabled
          className="w-full rounded-full bg-warm-200 px-8 py-4 text-sm font-semibold text-warm-500 cursor-not-allowed"
        >
          Próximamente
        </button>
        {message ? (
          <p className="text-xs text-warm-500 text-center">{message}</p>
        ) : null}
      </div>
    );
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
            className="h-10 w-10 flex items-center justify-center text-warm-600 hover:bg-warm-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-sm font-semibold text-warm-900 select-none">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(maxAddable, q + 1))}
            disabled={quantity >= maxAddable}
            aria-label="Aumentar cantidad"
            className="h-10 w-10 flex items-center justify-center text-warm-600 hover:bg-warm-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* At-limit notice */}
      {atStockLimit ? (
        <p className="text-xs text-amber-600">
          Ya tienes todas las unidades disponibles en tu carrito
        </p>
      ) : maxAddable < totalStock && totalStock < 99 ? (
        <p className="text-xs text-amber-600">
          Ya tienes {currentInCart} en tu carrito — quedan {maxAddable} disponibles
        </p>
      ) : quantity >= maxAddable && maxAddable < 99 ? (
        <p className="text-xs text-amber-600">
          Máximo disponible para esta talla
        </p>
      ) : null}

      {/* Add to cart button */}
      <button
        onClick={handleAddToCart}
        disabled={isDisabled || atStockLimit}
        className={`w-full flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-semibold transition-all ${
          added
            ? "bg-sage-300 text-white"
            : isDisabled || atStockLimit
            ? "bg-warm-200 text-warm-400 cursor-not-allowed"
            : "bg-burgundy-500 text-white hover:bg-burgundy-600 active:scale-98"
        }`}
      >
        {added ? (
          <>
            <Check className="h-5 w-5" />
            Agregado al carrito
          </>
        ) : atStockLimit ? (
          "Stock máximo en carrito"
        ) : (
          <>
            <ShoppingBag className="h-5 w-5" />
            {isDisabled
              ? `Selecciona ${missingLabel || "una opción"}`
              : "Agregar al carrito"}
          </>
        )}
      </button>
    </div>
  );
}
