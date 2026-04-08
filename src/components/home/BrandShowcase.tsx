import Image from "next/image";

export function BrandShowcase() {
  return (
    <section className="w-full bg-white py-12 sm:py-16 border-b border-warm-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-5">

        <Image
          src="/logo-rosapastell.png"
          alt="Rosa Pastell — Pijamas"
          width={760}
          height={215}
          className="w-64 sm:w-96 lg:w-130 object-contain"
          priority
        />

        <div className="flex items-center gap-3">
          <span className="block h-px w-12 bg-burgundy-300" />
          <span className="text-burgundy-400 text-base">♥</span>
          <span className="text-xs tracking-widest uppercase text-warm-400">
            Más de 10 años vistiendo tus sueños
          </span>
          <span className="text-burgundy-400 text-base">♥</span>
          <span className="block h-px w-12 bg-burgundy-300" />
        </div>

      </div>
    </section>
  );
}
