import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";
import { getWooAuthHeader } from "@/lib/woocommerce";

const WP_URL = process.env.WOOCOMMERCE_URL!;

const resetSchema = z.object({
  email: z.string().email().max(255),
  token: z.string().length(64),
  password: z.string().min(8).max(128),
});

export async function POST(request: NextRequest) {
  const blocked = rateLimit(request, { limit: 5, windowMs: 60_000, prefix: "reset-pw" });
  if (blocked) return blocked;

  try {
    const parsed = resetSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 },
      );
    }

    const { email, token, password } = parsed.data;

    // Buscar cliente por email
    const searchRes = await fetch(
      `${WP_URL}/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}`,
      { headers: { Authorization: getWooAuthHeader() } },
    );

    if (!searchRes.ok) {
      return NextResponse.json(
        { error: "Error al verificar el enlace." },
        { status: 500 },
      );
    }

    const customers = await searchRes.json();
    if (!customers.length) {
      return NextResponse.json(
        { error: "El enlace no es válido o ya expiró." },
        { status: 400 },
      );
    }

    const customer = customers[0];
    const meta = customer.meta_data || [];

    const storedHash = meta.find((m: { key: string }) => m.key === "_rp_reset_token")?.value;
    const expiry = meta.find((m: { key: string }) => m.key === "_rp_reset_expiry")?.value;

    if (!storedHash || !expiry) {
      return NextResponse.json(
        { error: "El enlace no es válido o ya expiró." },
        { status: 400 },
      );
    }

    // Verificar expiración
    if (new Date(expiry) < new Date()) {
      return NextResponse.json(
        { error: "El enlace ha expirado. Solicita uno nuevo." },
        { status: 400 },
      );
    }

    // Verificar token (constant-time comparison)
    const tokenHash = createHash("sha256").update(token).digest("hex");
    if (
      tokenHash.length !== storedHash.length ||
      !timingSafeEqual(Buffer.from(tokenHash), Buffer.from(storedHash))
    ) {
      return NextResponse.json(
        { error: "El enlace no es válido o ya expiró." },
        { status: 400 },
      );
    }

    // Actualizar contraseña y limpiar token
    const updateRes = await fetch(
      `${WP_URL}/wp-json/wc/v3/customers/${customer.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: getWooAuthHeader() },
        body: JSON.stringify({
          password,
          meta_data: [
            { key: "_rp_reset_token", value: "" },
            { key: "_rp_reset_expiry", value: "" },
          ],
        }),
      },
    );

    if (!updateRes.ok) {
      console.error("[reset-password] Error actualizando contraseña:", await updateRes.text());
      return NextResponse.json(
        { error: "No se pudo actualizar la contraseña. Intenta de nuevo." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[reset-password] Error:", err);
    return NextResponse.json(
      { error: "Error de conexión. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
