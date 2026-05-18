"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle, AlertTriangle } from "lucide-react";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const inputClass =
    "w-full rounded-xl border border-warm-300 bg-warm-50 px-4 py-4 text-base text-warm-900 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 focus:bg-white hover:border-warm-400 transition-all duration-200";

  const labelClass = "block text-xs font-semibold uppercase tracking-widest text-warm-500 mb-2.5";

  // Si no hay token o email, el enlace es inválido
  if (!token || !email) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <AlertTriangle className="h-14 w-14 text-amber-400" />
        </div>
        <h2 className="font-heading text-2xl text-warm-900">Enlace inválido</h2>
        <p className="text-sm text-warm-500 leading-relaxed">
          Este enlace de recuperación no es válido. Solicita uno nuevo.
        </p>
        <div className="pt-4">
          <Link
            href="/cuenta/recuperar"
            className="inline-block rounded-full bg-burgundy-500 px-6 py-3 text-sm font-semibold text-white hover:bg-burgundy-600 transition-colors"
          >
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "No se pudo restablecer la contraseña.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-sage-100">
            <CheckCircle className="h-7 w-7 text-sage-500" />
          </div>
        </div>
        <h2 className="font-heading text-2xl text-warm-900">¡Contraseña actualizada!</h2>
        <p className="text-sm text-warm-500 leading-relaxed">
          Tu contraseña fue cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
        </p>
        <div className="pt-4">
          <Link
            href="/cuenta/ingresar"
            className="inline-block rounded-full bg-burgundy-500 px-6 py-3 text-sm font-semibold text-white hover:bg-burgundy-600 transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Nueva contraseña */}
      <div>
        <label className={labelClass}>Nueva contraseña</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            placeholder="Mín. 8 caracteres"
            className={`${inputClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-300 hover:text-warm-600 transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Confirmar contraseña */}
      <div>
        <label className={labelClass}>Confirmar contraseña</label>
        <input
          type={showPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          placeholder="Repite tu contraseña"
          className={inputClass}
        />
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
              Actualizando...
            </>
          ) : "Guardar nueva contraseña"}
        </button>
      </div>

    </form>
  );
}
