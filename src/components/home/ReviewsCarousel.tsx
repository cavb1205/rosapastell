"use client";

import { useRef, useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import type { WooReview } from "@/types/review";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${s <= rating ? "fill-amber-400 text-amber-400" : "fill-warm-200 text-warm-200"}`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: WooReview }) {
  // Quitar tags HTML del texto
  const text = review.review.replace(/<[^>]+>/g, "").trim();
  // Truncar a ~160 caracteres
  const display = text.length > 160 ? text.slice(0, 157) + "…" : text;
  const firstName = review.reviewer.split(" ")[0];
  const initial = firstName.charAt(0).toUpperCase();

  return (
    <div className="shrink-0 w-72 sm:w-80 bg-white rounded-2xl border border-warm-100 shadow-sm px-6 py-5 flex flex-col gap-3 select-none">
      <Quote className="h-5 w-5 text-burgundy-300" />
      <p className="text-sm text-warm-700 leading-relaxed flex-1">"{display}"</p>
      <div className="flex items-center gap-3 pt-1">
        <div className="h-8 w-8 rounded-full bg-burgundy-100 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-burgundy-500">{initial}</span>
        </div>
        <div>
          <p className="text-xs font-semibold text-warm-800">{firstName}</p>
          <Stars rating={review.rating} />
        </div>
        {review.verified && (
          <span className="ml-auto text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium shrink-0">
            ✓ Verificada
          </span>
        )}
      </div>
    </div>
  );
}

interface ReviewsCarouselProps {
  reviews: WooReview[];
}

export function ReviewsCarousel({ reviews }: ReviewsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const posRef = useRef(0);
  const rafRef = useRef<number>(0);

  // Solo duplicar si hay suficientes reseñas para el loop (mínimo 4)
  const shouldLoop = reviews.length >= 2;
  const items = reviews.length > 0
    ? shouldLoop ? [...reviews, ...reviews] : reviews
    : [];

  useEffect(() => {
    const track = trackRef.current;
    if (!track || items.length === 0) return;

    const speed = 0.5; // px por frame

    function animate() {
      if (!paused && track && shouldLoop) {
        posRef.current += speed;
        // Resetear cuando llegamos a la mitad (los duplicados)
        const half = track.scrollWidth / 2;
        if (posRef.current >= half) posRef.current = 0;
        track.style.transform = `translateX(-${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [paused, items.length]);

  if (reviews.length === 0) return null;

  return (
    <section className="py-14 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-burgundy-400 mb-2">
            Lo que dicen nuestras clientas
          </p>
          <h2 className="font-heading text-2xl sm:text-3xl text-warm-900">
            Reseñas reales
          </h2>
        </div>
      </div>

      {/* Una sola reseña: centrada */}
      {!shouldLoop ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex justify-center">
          {items.map((review, i) => (
            <ReviewCard key={`${review.id}-${i}`} review={review} />
          ))}
        </div>
      ) : (
        /* Carrusel */
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
        >
          {/* Gradientes laterales */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-linear-to-r from-warm-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-linear-to-l from-warm-50 to-transparent z-10 pointer-events-none" />

          <div
            ref={trackRef}
            className="flex gap-4 will-change-transform"
            style={{ width: "max-content" }}
          >
            {items.map((review, i) => (
              <ReviewCard key={`${review.id}-${i}`} review={review} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
