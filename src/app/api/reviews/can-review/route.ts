import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { getWooAuthHeader } from "@/lib/woocommerce";
import { rateLimit } from "@/lib/rate-limit";

const WP_URL = process.env.WOOCOMMERCE_URL!;

export async function GET(req: NextRequest) {
  const blocked = rateLimit(req, { limit: 10, windowMs: 60_000, prefix: "can-review" });
  if (blocked) return blocked;

  const productId = req.nextUrl.searchParams.get("product");
  if (!productId || !/^\d+$/.test(productId)) {
    return NextResponse.json({ canReview: false, reason: "missing_product" });
  }

  const user = await getUserFromCookie();
  if (!user) {
    return NextResponse.json({ canReview: false, reason: "not_logged_in" });
  }

  // Verificar si el usuario tiene al menos un pedido completado con este producto
  const res = await fetch(
    `${WP_URL}/wp-json/wc/v3/orders?customer=${user.id}&product=${productId}&status=completed&per_page=1`,
    { next: { revalidate: 300 }, headers: { Authorization: getWooAuthHeader() } }
  );

  if (!res.ok) {
    // Si falla la consulta, no bloqueamos al usuario — dejamos que intente
    return NextResponse.json({ canReview: true, reason: "check_failed" });
  }

  const orders = await res.json();
  const hasPurchased = Array.isArray(orders) && orders.length > 0;

  return NextResponse.json({
    canReview: hasPurchased,
    reason: hasPurchased ? "verified_purchase" : "no_purchase",
  });
}
