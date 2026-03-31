"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/formatters";
import { useHydration } from "@/hooks/useHydration";

export function CartPageClient() {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();
  const hydrated = useHydration();

  if (!hydrated) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 bg-warm-100 rounded-xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-warm-200 mb-4" />
        <h2 className="font-heading text-2xl text-warm-700 mb-2">
          Tu carrito está vacío
        </h2>
        <p className="text-warm-500 mb-8">
          Agrega productos para continuar con tu compra.
        </p>
        <Link
          href="/categorias/pijama-victoria"
          className="inline-flex rounded-full bg-burgundy-500 px-8 py-3 text-sm font-semibold text-white hover:bg-burgundy-600 transition-colors"
        >
          Ver Productos
        </Link>
      </div>
    );
  }

  const total = getTotal();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Items */}
      <div className="lg:col-span-2 space-y-4">
        {items.map((item) => (
          <div
            key={`${item.productId}-${item.variationId}`}
            className="flex gap-4 bg-white rounded-xl p-4 shadow-sm"
          >
            <Link href={`/producto/${item.slug}`} className="flex-shrink-0">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-cream-100">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                )}
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={`/producto/${item.slug}`}>
                <h3 className="text-sm font-medium text-warm-800 hover:text-burgundy-500 transition-colors line-clamp-2">
                  {item.name}
                </h3>
              </Link>
              <p className="text-xs text-warm-400 mt-0.5">Talla: {item.size}</p>
              <p className="text-sm font-semibold text-burgundy-500 mt-1">
                {formatPrice(item.price)}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() =>
                    updateQuantity(item.productId, item.quantity - 1, item.variationId)
                  }
                  className="h-7 w-7 flex items-center justify-center rounded-full border border-warm-200 text-warm-600 hover:bg-warm-50"
                  aria-label="Reducir cantidad"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-6 text-center text-sm font-medium text-warm-700">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    updateQuantity(item.productId, item.quantity + 1, item.variationId)
                  }
                  className="h-7 w-7 flex items-center justify-center rounded-full border border-warm-200 text-warm-600 hover:bg-warm-50"
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
            <div className="flex flex-col items-end justify-between">
              <button
                onClick={() => removeItem(item.productId, item.variationId)}
                className="text-warm-300 hover:text-red-400 transition-colors"
                aria-label="Eliminar producto"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <p className="text-sm font-bold text-warm-800">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-heading text-xl text-warm-900 mb-4">Resumen</h2>
          <div className="space-y-2 border-b border-warm-100 pb-4 mb-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.variationId}`}
                className="flex justify-between text-sm text-warm-600"
              >
                <span className="truncate mr-2">
                  {item.name} ({item.size}) ×{item.quantity}
                </span>
                <span className="flex-shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold text-warm-900 text-lg mb-6">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <Link
            href="/checkout"
            className="block w-full text-center rounded-full bg-burgundy-500 px-6 py-4 text-sm font-semibold text-white hover:bg-burgundy-600 transition-colors"
          >
            Finalizar Compra
          </Link>
          <Link
            href="/categorias/pijama-victoria"
            className="block w-full text-center mt-3 text-sm text-warm-500 hover:text-warm-700 transition-colors"
          >
            Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
