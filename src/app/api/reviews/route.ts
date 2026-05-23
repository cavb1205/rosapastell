import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { reviewSchema } from "@/lib/validations";
import { getWooAuthHeader } from "@/lib/woocommerce";

const WP_URL = process.env.WOOCOMMERCE_URL!;

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("product");
  if (!productId || !/^\d+$/.test(productId)) {
    return NextResponse.json({ error: "product requerido" }, { status: 400 });
  }

  const res = await fetch(
    `${WP_URL}/wp-json/wc/v3/products/reviews?product=${encodeURIComponent(productId)}&per_page=20&status=approved`,
    { next: { revalidate: 60 }, headers: { Authorization: getWooAuthHeader() } },
  );

  if (!res.ok) {
    return NextResponse.json({ reviews: [] });
  }

  const data = await res.json();
  return NextResponse.json({ reviews: data });
}

export async function POST(req: NextRequest) {
  const blocked = rateLimit(req, { limit: 3, windowMs: 60_000, prefix: "reviews" });
  if (blocked) return blocked;

  const parsed = reviewSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos de reseña incompletos o inválidos" }, { status: 400 });
  }

  const { product_id, review, rating, reviewer, reviewer_email } = parsed.data;

  const res = await fetch(
    `${WP_URL}/wp-json/wc/v3/products/reviews`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: getWooAuthHeader() },
      body: JSON.stringify({ product_id, review, rating, reviewer, reviewer_email }),
    },
  );

  const data = await res.json();

  if (!res.ok) {
    const msg: string = (data?.message || "Error al enviar la reseña")
      .replace(/<[^>]+>/g, "")
      .trim();
    return NextResponse.json({ error: msg }, { status: res.status });
  }

  return NextResponse.json({ review: data }, { status: 201 });
}
