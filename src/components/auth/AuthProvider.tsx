"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";

// Hidrata el store de auth consultando la cookie en el servidor vía API.
// Re-verifica al volver a la tab para sincronizar logout entre tabs.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    fetch("/api/auth/me", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setAuth(data.user, "");
        } else {
          clearAuth();
        }
      })
      .catch(() => clearAuth())
      .finally(() => clearTimeout(timeout));

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [setAuth, clearAuth, setLoading]);

  // Re-check auth when tab becomes visible (sync logout across tabs)
  useEffect(() => {
    function onVisibility() {
      if (document.visibilityState !== "visible") return;
      fetch("/api/auth/me")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) {
            setAuth(data.user, "");
          } else {
            clearAuth();
          }
        })
        .catch(() => {});
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [setAuth, clearAuth]);

  return <>{children}</>;
}
