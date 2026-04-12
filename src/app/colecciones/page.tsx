import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCategories } from "@/lib/woocommerce";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

export const revalidate = 300;

export const metadata: Metadata = {
  title: `Colecciones | ${SITE_NAME}`,
  description: `Explora todas las colecciones de pijamas de ${SITE_NAME}. Pijama Victoria, Nahomi, Candy, Malibú y más. Envíos a toda Colombia.`,
  alternates: { canonical: `${SITE_URL}/colecciones` },
  openGraph: {
    title: `Todas las Colecciones | ${SITE_NAME}`,
    description: `Más de 18 colecciones de pijamas para mujer. Encuentra la tuya.`,
    url: `${SITE_URL}/colecciones`,
  },
  twitter: {
    card: "summary_large_image",
    title: `Colecciones de Pijamas | ${SITE_NAME}`,
    description: `Explora nuestras colecciones de pijamas para mujer. Envíos a toda Colombia.`,
  },
};

export default async function ColeccionesPage() {
  const categories = await getCategories().catch(() => []);

  const filtered = categories
    .filter((c) => c.count > 0 && c.slug !== "uncategorized")
    .sort((a, b) => b.count - a.count);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Colecciones de Pijamas | ${SITE_NAME}`,
    url: `${SITE_URL}/colecciones`,
    description: `Todas las colecciones de pijamas para mujer de ${SITE_NAME}. Envíos a toda Colombia.`,
    hasPart: filtered.map((c) => ({
      "@type": "ItemList",
      name: c.name,
      url: `${SITE_URL}/categorias/${c.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", href: "/" },
          { name: "Colecciones", href: "/colecciones" },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <nav className="text-sm text-warm-400 mb-4" aria-label="Ruta de navegación">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="hover:text-burgundy-500 transition-colors">
                  Inicio
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-warm-700 font-medium">Colecciones</li>
            </ol>
          </nav>
          <h1 className="font-heading text-4xl sm:text-5xl text-warm-900">
            Nuestras Colecciones
          </h1>
          <p className="mt-3 text-warm-500 text-lg max-w-xl">
            {filtered.length} colecciones disponibles. Encuentra el estilo
            perfecto para ti.
          </p>
        </div>

        {/* Grid de categorías */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filtered.map((category, index) => (
            <Link
              key={category.id}
              href={`/categorias/${category.slug}`}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-cream-100 shadow-sm hover:shadow-md transition-shadow"
            >
              {category.image ? (
                <Image
                  src={category.image.src}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  priority={index < 8}
                />
              ) : (
                <div className="h-full w-full bg-linear-to-br from-rose-100 via-cream-100 to-rose-200" />
              )}
              {/* Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/20 to-transparent" />
              {/* Text */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h2 className="font-heading text-lg leading-tight text-white">
                  {category.name}
                </h2>
                <p className="mt-0.5 text-sm text-white/75">
                  {category.count}{" "}
                  {category.count === 1 ? "producto" : "productos"}
                </p>
              </div>
              {/* Hover indicator */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-burgundy-600">
                  Ver →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-warm-400">No hay colecciones disponibles.</p>
          </div>
        )}
      </div>
    </>
  );
}
