"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";

// Hidrata el store de auth consultando la cookie en el servidor vía API
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          // token no se expone al cliente — solo el user
          setAuth(data.user, "");
        } else {
          clearAuth();
        }
      })
      .catch(() => clearAuth());
  }, [setAuth, clearAuth, setLoading]);

  return <>{children}</>;
}
