"use client";

import { useState } from "react";
import Image from "next/image";
import type { WooImage } from "@/types/product";

interface ProductGalleryProps {
  images: WooImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square w-full rounded-2xl bg-cream-100 flex items-center justify-center text-warm-300">
        Sin imagen
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-cream-50">
        <Image
          src={images[selected].src}
          alt={images[selected].alt || productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setSelected(i)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                i === selected
                  ? "border-burgundy-500"
                  : "border-warm-200 hover:border-rose-300"
              }`}
              aria-label={`Ver imagen ${i + 1}`}
            >
              <Image
                src={img.src}
                alt={img.alt || `${productName} ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
