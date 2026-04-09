import { create } from "zustand";

interface RegisterPrefill {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface CartToast {
  id: number;
  name: string;
  size: string;
  quantity: number;
  image: string;
}

interface UIState {
  registerModalOpen: boolean;
  registerPrefill: RegisterPrefill;
  openRegisterModal: (prefill?: RegisterPrefill) => void;
  closeRegisterModal: () => void;

  cartToasts: CartToast[];
  showCartToast: (toast: Omit<CartToast, "id">) => void;
  dismissCartToast: (id: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  registerModalOpen: false,
  registerPrefill: {},
  openRegisterModal: (prefill = {}) =>
    set({ registerModalOpen: true, registerPrefill: prefill }),
  closeRegisterModal: () =>
    set({ registerModalOpen: false, registerPrefill: {} }),

  cartToasts: [],
  showCartToast: (toast) => {
    const id = Date.now();
    set((s) => ({ cartToasts: [...s.cartToasts, { ...toast, id }] }));
    setTimeout(() => {
      set((s) => ({ cartToasts: s.cartToasts.filter((t) => t.id !== id) }));
    }, 3500);
  },
  dismissCartToast: (id) =>
    set((s) => ({ cartToasts: s.cartToasts.filter((t) => t.id !== id) })),
}));
