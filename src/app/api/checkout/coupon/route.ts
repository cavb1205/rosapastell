import { NextRequest, NextResponse } from "next/server";
import type { WooCoupon } from "@/types/order";

const WP_URL = process.env.WOOCOMMERCE_URL!;
const CK = process.env.WOOCOMMERCE_CONSUMER_KEY!;
const CS = process.env.WOOCOMMERCE_CONSUMER_SECRET!;

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")?.trim().toLowerCase();
  if (!code) {
    return NextResponse.json({ error: "Código requerido" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${WP_URL}/wp-json/wc/v3/coupons?code=${encodeURIComponent(code)}&consumer_key=${CK}&consumer_secret=${CS}`,
      { next: { revalidate: 0 } }
    );

    if (!res.ok) throw new Error("Error al consultar cupón");

    const coupons: WooCoupon[] = await res.json();

    if (!coupons.length) {
      return NextResponse.json({ error: "Cupón no válido" }, { status: 404 });
    }

    const coupon = coupons[0];

    // Verificar vencimiento
    if (coupon.date_expires && new Date(coupon.date_expires) < new Date()) {
      return NextResponse.json({ error: "Este cupón ha vencido" }, { status: 400 });
    }

    // Verificar límite de usos
    if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) {
      return NextResponse.json({ error: "Este cupón ya alcanzó su límite de usos" }, { status: 400 });
    }

    return NextResponse.json({
      code: coupon.code,
      discount_type: coupon.discount_type,
      amount: coupon.amount,
      minimum_amount: coupon.minimum_amount,
      description: coupon.description,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
