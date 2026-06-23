"use client";

import { useMemo, useState } from "react";
import type { WooProduct, WooVariation } from "@/types/product";
import { ProductGallery } from "./ProductGallery";
import { ProductDetail } from "./ProductDetail";
import { getVariationAxes, findVariation } from "@/lib/variations";

interface ProductViewProps {
  product: WooProduct;
  variations: WooVariation[];
}

/**
 * Envuelve galería + detalle para compartir la selección de variantes: al elegir
 * un color, la galería salta a la imagen de esa variación (si tiene una propia).
 */
export function ProductView({ product, variations }: ProductViewProps) {
  const axes = useMemo(() => getVariationAxes(product), [product]);
  const [selection, setSelection] = useState<Record<string, string>>({});

  const selectedVariation = useMemo(
    () => findVariation(axes, variations, selection),
    [axes, variations, selection]
  );

  function handleChange(axisName: string, option: string) {
    setSelection((prev) => ({ ...prev, [axisName.trim().toLowerCase()]: option }));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
      <ProductGallery
        images={product.images}
        productName={product.name}
        activeImageId={selectedVariation?.image?.id ?? null}
      />
      <ProductDetail
        product={product}
        axes={axes}
        variations={variations}
        selection={selection}
        selectedVariation={selectedVariation}
        onChange={handleChange}
      />
    </div>
  );
}
