"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

  // Pinch-to-zoom state
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const touchRef = useRef<{ dist: number; midX: number; midY: number; ox: number; oy: number } | null>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  const openLightbox = () => { setLightboxOpen(true); setScale(1); setOffset({ x: 0, y: 0 }); };
  const closeLightbox = () => { setLightboxOpen(false); setScale(1); setOffset({ x: 0, y: 0 }); };

  const prev = useCallback(() => {
    setSelected((i) => (i === 0 ? images.length - 1 : i - 1));
    setScale(1); setOffset({ x: 0, y: 0 });
  }, [images.length]);

  const next = useCallback(() => {
    setSelected((i) => (i === images.length - 1 ? 0 : i + 1));
    setScale(1); setOffset({ x: 0, y: 0 });
  }, [images.length]);

  // ── Touch handlers para pinch-to-zoom y swipe ──
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  function getDist(t: React.TouchList) {
    const dx = t[0].clientX - t[1].clientX;
    const dy = t[0].clientY - t[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      const dist = getDist(e.touches);
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      touchRef.current = { dist, midX, midY, ox: offset.x, oy: offset.y };
    } else if (e.touches.length === 1) {
      swipeStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 2 && touchRef.current) {
      e.preventDefault();
      const newDist = getDist(e.touches);
      const newScale = Math.min(4, Math.max(1, scale * (newDist / touchRef.current.dist)));
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const dx = midX - touchRef.current.midX;
      const dy = midY - touchRef.current.midY;
      setScale(newScale);
      setOffset({ x: touchRef.current.ox + dx, y: touchRef.current.oy + dy });
      touchRef.current = { ...touchRef.current, dist: newDist, midX, midY };
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    touchRef.current = null;
    // Swipe para cambiar imagen (solo si no hay zoom)
    if (scale <= 1 && swipeStart.current && e.changedTouches.length === 1) {
      const dx = e.changedTouches[0].clientX - swipeStart.current.x;
      if (Math.abs(dx) > 50) {
        dx < 0 ? next() : prev();
      }
    }
    swipeStart.current = null;
    // Si el zoom quedó en <1 por algún rebote, reseteamos
    if (scale < 1) { setScale(1); setOffset({ x: 0, y: 0 }); }
  }

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

          {/* Imagen con pinch-to-zoom */}
          <div
            ref={imgRef}
            className="relative w-full max-w-3xl max-h-[85vh] aspect-square mx-4 touch-none"
            onClick={(e) => { if (scale <= 1) e.stopPropagation(); }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
              transition: scale === 1 ? "transform 0.2s ease" : "none",
            }}
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

          {/* Flechas — se ocultan con zoom activo */}
          {images.length > 1 && scale <= 1 && (
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

          {/* Hint zoom activo */}
          {scale > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setScale(1); setOffset({ x: 0, y: 0 }); }}
              className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white/80 text-xs px-3 py-1.5 rounded-full"
            >
              Toca para restablecer
            </button>
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
