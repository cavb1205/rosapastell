"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRecentlyViewedStore, type RecentItem } from "@/store/recently-viewed";
import { formatPrice } from "@/lib/formatters";
import { useHydration } from "@/hooks/useHydration";

interface RecentlyViewedProps {
  current: RecentItem;
}

export function RecentlyViewed({ current }: RecentlyViewedProps) {
  const { items, add } = useRecentlyViewedStore();
  const hydrated = useHydration();

  // Registrar el producto actual al montar
  useEffect(() => {
    add(current);
  }, [current.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!hydrated) return null;

  // Excluir el producto actual de la lista mostrada
  const others = items.filter((i) => i.id !== current.id);

  if (others.length === 0) return null;

  return (
    <section className="mt-16 pt-14 border-t border-warm-100">
      <p className="text-xs font-semibold uppercase tracking-widest text-burgundy-400 mb-2">
        Tu historial
      </p>
      <h2 className="font-heading text-2xl text-warm-900 mb-6">
        Vistos recientemente
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {others.map((item) => (
          <Link
            key={item.id}
            href={`/producto/${item.slug}`}
            className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgba(248,155,187,0.35)] transition-shadow"
          >
            <div className="relative aspect-square bg-cream-100 overflow-hidden">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-warm-300 text-xs">
                  Sin imagen
                </div>
              )}
            </div>
            <div className="p-2.5">
              <p className="text-xs font-medium text-warm-700 line-clamp-2 group-hover:text-burgundy-500 transition-colors">
                {item.name}
              </p>
              <p className="mt-1 text-xs font-semibold text-burgundy-500">
                {formatPrice(item.price)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
