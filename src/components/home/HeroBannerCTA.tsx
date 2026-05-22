"use client";

import { useUIStore } from "@/store/ui";

export function HeroBannerCTA() {
  const openRegisterModal = useUIStore((s) => s.openRegisterModal);

  return (
    <button
      onClick={() => openRegisterModal()}
      className="absolute inset-0 w-full h-full cursor-pointer"
      aria-label="Regístrate para ser mayorista"
    >
      <span className="absolute bottom-4 right-4 bg-burgundy-500 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-md opacity-90 group-hover:opacity-100 transition-opacity">
        Regístrate →
      </span>
    </button>
  );
}
