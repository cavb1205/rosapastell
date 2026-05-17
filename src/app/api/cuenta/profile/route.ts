import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { profileUpdateSchema } from "@/lib/validations";

const WP_URL = process.env.WOOCOMMERCE_URL!;
const CK = process.env.WOOCOMMERCE_CONSUMER_KEY!;
const CS = process.env.WOOCOMMERCE_CONSUMER_SECRET!;

export async function GET() {
  const user = await getUserFromCookie();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const res = await fetch(
      `${WP_URL}/wp-json/wc/v3/customers/${user.id}?consumer_key=${CK}&consumer_secret=${CS}`,
      { next: { revalidate: 0 } },
    );
    if (!res.ok) throw new Error("Error al obtener perfil");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const blocked = rateLimit(request, { limit: 10, windowMs: 60_000, prefix: "profile" });
  if (blocked) return blocked;

  const user = await getUserFromCookie();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const parsed = profileUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos de perfil inválidos" },
        { status: 400 },
      );
    }

    const res = await fetch(
      `${WP_URL}/wp-json/wc/v3/customers/${user.id}?consumer_key=${CK}&consumer_secret=${CS}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      },
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message || "Error al actualizar perfil");
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
