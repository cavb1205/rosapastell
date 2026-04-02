import { NextRequest, NextResponse } from "next/server";

const WP_URL = process.env.WOOCOMMERCE_URL!;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "El email es requerido" }, { status: 400 });
    }

    const res = await fetch(`${WP_URL}/wp-json/rp/v1/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const msg = data?.message || "No se pudo procesar la solicitud.";
      // Si el email no existe, WP devuelve error — por seguridad respondemos igual
      console.error("[forgot-password] WP error:", msg);
    }

    // Siempre responder OK para no revelar si el email existe o no
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[forgot-password] Error:", err);
    return NextResponse.json(
      { error: "Error de conexión. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
