import { NextRequest, NextResponse } from "next/server";

const WP_URL = process.env.WOOCOMMERCE_URL!;
const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY!;
const CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET!;

function auth() {
  return `consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;
}

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("product");
  if (!productId) {
    return NextResponse.json({ error: "product requerido" }, { status: 400 });
  }

  const res = await fetch(
    `${WP_URL}/wp-json/wc/v3/products/reviews?product=${productId}&per_page=20&status=approved&${auth()}`,
    { next: { revalidate: 60 } }
  );

  if (!res.ok) {
    return NextResponse.json({ reviews: [] });
  }

  const data = await res.json();
  return NextResponse.json({ reviews: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { product_id, review, rating, reviewer, reviewer_email } = body;

  if (!product_id || !review || !rating || !reviewer || !reviewer_email) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const res = await fetch(
    `${WP_URL}/wp-json/wc/v3/products/reviews?${auth()}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id, review, rating, reviewer, reviewer_email }),
    }
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
