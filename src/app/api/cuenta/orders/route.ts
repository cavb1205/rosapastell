import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";

const WP_URL = process.env.WOOCOMMERCE_URL!;
const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY!;
const CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET!;

export async function GET() {
  try {
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const res = await fetch(
      `${WP_URL}/wp-json/wc/v3/orders?customer=${user.id}&per_page=20&orderby=date&order=desc&consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`
    );

    if (!res.ok) throw new Error("Error al obtener pedidos");

    const orders = await res.json();
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json(
      { error: "Error al obtener pedidos" },
      { status: 500 }
    );
  }
}
