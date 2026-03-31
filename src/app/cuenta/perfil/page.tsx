import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Crown } from "lucide-react";
import { getUserFromCookie } from "@/lib/auth";
import { SITE_NAME } from "@/lib/constants";
import { LogoutButton } from "@/components/cuenta/LogoutButton";

export const metadata: Metadata = {
  title: `Mi Perfil | ${SITE_NAME}`,
  robots: { index: false },
};

export default async function PerfilPage() {
  const user = await getUserFromCookie();
  if (!user) redirect("/cuenta/ingresar");

  return (
    <div className="min-h-screen bg-warm-50">

      {/* Header */}
      <div className="relative overflow-hidden bg-burgundy-900">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-burgundy-700 opacity-35" />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(212,160,160,0.5) 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-lg px-4 sm:px-6 py-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-rose-300/60 mb-2">
                Mi cuenta
              </p>
              <h1 className="font-heading text-3xl text-white">Mi Perfil</h1>
            </div>
            <LogoutButton variant="dark" />
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="mx-auto max-w-lg px-4 sm:px-6 py-8 space-y-4">

        {/* Card de datos */}
        <div className="bg-white rounded-2xl shadow-sm border border-warm-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-warm-100 bg-warm-50">
            <p className="text-xs font-semibold uppercase tracking-widest text-warm-500">
              Datos de la cuenta
            </p>
          </div>

          <div className="divide-y divide-warm-100">
            <div className="px-8 py-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-warm-400 mb-2">Nombre</p>
              <p className="text-warm-800 font-medium">{user.name}</p>
            </div>
            <div className="px-8 py-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-warm-400 mb-2">Email</p>
              <p className="text-warm-800 font-medium">{user.email}</p>
            </div>
            <div className="px-8 py-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-warm-400 mb-2">Tipo de cuenta</p>
              {user.isWholesale ? (
                <span className="inline-flex items-center gap-2 text-burgundy-600 font-semibold text-sm">
                  <Crown className="h-4 w-4" />
                  Cliente Mayorista
                </span>
              ) : (
                <p className="text-warm-800 font-medium">Cliente minorista</p>
              )}
            </div>
          </div>

          <div className="px-8 py-5 bg-warm-50 border-t border-warm-100">
            <p className="text-sm text-warm-400">
              Para actualizar tus datos o contraseña, escríbenos por{" "}
              <span className="text-warm-600 font-medium">WhatsApp</span>.
            </p>
          </div>
        </div>

        {/* Volver */}
        <div className="text-center pt-2">
          <Link
            href="/cuenta"
            className="inline-flex items-center gap-1.5 text-sm text-warm-400 hover:text-burgundy-500 transition-colors"
          >
            ← Volver a mi cuenta
          </Link>
        </div>

      </div>
    </div>
  );
}
