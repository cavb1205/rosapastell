import { NextRequest, NextResponse } from "next/server";
import { wpLogin, AUTH_COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const blocked = rateLimit(request, { limit: 5, windowMs: 60_000, prefix: "login" });
  if (blocked) return blocked;

  try {
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 },
      );
    }

    const { username, password } = parsed.data;
    const { token, user } = await wpLogin(username, password);

    const response = NextResponse.json({ user });
    response.cookies.set(AUTH_COOKIE_NAME, token, COOKIE_OPTIONS);

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al iniciar sesión";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
