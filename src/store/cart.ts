"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, CartState } from "@/types/cart";

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item: CartItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) =>
              i.productId === item.productId &&
              i.variationId === item.variationId
          );

          if (existingIndex >= 0) {
            const updated = [...state.items];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + item.quantity,
            };
            return { items: updated };
          }

          return { items: [...state.items, item] };
        });
      },

      removeItem: (productId: number, variationId?: number) => {
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(
                i.productId === productId &&
                i.variationId === (variationId ?? i.variationId)
              )
          ),
        }));
      },

      updateQuantity: (
        productId: number,
        quantity: number,
        variationId?: number
      ) => {
        if (quantity <= 0) {
          get().removeItem(productId, variationId);
          return;
        }

        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId &&
            i.variationId === (variationId ?? i.variationId)
              ? { ...i, quantity }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "rosa-pastell-cart",
    }
  )
);
