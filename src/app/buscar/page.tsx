import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";
import { SearchClient } from "@/components/catalog/SearchClient";

export const metadata: Metadata = {
  title: `Buscar Productos | ${SITE_NAME}`,
  robots: { index: false, follow: true },
};

export default function BuscarPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-heading text-3xl text-warm-900 mb-8">
        Buscar Productos
      </h1>
      <SearchClient />
    </div>
  );
}
