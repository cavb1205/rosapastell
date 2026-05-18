import { NextRequest, NextResponse } from "next/server";
import { wpRegister, AUTH_COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validations";
import { sendEmail } from "@/lib/email";
import { welcomeEmailHtml } from "@/lib/email-templates";
import { SITE_NAME } from "@/lib/constants";

export async function POST(request: NextRequest) {
  const blocked = rateLimit(request, { limit: 3, windowMs: 60_000, prefix: "register" });
  if (blocked) return blocked;

  try {
    const parsed = registerSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos y la contraseña debe tener al menos 8 caracteres" },
        { status: 400 },
      );
    }

    const { email, password, firstName, lastName, phone } = parsed.data;

    const { token, user } = await wpRegister({
      email,
      password,
      firstName,
      lastName,
      phone,
    });

    // Enviar email de bienvenida (no bloquea el registro si falla)
    try {
      await sendEmail({
        to: [{ email: parsed.data.email, name: parsed.data.firstName }],
        subject: `¡Bienvenida a ${SITE_NAME}!`,
        htmlContent: welcomeEmailHtml({ firstName: parsed.data.firstName }),
      });
    } catch (err) {
      console.error("[Email] Error enviando bienvenida:", err);
    }

    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set(AUTH_COOKIE_NAME, token, COOKIE_OPTIONS);

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al crear la cuenta";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
