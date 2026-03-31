import { NextRequest, NextResponse } from "next/server";
import { wpLogin, AUTH_COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

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
