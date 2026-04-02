"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ZoomIn, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { WooImage } from "@/types/product";

interface ProductGalleryProps {
  images: WooImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const openLightbox = () => setLightboxOpen(true);
  const closeLightbox = () => setLightboxOpen(false);

  const prev = useCallback(() => {
    setSelected((i) => (i === 0 ? images.length - 1 : i - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setSelected((i) => (i === images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, prev, next]);

  if (images.length === 0) {
    return (
      <div className="aspect-square w-full rounded-2xl bg-cream-100 flex items-center justify-center text-warm-300">
        Sin imagen
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Main image */}
        <div
          className="relative aspect-square w-full overflow-hidden rounded-2xl bg-cream-50 cursor-zoom-in group"
          onClick={openLightbox}
        >
          <Image
            src={images[selected].src}
            alt={images[selected].alt || productName}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-white/80 backdrop-blur-sm rounded-full p-2.5 shadow">
              <ZoomIn className="h-5 w-5 text-warm-700" />
            </div>
          </div>
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

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Cerrar */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-7 w-7" />
          </button>

          {/* Contador */}
          {images.length > 1 && (
            <span className="absolute top-5 left-1/2 -translate-x-1/2 text-white/50 text-sm tabular-nums">
              {selected + 1} / {images.length}
            </span>
          )}

          {/* Imagen */}
          <div
            className="relative w-full max-w-3xl max-h-[85vh] aspect-square mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[selected].src}
              alt={images[selected].alt || productName}
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-contain"
              priority
            />
          </div>

          {/* Flechas */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 p-2 text-white/70 hover:text-white transition-colors"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-9 w-9" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 p-2 text-white/70 hover:text-white transition-colors"
                aria-label="Siguiente"
              >
                <ChevronRight className="h-9 w-9" />
              </button>
            </>
          )}

          {/* Thumbnails en lightbox */}
          {images.length > 1 && (
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelected(i)}
                  className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-colors flex-shrink-0 ${
                    i === selected ? "border-white" : "border-white/30 hover:border-white/60"
                  }`}
                  aria-label={`Imagen ${i + 1}`}
                >
                  <Image
                    src={img.src}
                    alt={img.alt || `${productName} ${i + 1}`}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
