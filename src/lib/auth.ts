import { cookies } from "next/headers";
import type { WPUser } from "@/types/auth";
import { WHOLESALE_ROLES } from "@/types/auth";

const WP_URL = process.env.WOOCOMMERCE_URL!;
const AUTH_COOKIE = "rp_auth_token";

export async function wpLogin(
  username: string,
  password: string
): Promise<{ token: string; user: WPUser }> {
  const res = await fetch(`${WP_URL}/wp-json/jwt-auth/v1/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err?.message || "Credenciales incorrectas"
    );
  }

  const data = await res.json();
  const token: string = data.token;

  // Obtener datos completos del usuario (incluyendo roles)
  const meRes = await fetch(`${WP_URL}/wp-json/wp/v2/users/me?context=edit`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!meRes.ok) throw new Error("No se pudo obtener el perfil del usuario");

  const meData = await meRes.json();

  const roles: string[] = meData.roles || [];
  const isWholesale = roles.some((r) =>
    WHOLESALE_ROLES.includes(r as (typeof WHOLESALE_ROLES)[number])
  );

  const user: WPUser = {
    id: meData.id,
    name: meData.name || data.user_display_name,
    email: meData.email || data.user_email,
    roles,
    isWholesale,
  };

  return { token, user };
}

export async function wpRegister(payload: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}): Promise<{ token: string; user: WPUser }> {
  const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY!;
  const CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET!;

  // Crear cliente en WooCommerce (crea usuario de WordPress al mismo tiempo)
  const res = await fetch(
    `${WP_URL}/wp-json/wc/v3/customers?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
        first_name: payload.firstName,
        last_name: payload.lastName,
        username: payload.email,
        billing: {
          first_name: payload.firstName,
          last_name: payload.lastName,
          email: payload.email,
          phone: payload.phone || "",
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    // Limpiar HTML que WooCommerce a veces incluye en los mensajes de error
    const rawMsg: string = err?.message || "Error al crear la cuenta";
    const msg = rawMsg.replace(/<[^>]+>/g, "").trim();

    if (
      msg.includes("already registered") ||
      msg.includes("ya hay una cuenta") ||
      msg.includes("ya existe") ||
      msg.includes("registrada con")
    ) {
      throw new Error("EMAIL_ALREADY_REGISTERED");
    }
    throw new Error(msg);
  }

  // Hacer login automáticamente después del registro
  return wpLogin(payload.email, payload.password);
}

export async function getUserFromCookie(): Promise<WPUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;
    if (!token) return null;

    const res = await fetch(`${WP_URL}/wp-json/wp/v2/users/me?context=edit`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;

    const meData = await res.json();
    const roles: string[] = meData.roles || [];

    return {
      id: meData.id,
      name: meData.name,
      email: meData.email,
      roles,
      isWholesale: roles.some((r) =>
        WHOLESALE_ROLES.includes(r as (typeof WHOLESALE_ROLES)[number])
      ),
    };
  } catch {
    return null;
  }
}

export const AUTH_COOKIE_NAME = AUTH_COOKIE;
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 días
};
