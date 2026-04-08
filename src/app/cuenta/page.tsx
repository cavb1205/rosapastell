import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserFromCookie } from "@/lib/auth";
import { SITE_NAME } from "@/lib/constants";
import { OrderHistory } from "@/components/cuenta/OrderHistory";
import { LogoutButton } from "@/components/cuenta/LogoutButton";
import { Crown, ShoppingBag, User } from "lucide-react";

export const metadata: Metadata = {
  title: `Mi Cuenta | ${SITE_NAME}`,
  robots: { index: false },
};

export default async function CuentaPage() {
  const user = await getUserFromCookie();

  if (!user) {
    redirect("/cuenta/ingresar");
  }

  const firstName = user.name.split(" ")[0];

  return (
    <div className="min-h-screen bg-warm-50">

      {/* Hero header */}
      <div className="relative overflow-hidden bg-burgundy-500">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 left-1/3 w-56 h-56 rounded-full bg-white/10" />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-2">
                Mi cuenta
              </p>
              <h1 className="font-heading text-3xl sm:text-5xl text-white">
                Hola, {firstName}
              </h1>
              <p className="mt-1.5 text-white/70 text-sm">{user.email}</p>
            </div>
            <LogoutButton variant="dark" />
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Badge mayorista */}
        {user.isWholesale && (
          <div className="flex items-center gap-5 bg-white border border-burgundy-200 rounded-2xl px-7 py-6 shadow-sm">
            <div className="h-12 w-12 shrink-0 flex items-center justify-center rounded-full bg-burgundy-50">
              <Crown className="h-5 w-5 text-burgundy-500" />
            </div>
            <div>
              <p className="font-semibold text-burgundy-700">Cliente Mayorista</p>
              <p className="text-sm text-warm-400 mt-1">
                Tu cuenta tiene precios y condiciones especiales habilitadas.
              </p>
            </div>
          </div>
        )}

        {/* Acciones rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/colecciones"
            className="group flex items-center gap-5 bg-white rounded-2xl px-6 py-6 shadow-sm border border-warm-200 hover:border-rose-300 hover:shadow-md transition-all"
          >
            <div className="h-12 w-12 shrink-0 flex items-center justify-center rounded-full bg-rose-50 group-hover:bg-rose-100 transition-colors">
              <ShoppingBag className="h-5 w-5 text-rose-400" />
            </div>
            <div>
              <p className="font-semibold text-warm-800">Ver colecciones</p>
              <p className="text-sm text-warm-400 mt-0.5">Explora nuestro catálogo</p>
            </div>
          </Link>

          <Link
            href="/cuenta/perfil"
            className="group flex items-center gap-5 bg-white rounded-2xl px-6 py-6 shadow-sm border border-warm-200 hover:border-rose-300 hover:shadow-md transition-all"
          >
            <div className="h-12 w-12 shrink-0 flex items-center justify-center rounded-full bg-cream-100 group-hover:bg-cream-200 transition-colors">
              <User className="h-5 w-5 text-warm-500" />
            </div>
            <div>
              <p className="font-semibold text-warm-800">Mi perfil</p>
              <p className="text-sm text-warm-400 mt-0.5">Ver datos de la cuenta</p>
            </div>
          </Link>
        </div>

        {/* Pedidos */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-heading text-2xl text-warm-900">Mis Pedidos</h2>
            <span className="h-px flex-1 bg-warm-100" />
          </div>
          <OrderHistory userId={user.id} />
        </section>

      </div>
    </div>
  );
}
