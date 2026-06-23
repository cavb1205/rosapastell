"use client";

import { useState } from "react";
import type { WooProduct, WooVariation, WooAttribute } from "@/types/product";
import { useCartStore } from "@/store/cart";
import { isOptionAvailable } from "@/lib/variations";
import { colorToHex, colorNeedsBorder } from "@/lib/colors";
import { SizeGuideModal } from "./SizeGuideModal";

interface VariantSelectorProps {
  product: WooProduct;
  axes: WooAttribute[];
  variations: WooVariation[];
  selection: Record<string, string>;
  selectedVariation: WooVariation | null;
  onChange: (axisName: string, option: string) => void;
}

const isColorAxis = (axis: WooAttribute) => axis.name.trim().toLowerCase() === "color";
const isSizeAxis = (axis: WooAttribute) => axis.name.trim().toLowerCase() === "talla";
const axisKey = (axis: WooAttribute) => axis.name.trim().toLowerCase();

export function VariantSelector({
  product,
  axes,
  variations,
  selection,
  selectedVariation,
  onChange,
}: VariantSelectorProps) {
  const [guideOpen, setGuideOpen] = useState(false);
  const cartItems = useCartStore((s) => s.items);

  // Stock disponible de la variación completa seleccionada (restando carrito)
  const lowStockThreshold = 5;
  const totalStock = selectedVariation?.stock_quantity ?? null;
  const inCart = selectedVariation
    ? cartItems.find(
        (i) => i.productId === product.id && i.variationId === selectedVariation.id
      )?.quantity ?? 0
    : 0;
  const availableStock = totalStock !== null ? totalStock - inCart : null;
  const showLowStock =
    selectedVariation &&
    selectedVariation.stock_status !== "outofstock" &&
    availableStock !== null &&
    availableStock <= lowStockThreshold &&
    availableStock > 0;

  return (
    <div className="space-y-5">
      {guideOpen && <SizeGuideModal onClose={() => setGuideOpen(false)} />}

      {axes.map((axis) => {
        const key = axisKey(axis);
        const selected = selection[key];
        const color = isColorAxis(axis);

        return (
          <div key={`${axis.id}-${axis.name}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold text-warm-700">
                  {axis.name}
                  {selected && (
                    <span className="ml-1.5 font-normal text-warm-500">: {selected}</span>
                  )}
                </h3>
                {isSizeAxis(axis) && (
                  <button
                    type="button"
                    onClick={() => setGuideOpen(true)}
                    className="text-xs text-burgundy-500 hover:text-burgundy-700 underline underline-offset-2 transition-colors"
                  >
                    ¿Cuál es tu talla?
                  </button>
                )}
              </div>
              {isSizeAxis(axis) && showLowStock && (
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  {availableStock === 1 ? "¡Última unidad!" : `Solo quedan ${availableStock}`}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {axis.options.map((option) => {
                const isSelected = selected === option;
                const available = isOptionAvailable(
                  axes,
                  variations,
                  selection,
                  axis.name,
                  option
                );

                if (color) {
                  const hex = colorToHex(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => available && onChange(axis.name, option)}
                      disabled={!available}
                      aria-pressed={isSelected}
                      title={available ? option : `${option} — agotado`}
                      className={`group relative flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3 text-sm font-medium transition-all ${
                        isSelected
                          ? "border-burgundy-500 bg-burgundy-50 text-burgundy-600"
                          : available
                          ? "border-warm-200 text-warm-700 hover:border-burgundy-300"
                          : "border-warm-100 text-warm-300 cursor-not-allowed line-through"
                      }`}
                    >
                      <span
                        className={`h-5 w-5 rounded-full ${
                          colorNeedsBorder(hex) ? "ring-1 ring-inset ring-warm-300" : ""
                        }`}
                        style={{ backgroundColor: hex ?? "#E5E0DC" }}
                        aria-hidden
                      />
                      {option}
                    </button>
                  );
                }

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => available && onChange(axis.name, option)}
                    disabled={!available}
                    aria-pressed={isSelected}
                    title={available ? option : `${option} — agotado`}
                    className={`relative min-w-[52px] rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                      isSelected
                        ? "border-burgundy-500 bg-burgundy-50 text-burgundy-600"
                        : available
                        ? "border-warm-200 text-warm-700 hover:border-burgundy-300 hover:text-burgundy-500"
                        : "border-warm-100 text-warm-300 cursor-not-allowed line-through"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
