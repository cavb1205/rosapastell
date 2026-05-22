import Image from "next/image";
import { HeroBannerCTA } from "./HeroBannerCTA";

const WHOLESALE_BANNER = "/banner-rosapastell.com-2021.webp";

export function HeroBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="relative w-full overflow-hidden rounded-2xl shadow-md hover:shadow-[0_8px_32px_rgba(248,155,187,0.4)] transition-all duration-300 group aspect-[1024/577] max-h-105">
        <Image
          src={WHOLESALE_BANNER}
          alt="¿Quieres ser Mayorista? Regístrate con tus datos — Rosa Pastell"
          fill
          className="object-contain group-hover:scale-[1.01] transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1280px"
          priority
        />
        <HeroBannerCTA />
      </div>
    </section>
  );
}
