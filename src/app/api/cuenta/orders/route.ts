import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { getWooAuthHeader } from "@/lib/woocommerce";

const WP_URL = process.env.WOOCOMMERCE_URL!;

export async function GET() {
  try {
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const res = await fetch(
      `${WP_URL}/wp-json/wc/v3/orders?customer=${user.id}&per_page=20&orderby=date&order=desc`,
      { headers: { Authorization: getWooAuthHeader() } }
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
