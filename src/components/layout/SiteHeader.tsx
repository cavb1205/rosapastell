import Image from "next/image";
import Link from "next/link";
import { NAV_LINKS } from "@/lib/constants";
import { MobileHeader, DesktopActions } from "./HeaderClient";

export function SiteHeader() {
  return (
    <header className="relative w-full bg-white border-b border-warm-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Mobile: hamburger + action icons + drawer */}
        <MobileHeader />

        {/* Logo */}
        <div className="flex justify-center pt-2 md:pt-8 pb-3">
          <div className="w-full md:max-w-xl lg:max-w-3xl">
            <Link href="/">
              <Image
                src="/logo-rosapastell.png"
                alt="Rosa Pastell — Pijamas"
                width={760}
                height={215}
                className="w-full h-auto object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 576px, 768px"
                priority
              />
            </Link>
          </div>
        </div>

        {/* Tagline */}
        <div className="flex items-center justify-center gap-3 pb-4">
          <span className="block h-px w-10 bg-burgundy-300" />
          <span className="text-burgundy-400">♥</span>
          <span className="text-xs tracking-widest uppercase text-warm-500">
            Más de 10 años vistiendo tus sueños
          </span>
          <span className="text-burgundy-400">♥</span>
          <span className="block h-px w-10 bg-burgundy-300" />
        </div>

        {/* Desktop nav: static links + client action icons */}
        <div className="hidden md:flex items-center border-t border-warm-100">
          <div className="flex-1 flex items-center justify-center">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-6 py-4 text-sm font-medium tracking-wide text-warm-600 hover:text-burgundy-500 transition-colors group"
              >
                {link.label}
                <span className="absolute bottom-0 left-6 right-6 h-0.5 bg-burgundy-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-200" />
              </Link>
            ))}
          </div>
          <DesktopActions />
        </div>
      </div>
    </header>
  );
}
