import { NextRequest, NextResponse } from "next/server";
import { wpRegister, AUTH_COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validations";

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

    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set(AUTH_COOKIE_NAME, token, COOKIE_OPTIONS);

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al crear la cuenta";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
