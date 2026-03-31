import Image from "next/image";
import Link from "next/link";
import type { WooCategory } from "@/types/product";

interface CategoryShowcaseProps {
  categories: WooCategory[];
}

export function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="font-heading text-3xl sm:text-4xl text-warm-900">
            Nuestras Colecciones
          </h2>
          <p className="mt-2 text-warm-500">
            Encuentra el estilo perfecto para ti
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categorias/${category.slug}`}
              className="group relative aspect-square rounded-xl overflow-hidden bg-cream-100"
            >
              {category.image ? (
                <Image
                  src={category.image.src}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-rose-100 to-cream-200" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-heading text-lg text-white">
                  {category.name}
                </h3>
                <p className="text-sm text-white/80">
                  {category.count} productos
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
