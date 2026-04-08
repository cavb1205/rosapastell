"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const openRegisterModal = useUIStore((s) => s.openRegisterModal);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/cuenta";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Credenciales incorrectas");
        return;
      }

      setAuth(data.user, "");
      // Mantener loading durante la navegación — setLoading(false) nunca se llama en éxito
      router.push(redirectTo);
      router.refresh();
      return;
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-warm-300 bg-warm-50 px-4 py-4 text-sm text-warm-900 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 focus:bg-white hover:border-warm-400 transition-all duration-200";

  const labelClass = "block text-xs font-semibold uppercase tracking-widest text-warm-500 mb-2.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Email */}
      <div>
        <label className={labelClass}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="tu@email.com"
          className={inputClass}
        />
      </div>

      {/* Contraseña */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className={labelClass} style={{ marginBottom: 0 }}>Contraseña</label>
          <Link
            href="/cuenta/recuperar"
            className="text-xs text-warm-400 hover:text-burgundy-500 transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className={`${inputClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-300 hover:text-warm-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-burgundy-500 px-6 py-4 text-sm font-semibold tracking-wide text-white shadow-sm hover:bg-burgundy-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Ingresando...
            </>
          ) : "Ingresar"}
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <span className="flex-1 h-px bg-warm-200" />
        <span className="text-xs text-warm-400">¿Eres nueva?</span>
        <span className="flex-1 h-px bg-warm-200" />
      </div>

      {/* Register link */}
      <button
        type="button"
        onClick={() => openRegisterModal()}
        className="block w-full text-center rounded-full border-2 border-warm-200 px-6 py-3.5 text-sm font-semibold text-warm-600 hover:border-burgundy-300 hover:text-burgundy-500 transition-all"
      >
        Crear una cuenta
      </button>

    </form>
  );
}
