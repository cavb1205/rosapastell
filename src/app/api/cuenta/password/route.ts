import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

const WP_URL = process.env.WOOCOMMERCE_URL!;

export async function PUT(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { password } = await request.json();
    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      );
    }

    const res = await fetch(`${WP_URL}/wp-json/wp/v2/users/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message || "Error al cambiar la contraseña");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
