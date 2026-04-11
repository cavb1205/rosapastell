"use client";

import { useState } from "react";
import type { WooVariation } from "@/types/product";
import { SizeGuideModal } from "./SizeGuideModal";

interface SizeSelectorProps {
  variations: WooVariation[];
  selectedVariation: WooVariation | null;
  onSelect: (variation: WooVariation, size: string) => void;
}

export function SizeSelector({
  variations,
  selectedVariation,
  onSelect,
}: SizeSelectorProps) {
  const [guideOpen, setGuideOpen] = useState(false);
  const lowStockThreshold = 5;
  const selectedStock = selectedVariation?.stock_quantity ?? null;
  const showLowStock =
    selectedVariation &&
    selectedVariation.stock_status !== "outofstock" &&
    selectedStock !== null &&
    selectedStock <= lowStockThreshold &&
    selectedStock > 0;

  return (
    <div>
      {guideOpen && <SizeGuideModal onClose={() => setGuideOpen(false)} />}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-warm-700">Talla</h3>
          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            className="text-xs text-burgundy-500 hover:text-burgundy-700 underline underline-offset-2 transition-colors"
          >
            ¿Cuál es tu talla?
          </button>
        </div>
        {showLowStock ? (
          <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            {selectedStock === 1 ? "¡Última unidad!" : `Solo quedan ${selectedStock}`}
          </span>
        ) : selectedVariation ? (
          <span className="text-sm text-warm-500">
            {
              selectedVariation.attributes.find(
                (a) => a.name.toLowerCase() === "talla"
              )?.option
            }{" "}
            seleccionada
          </span>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {variations.map((variation) => {
          const sizeAttr = variation.attributes.find(
            (a) => a.name.toLowerCase() === "talla"
          );
          const size = sizeAttr?.option || "Única";
          const isSelected = selectedVariation?.id === variation.id;
          const outOfStock = variation.stock_status === "outofstock";

          return (
            <button
              key={variation.id}
              onClick={() => !outOfStock && onSelect(variation, size)}
              disabled={outOfStock}
              title={outOfStock ? "Agotado" : size}
              className={`relative min-w-[52px] rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                isSelected
                  ? "border-burgundy-500 bg-burgundy-50 text-burgundy-600"
                  : outOfStock
                  ? "border-warm-100 text-warm-300 cursor-not-allowed line-through"
                  : "border-warm-200 text-warm-700 hover:border-burgundy-300 hover:text-burgundy-500"
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}
