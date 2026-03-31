"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth";

interface LogoutButtonProps {
  variant?: "light" | "dark";
}

export function LogoutButton({ variant = "light" }: LogoutButtonProps) {
  const { clearAuth } = useAuthStore();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    clearAuth();
    router.push("/");
    router.refresh();
  }

  if (variant === "dark") {
    return (
      <button
        onClick={handleLogout}
        className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-rose-200/50 hover:text-rose-200 transition-colors"
      >
        <LogOut className="h-3.5 w-3.5" />
        Salir
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-sm text-warm-400 hover:text-warm-700 transition-colors"
    >
      <LogOut className="h-4 w-4" />
      Cerrar sesión
    </button>
  );
}
