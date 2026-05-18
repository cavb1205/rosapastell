import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import { rateLimit } from "@/lib/rate-limit";
import { forgotPasswordSchema } from "@/lib/validations";
import { sendEmail } from "@/lib/email";
import { passwordResetEmailHtml } from "@/lib/email-templates";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

const WP_URL = process.env.WOOCOMMERCE_URL!;
const CK = process.env.WOOCOMMERCE_CONSUMER_KEY!;
const CS = process.env.WOOCOMMERCE_CONSUMER_SECRET!;

export async function POST(request: NextRequest) {
  const blocked = rateLimit(request, { limit: 3, windowMs: 60_000, prefix: "forgot" });
  if (blocked) return blocked;

  try {
    const parsed = forgotPasswordSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "El email es requerido" }, { status: 400 });
    }

    const { email } = parsed.data;

    // Buscar cliente por email en WooCommerce
    const searchRes = await fetch(
      `${WP_URL}/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}&consumer_key=${CK}&consumer_secret=${CS}`,
    );

    if (searchRes.ok) {
      const customers = await searchRes.json();

      if (customers.length > 0) {
        const customer = customers[0];
        const firstName = customer.first_name || "Cliente";

        // Generar token seguro
        const rawToken = randomBytes(32).toString("hex");
        const tokenHash = createHash("sha256").update(rawToken).digest("hex");
        const expiry = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hora

        // Guardar hash del token en meta del cliente
        await fetch(
          `${WP_URL}/wp-json/wc/v3/customers/${customer.id}?consumer_key=${CK}&consumer_secret=${CS}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              meta_data: [
                { key: "_rp_reset_token", value: tokenHash },
                { key: "_rp_reset_expiry", value: expiry },
              ],
            }),
          },
        );

        // Enviar email con enlace al frontend
        const resetUrl = `${SITE_URL}/cuenta/recuperar/reset?token=${rawToken}&email=${encodeURIComponent(email)}`;

        await sendEmail({
          to: [{ email, name: firstName }],
          subject: `Restablecer contraseña — ${SITE_NAME}`,
          htmlContent: passwordResetEmailHtml({ firstName, resetUrl }),
        });
      }
    }

    // Siempre responder OK para no revelar si el email existe
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[forgot-password] Error:", err);
    return NextResponse.json(
      { error: "Error de conexión. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
