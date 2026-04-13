"use client";

import Image from "next/image";
import { useUIStore } from "@/store/ui";

const WHOLESALE_BANNER = "/banner-rosapastell.com-2021.webp";

export function HeroBanner() {
  const openRegisterModal = useUIStore((s) => s.openRegisterModal);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <button
        onClick={() => openRegisterModal()}
        className="block relative w-full overflow-hidden rounded-2xl shadow-md hover:shadow-[0_8px_32px_rgba(248,155,187,0.4)] transition-all duration-300 group cursor-pointer"
        aria-label="Regístrate →"
      >
        <Image
          src={WHOLESALE_BANNER}
          alt="¿Quieres ser Mayorista? Regístrate con tus datos — Rosa Pastell"
          width={1024}
          height={577}
          className="w-full h-auto max-h-105 object-contain group-hover:scale-[1.01] transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1280px"
          priority
        />
        <div className="absolute bottom-4 right-4 bg-burgundy-500 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-md opacity-90 group-hover:opacity-100 transition-opacity">
          Regístrate →
        </div>
      </button>
    </section>
  );
}
