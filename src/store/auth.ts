"use client";

import { create } from "zustand";
import type { AuthState, WPUser } from "@/types/auth";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  setAuth: (user: WPUser, token: string) => set({ user, token, isLoading: false }),

  clearAuth: () => set({ user: null, token: null, isLoading: false }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
