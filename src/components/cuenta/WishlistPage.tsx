"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist";
import { useHydration } from "@/hooks/useHydration";
import { formatPrice } from "@/lib/formatters";

export function WishlistPage() {
  const { items, remove, clear } = useWishlistStore();
  const hydrated = useHydration();

  return (
    <div className="min-h-screen bg-warm-50">

      {/* Header */}
      <div className="relative overflow-hidden bg-burgundy-500">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10" />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
          <Link
            href="/cuenta"
            className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-white/60 hover:text-white transition-colors mb-4"
          >
            ← Mi cuenta
          </Link>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-2">
                Mi lista
              </p>
              <h1 className="font-heading text-3xl sm:text-4xl text-white flex items-center gap-3">
                Favoritos
                <Heart className="h-7 w-7 fill-white/30 text-white/60" />
              </h1>
            </div>
            {hydrated && items.length > 0 && (
              <button
                onClick={clear}
                className="text-xs text-white/60 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" /> Limpiar lista
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">

        {!hydrated || items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-warm-100 p-14 text-center shadow-sm">
            <div className="mx-auto h-14 w-14 flex items-center justify-center rounded-full bg-burgundy-50 mb-4">
              <Heart className="h-6 w-6 text-burgundy-300" />
            </div>
            <p className="font-semibold text-warm-700 text-sm mb-1">Sin favoritos aún</p>
            <p className="text-xs text-warm-400 mb-6">
              Guarda los productos que te gustan tocando el corazón en cada card.
            </p>
            <Link
              href="/colecciones"
              className="inline-flex items-center gap-2 rounded-full bg-burgundy-500 px-6 py-3 text-sm font-semibold text-white hover:bg-burgundy-600 transition-colors"
            >
              <ShoppingBag className="h-4 w-4" /> Ver colecciones
            </Link>
          </div>
        ) : (
          <>
            <p className="text-xs text-warm-400 mb-5">
              {items.length} {items.length === 1 ? "producto guardado" : "productos guardados"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="bg-white rounded-2xl border border-warm-100 shadow-sm overflow-hidden flex"
                >
                  {/* Imagen */}
                  <Link href={`/producto/${item.slug}`} className="shrink-0">
                    <div className="h-28 w-28 sm:h-32 sm:w-32 bg-warm-50 overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={128}
                          height={128}
                          className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-warm-200" />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0 p-4 flex flex-col justify-between">
                    <div>
                      <Link href={`/producto/${item.slug}`}>
                        <p className="text-sm font-medium text-warm-800 hover:text-burgundy-500 transition-colors line-clamp-2 leading-snug">
                          {item.name}
                        </p>
                      </Link>
                      <p className="text-base font-semibold text-burgundy-500 mt-1">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Link
                        href={`/producto/${item.slug}`}
                        className="flex-1 text-center rounded-full bg-burgundy-500 px-4 py-2 text-xs font-semibold text-white hover:bg-burgundy-600 transition-colors"
                      >
                        Ver producto
                      </Link>
                      <button
                        onClick={() => remove(item.productId)}
                        className="p-2 text-warm-300 hover:text-red-400 transition-colors"
                        aria-label="Quitar de favoritos"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
