import { Star } from "lucide-react";
import { stripHTML } from "@/lib/sanitize";
import { ReviewForm } from "./ReviewForm";
import type { WooReview } from "@/types/review";

function StarRating({ value, small = false }: { value: number; small?: boolean }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${small ? "h-4 w-4" : "h-5 w-5"} ${
            star <= value
              ? "fill-amber-400 text-amber-400"
              : "fill-warm-200 text-warm-200"
          }`}
        />
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
            <span className="font-semibold text-sm text-warm-900">{review.reviewer}</span>
            {review.verified && (
              <span className="text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
                Compra verificada
              </span>
            )}
          </div>
          <span className="text-xs text-warm-400 mt-0.5 block">{date}</span>
        </div>
        <StarRating value={review.rating} small />
      </div>
      <p className="text-sm text-warm-700 leading-relaxed">
        {stripHTML(review.review)}
      </p>
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
        <StarRating value={Math.round(avg)} small />
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

interface ProductReviewsProps {
  productId: number;
  reviews: WooReview[];
}

export function ProductReviews({ productId, reviews }: ProductReviewsProps) {
  return (
    <section className="mt-16 pt-14 border-t border-warm-100">
      <div className="mb-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-rose-400 mb-1.5">
              Opiniones
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl text-warm-900">Reseñas del producto</h2>
          </div>
        </div>
      </div>

      <ReviewForm productId={productId} />

      <RatingSummary reviews={reviews} />

      {reviews.length === 0 ? (
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
