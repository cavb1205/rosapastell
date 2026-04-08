import { create } from "zustand";

interface RegisterPrefill {
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface UIState {
  registerModalOpen: boolean;
  registerPrefill: RegisterPrefill;
  openRegisterModal: (prefill?: RegisterPrefill) => void;
  closeRegisterModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  registerModalOpen: false,
  registerPrefill: {},
  openRegisterModal: (prefill = {}) =>
    set({ registerModalOpen: true, registerPrefill: prefill }),
  closeRegisterModal: () =>
    set({ registerModalOpen: false, registerPrefill: {} }),
}));
