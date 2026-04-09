"use client";

import Image from "next/image";
import { X, ShoppingBag } from "lucide-react";
import { useUIStore } from "@/store/ui";
import { useCartStore } from "@/store/cart";

export function CartToastContainer() {
  const { cartToasts, dismissCartToast } = useUIStore();
  const openDrawer = useCartStore((s) => s.openDrawer);

  if (cartToasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm pointer-events-none">
      {cartToasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 bg-white rounded-2xl shadow-lg border border-warm-100 px-4 py-3 animate-slide-up"
        >
          {/* Imagen */}
          {toast.image ? (
            <div className="h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-warm-50">
              <Image
                src={toast.image}
                alt={toast.name}
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-12 w-12 shrink-0 rounded-xl bg-burgundy-50 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-burgundy-400" />
            </div>
          )}

          {/* Texto */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-warm-500 uppercase tracking-wide mb-0.5">
              Agregado al carrito
            </p>
            <p className="text-sm font-medium text-warm-900 truncate">{toast.name}</p>
            <p className="text-xs text-warm-400">
              Talla {toast.size} · {toast.quantity > 1 ? `${toast.quantity} uds.` : "1 ud."}
            </p>
          </div>

          {/* Acción */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <button
              onClick={() => dismissCartToast(toast.id)}
              className="text-warm-300 hover:text-warm-500 transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              onClick={() => { openDrawer(); dismissCartToast(toast.id); }}
              className="text-xs font-semibold text-burgundy-500 hover:text-burgundy-700 transition-colors whitespace-nowrap"
            >
              Ver carrito →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
