"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const inputClass =
    "w-full rounded-xl border border-warm-300 bg-warm-50 px-4 py-4 text-sm text-warm-900 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 focus:bg-white hover:border-warm-400 transition-all duration-200";

  const labelClass =
    "block text-xs font-semibold uppercase tracking-widest text-warm-500 mb-2.5";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "No se pudo enviar el email. Intenta de nuevo.");
        return;
      }

      setSent(true);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle className="h-14 w-14 text-green-400" />
        </div>
        <h2 className="font-heading text-2xl text-warm-900">Revisa tu email</h2>
        <p className="text-sm text-warm-500 leading-relaxed">
          Si el email <span className="font-semibold text-warm-700">{email}</span> está
          registrado, recibirás un enlace para restablecer tu contraseña en los próximos
          minutos.
        </p>
        <p className="text-xs text-warm-400">
          ¿No lo encuentras? Revisa la carpeta de spam.
        </p>
        <div className="pt-4">
          <Link
            href="/cuenta/ingresar"
            className="text-sm font-semibold text-burgundy-500 hover:text-burgundy-700 transition-colors"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className={labelClass}>Tu email</label>
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

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-burgundy-500 px-6 py-4 text-sm font-semibold tracking-wide text-white shadow-sm hover:bg-burgundy-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Enviando..." : "Enviar enlace de recuperación"}
        </button>
      </div>

      <div className="text-center">
        <Link
          href="/cuenta/ingresar"
          className="text-sm text-warm-400 hover:text-warm-600 transition-colors"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    </form>
  );
}
