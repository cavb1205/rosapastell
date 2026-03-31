import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Logo } from "@/components/ui/Logo";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Crear cuenta | ${SITE_NAME}`,
  robots: { index: false },
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">

      {/* Panel decorativo izquierdo */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-[42%] relative overflow-hidden bg-burgundy-900 flex-col items-start justify-between p-14">
        {/* Fondo con círculos suaves */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[480px] h-[480px] rounded-full bg-burgundy-700 opacity-40" />
          <div className="absolute -bottom-40 -right-32 w-[420px] h-[420px] rounded-full bg-rose-900 opacity-35" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-burgundy-500 opacity-30" />
          {/* Grilla de puntos */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(212,160,160,0.4) 1px, transparent 1px)`,
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Logo instanceId="register-panel" markSize={30} light />
        </div>

        {/* Quote */}
        <div className="relative z-10 max-w-sm">
          <p className="font-heading text-4xl xl:text-5xl text-white leading-[1.2]">
            Únete a nuestra familia de pijamas.
          </p>
          <p className="mt-6 text-rose-300/80 text-sm leading-relaxed">
            Crea tu cuenta y accede a pedidos fáciles, seguimiento y precios especiales para clientes mayoristas.
          </p>
        </div>

        {/* Líneas decorativas */}
        <div className="relative z-10 flex items-center gap-2">
          <span className="block h-[2px] w-2 rounded-full bg-rose-700" />
          <span className="block h-[2px] w-4 rounded-full bg-rose-600" />
          <span className="block h-[2px] w-10 rounded-full bg-rose-400" />
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center px-6 py-14 bg-white">
        <div className="w-full max-w-[520px]">

          {/* Logo móvil */}
          <div className="lg:hidden flex justify-center mb-10">
            <Logo instanceId="register-mobile" markSize={38} />
          </div>

          {/* Encabezado */}
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-rose-400 mb-2">Nueva cuenta</p>
            <h1 className="font-heading text-3xl text-warm-900">Crear cuenta</h1>
            <p className="mt-2 text-sm text-warm-400">Regístrate para gestionar tus pedidos fácilmente</p>
          </div>

          <RegisterForm />

          <p className="mt-8 text-center text-xs text-warm-300">
            Al registrarte aceptas nuestra{" "}
            <Link href="/como-comprar" className="underline hover:text-warm-500 transition-colors">
              política de privacidad
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
