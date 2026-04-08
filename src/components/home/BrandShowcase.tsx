import Image from "next/image";
import Link from "next/link";
import { NAV_LINKS } from "@/lib/constants";

export function BrandShowcase() {
  return (
    <section className="w-full bg-white border-b border-warm-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Logo — full width mobile (igual que el banner), grande en desktop */}
        <div className="pt-8 pb-4 flex justify-center">
          <div className="w-full md:max-w-xl lg:max-w-3xl">
            <Image
              src="/logo-rosapastell.png"
              alt="Rosa Pastell — Pijamas con estilo y comodidad"
              width={760}
              height={215}
              className="w-full h-auto object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 576px, 768px"
              priority
            />
          </div>
        </div>

        {/* Tagline */}
        <div className="flex items-center justify-center gap-3 pb-5">
          <span className="block h-px w-10 bg-burgundy-300" />
          <span className="text-burgundy-400">♥</span>
          <span className="text-xs tracking-widest uppercase text-warm-400">
            Más de 10 años vistiendo tus sueños
          </span>
          <span className="text-burgundy-400">♥</span>
          <span className="block h-px w-10 bg-burgundy-300" />
        </div>

        {/* Nav — solo desktop, oculto en mobile (usa el hamburger del header) */}
        <nav
          className="hidden md:flex items-center justify-center border-t border-warm-100"
          aria-label="Navegación principal"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative px-6 py-4 text-sm font-medium tracking-wide text-warm-600 hover:text-burgundy-500 transition-colors group"
            >
              {link.label}
              {/* Underline animado */}
              <span className="absolute bottom-0 left-6 right-6 h-0.5 bg-burgundy-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-200" />
            </Link>
          ))}
        </nav>

      </div>
    </section>
  );
}
