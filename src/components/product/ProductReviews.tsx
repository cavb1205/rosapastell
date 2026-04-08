"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import type { WooReview } from "@/types/review";

interface ProductReviewsProps {
  productId: number;
}

function StarRating({
  value,
  onChange,
  readonly = false,
  small = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  small?: boolean;
}) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={readonly ? "cursor-default" : "cursor-pointer"}
          aria-label={`${star} estrellas`}
        >
          <Star
            className={`transition-colors ${small ? "h-4 w-4" : "h-5 w-5"} ${
              star <= active
                ? "fill-amber-400 text-amber-400"
                : "fill-warm-200 text-warm-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: WooReview }) {
  const date = new Date(review.date_created).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="py-5 border-b border-warm-100 last:border-0">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-warm-900">{review.name}</span>
            {review.verified && (
              <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                Compra verificada
              </span>
            )}
          </div>
          <span className="text-xs text-warm-400 mt-0.5 block">{date}</span>
        </div>
        <StarRating value={review.rating} readonly small />
      </div>
      <p
        className="text-sm text-warm-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: review.review }}
      />
    </div>
  );
}

function RatingSummary({ reviews }: { reviews: WooReview[] }) {
  if (reviews.length === 0) return null;

  const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center bg-warm-50 rounded-2xl p-5 mb-6">
      <div className="text-center">
        <p className="text-4xl font-heading text-warm-900">{avg.toFixed(1)}</p>
        <StarRating value={Math.round(avg)} readonly small />
        <p className="text-xs text-warm-400 mt-1">{reviews.length} reseña{reviews.length !== 1 ? "s" : ""}</p>
      </div>
      <div className="flex-1 w-full space-y-1.5">
        {counts.map(({ star, count }) => (
          <div key={star} className="flex items-center gap-2 text-xs text-warm-500">
            <span className="w-4 text-right">{star}</span>
            <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
            <div className="flex-1 h-1.5 bg-warm-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{ width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : "0%" }}
              />
            </div>
            <span className="w-4">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { user, isLoading: authLoading } = useAuthStore();
  const [reviews, setReviews] = useState<WooReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState<boolean | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`/api/reviews?product=${productId}`)
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews ?? []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [productId]);

  // Verificar si el usuario puede reseñar (compra verificada)
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setCanReview(false);
      return;
    }
    fetch(`/api/reviews/can-review?product=${productId}`)
      .then((r) => r.json())
      .then((d) => setCanReview(d.canReview ?? false))
      .catch(() => setCanReview(false));
  }, [productId, user, authLoading]);

  // Pre-fill from auth when user loads
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewText.trim() || rating < 1) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          review: reviewText.trim(),
          rating,
          reviewer: name.trim(),
          reviewer_email: email.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || "Error al enviar la reseña");
        return;
      }

      setSubmitted(true);
      setShowForm(false);
      setReviewText("");
      setRating(5);
    } catch {
      setSubmitError("Error de conexión. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-warm-300 bg-warm-50 px-4 py-3 text-sm text-warm-900 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 focus:bg-white hover:border-warm-400 transition-all duration-200";
  const labelClass = "block text-xs font-semibold uppercase tracking-widest text-warm-500 mb-2";

  return (
    <section className="mt-16 pt-14 border-t border-warm-100">
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-rose-400 mb-1.5">
            Opiniones
          </p>
          <h2 className="font-heading text-2xl sm:text-3xl text-warm-900">Reseñas del producto</h2>
        </div>

        {/* Botón escribir reseña — solo si tiene compra verificada */}
        {!showForm && !submitted && canReview === true && (
          <button
            onClick={() => setShowForm(true)}
            className="shrink-0 text-sm font-semibold text-burgundy-500 hover:text-burgundy-700 underline underline-offset-4 transition-colors"
          >
            Escribir reseña
          </button>
        )}
      </div>

      {/* CTA según estado de sesión/compra */}
      {!submitted && !showForm && !authLoading && (
        <>
          {!user && (
            <div className="mb-6 rounded-xl bg-warm-50 border border-warm-100 px-4 py-3 flex items-center justify-between gap-4">
              <p className="text-sm text-warm-500">
                Inicia sesión para dejar una reseña.
              </p>
              <a
                href="/cuenta/ingresar"
                className="shrink-0 text-sm font-semibold text-burgundy-500 hover:text-burgundy-700 underline underline-offset-2 transition-colors"
              >
                Ingresar →
              </a>
            </div>
          )}
          {user && canReview === false && (
            <div className="mb-6 rounded-xl bg-warm-50 border border-warm-100 px-4 py-3">
              <p className="text-sm text-warm-500">
                Solo clientes que han comprado este producto pueden escribir reseñas.
              </p>
            </div>
          )}
        </>
      )}

      {/* Rating summary */}
      {!loading && <RatingSummary reviews={reviews} />}

      {/* Submitted notice */}
      {submitted && (
        <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
          <p className="text-sm text-emerald-700 font-medium">
            ¡Gracias por tu reseña! Será publicada una vez aprobada.
          </p>
        </div>
      )}

      {/* Review form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 bg-warm-50 rounded-2xl p-6 space-y-4 border border-warm-100"
        >
          <h3 className="font-semibold text-warm-900 text-sm">Tu opinión</h3>

          {/* Stars */}
          <div>
            <label className={labelClass}>Calificación</label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          {/* Name + email (pre-filled if logged in) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Tu nombre"
                className={inputClass}
                readOnly={!!user}
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className={inputClass}
                readOnly={!!user}
              />
            </div>
          </div>

          {/* Review text */}
          <div>
            <label className={labelClass}>Reseña</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              required
              rows={4}
              placeholder="Cuéntanos tu experiencia con este producto..."
              className={`${inputClass} resize-none`}
            />
          </div>

          {submitError && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
              <p className="text-sm text-red-500">{submitError}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={submitting || rating < 1}
              className="rounded-full bg-burgundy-500 px-6 py-3 text-sm font-semibold text-white hover:bg-burgundy-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Enviando..." : "Enviar reseña"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-full border border-warm-200 px-6 py-3 text-sm font-semibold text-warm-600 hover:border-warm-300 transition-all"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="py-5 border-b border-warm-100 animate-pulse">
              <div className="h-4 bg-warm-100 rounded w-32 mb-2" />
              <div className="h-3 bg-warm-100 rounded w-full mb-1" />
              <div className="h-3 bg-warm-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-warm-400 text-center py-8">
          Aún no hay reseñas. ¡Sé el primero en opinar!
        </p>
      ) : (
        <div>
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}
    </section>
  );
}
