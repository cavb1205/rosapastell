import { NextRequest, NextResponse } from "next/server";
import { wpRegister, AUTH_COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      );
    }

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
