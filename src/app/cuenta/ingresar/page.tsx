import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { Logo } from "@/components/ui/Logo";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Ingresar | ${SITE_NAME}`,
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">

      {/* Panel decorativo izquierdo */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative overflow-hidden bg-burgundy-500 flex-col items-start justify-between p-14">
        {/* Fondo con círculos suaves */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/20 opacity-100" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-burgundy-300/40 opacity-100" />
          <div className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/3 w-80 h-80 rounded-full bg-white/10 opacity-100" />
          {/* Grilla de puntos */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.25) 1px, transparent 1px)`,
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Logo instanceId="login-panel" markSize={30} light />
        </div>

        {/* Quote central */}
        <div className="relative z-10 max-w-sm">
          <p className="font-heading text-4xl xl:text-5xl text-white leading-[1.2]">
            El descanso es un lujo que mereces cada noche.
          </p>
          <p className="mt-6 text-white/80 text-sm leading-relaxed">
            Pijamas artesanales desde Ibagué, Colombia — para tus momentos más íntimos.
          </p>
        </div>

        {/* Líneas decorativas */}
        <div className="relative z-10 flex items-center gap-2">
          <span className="block h-[2px] w-10 rounded-full bg-white/70" />
          <span className="block h-[2px] w-4 rounded-full bg-white/40" />
          <span className="block h-[2px] w-2 rounded-full bg-white/20" />
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center px-6 py-14 bg-white">
        <div className="w-full max-w-[420px]">

          {/* Logo móvil */}
          <div className="lg:hidden flex justify-center mb-10">
            <Logo instanceId="login-mobile" markSize={38} />
          </div>

          {/* Encabezado */}
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-2">Cuenta</p>
            <h1 className="font-heading text-3xl text-warm-900">Bienvenida de vuelta</h1>
            <p className="mt-2 text-sm text-warm-400">Ingresa con tu cuenta para continuar</p>
          </div>

          <LoginForm />

          <p className="mt-8 text-center text-xs text-warm-300">
            Al ingresar aceptas nuestra{" "}
            <Link href="/politica-de-privacidad" className="underline hover:text-warm-500 transition-colors">
              política de privacidad
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
