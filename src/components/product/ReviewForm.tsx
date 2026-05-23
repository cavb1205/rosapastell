"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { useAuthStore } from "@/store/auth";

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="cursor-pointer"
          aria-label={`${star} estrellas`}
        >
          <Star
            className={`transition-colors h-5 w-5 ${
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

interface ReviewFormProps {
  productId: number;
}

export function ReviewForm({ productId }: ReviewFormProps) {
  const { user, isLoading: authLoading } = useAuthStore();
  const [canReview, setCanReview] = useState<boolean | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

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
    "w-full rounded-xl border border-warm-300 bg-warm-50 px-4 py-3 text-base text-warm-900 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 focus:bg-white hover:border-warm-400 transition-all duration-200";
  const labelClass = "block text-xs font-semibold uppercase tracking-widest text-warm-500 mb-2";

  if (authLoading) return null;

  return (
    <>
      {/* Botón escribir reseña */}
      {!showForm && !submitted && canReview === true && (
        <button
          onClick={() => setShowForm(true)}
          className="shrink-0 text-sm font-semibold text-burgundy-500 hover:text-burgundy-700 underline underline-offset-4 transition-colors"
        >
          Escribir reseña
        </button>
      )}

      {/* CTA según estado de sesión/compra */}
      {!submitted && !showForm && (
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

          <div>
            <label className={labelClass}>Calificación</label>
            <StarRating value={rating} onChange={setRating} />
          </div>

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
    </>
  );
}
