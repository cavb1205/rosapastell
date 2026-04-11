import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Recuperar contraseña | ${SITE_NAME}`,
  robots: { index: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex">

      {/* Panel decorativo izquierdo */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative overflow-hidden bg-burgundy-500 flex-col items-start justify-between p-14">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-120 h-120 rounded-full bg-white/20" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white/10" />
          <div className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/3 w-80 h-80 rounded-full bg-white/10" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.25) 1px, transparent 1px)`,
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-sm">
          <p className="font-heading text-4xl xl:text-5xl text-white leading-[1.2]">
            Recupera el acceso a tu cuenta.
          </p>
          <p className="mt-6 text-white/80 text-sm leading-relaxed">
            Te enviaremos un enlace a tu email para que puedas crear una nueva contraseña.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2">
          <span className="block h-0.5 w-10 rounded-full bg-white/70" />
          <span className="block h-0.5 w-4 rounded-full bg-white/40" />
          <span className="block h-0.5 w-2 rounded-full bg-white/20" />
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center px-6 py-14 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-burgundy-400 mb-2">Cuenta</p>
            <h1 className="font-heading text-3xl text-warm-900">¿Olvidaste tu contraseña?</h1>
            <p className="mt-2 text-sm text-warm-400">
              Ingresa tu email y te enviamos un enlace para recuperarla.
            </p>
          </div>

          <ForgotPasswordForm />

          <p className="mt-8 text-center text-xs text-warm-300">
            ¿No tienes cuenta?{" "}
            <Link href="/cuenta/registro" className="underline hover:text-warm-500 transition-colors">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
