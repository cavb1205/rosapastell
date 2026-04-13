"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/formatters";
import { useHydration } from "@/hooks/useHydration";

export function CartDrawer() {
  const { items, drawerOpen, closeDrawer, removeItem, updateQuantity, getTotal } = useCartStore();
  const hydrated = useHydration();
  const total = getTotal();

  // Bloquear scroll del body cuando el drawer está abierto
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  // Cerrar con Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeDrawer();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeDrawer]);

  if (!hydrated) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 ${
          drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-warm-100">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-5 w-5 text-burgundy-500" />
            <h2 className="font-heading text-xl text-warm-900">Tu carrito</h2>
            {items.length > 0 && (
              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-burgundy-500 text-white text-[11px] font-bold">
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={closeDrawer}
            className="p-2 text-warm-400 hover:text-warm-700 transition-colors rounded-lg hover:bg-warm-50"
            aria-label="Cerrar carrito"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-16 text-center">
              <ShoppingBag className="h-14 w-14 text-warm-200" />
              <p className="text-warm-500 text-sm">Tu carrito está vacío</p>
              <button
                onClick={closeDrawer}
                className="text-sm font-semibold text-burgundy-700 hover:text-burgundy-800 underline underline-offset-2 transition-colors"
              >
                Seguir comprando
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.productId}-${item.variationId}`}
                className="flex gap-4"
              >
                {/* Image */}
                <Link
                  href={`/producto/${item.slug}`}
                  onClick={closeDrawer}
                  className="flex-shrink-0"
                >
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-cream-100">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/producto/${item.slug}`}
                    onClick={closeDrawer}
                    className="text-sm font-medium text-warm-800 hover:text-burgundy-500 transition-colors line-clamp-2 leading-snug"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-warm-400 mt-0.5">Talla: {item.size}</p>
                  <p className="text-sm font-semibold text-burgundy-500 mt-1">
                    {formatPrice(item.price)}
                  </p>

                  {/* Quantity + delete */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-warm-200 rounded-full overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variationId)}
                        className="px-2.5 py-1.5 text-warm-500 hover:bg-warm-50 transition-colors"
                        aria-label="Reducir"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-7 text-center text-sm font-semibold text-warm-800 select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variationId)}
                        className="px-2.5 py-1.5 text-warm-500 hover:bg-warm-50 transition-colors"
                        aria-label="Aumentar"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId, item.variationId)}
                      className="p-1.5 text-warm-300 hover:text-red-400 transition-colors"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="flex-shrink-0 text-sm font-bold text-warm-800 pt-0.5">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-warm-100 px-6 py-5 space-y-4 bg-warm-50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-warm-600">Subtotal</span>
              <span className="text-lg font-bold text-warm-900">{formatPrice(total)}</span>
            </div>
            <p className="text-xs text-warm-400 -mt-2">
              Envío se coordina al confirmar el pedido
            </p>
            <Link
              href="/checkout"
              onClick={closeDrawer}
              className="block w-full text-center rounded-full bg-burgundy-500 px-6 py-4 text-sm font-semibold text-white hover:bg-burgundy-600 transition-colors"
            >
              Finalizar compra
            </Link>
            <button
              onClick={closeDrawer}
              className="block w-full text-center text-sm text-warm-500 hover:text-warm-700 transition-colors"
            >
              Seguir comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
}
