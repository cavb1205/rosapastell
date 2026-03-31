"use client";

import { useState } from "react";
import { Eye, EyeOff, Check, Loader2, Lock, CheckCircle2, X } from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-warm-300 bg-warm-50 px-4 py-3.5 text-sm text-warm-900 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 focus:bg-white hover:border-warm-400 transition-all";
const labelClass =
  "block text-xs font-semibold uppercase tracking-widest text-warm-500 mb-2";

export function PasswordForm() {
  const [open, setOpen] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  function handleCancel() {
    setForm({ newPassword: "", confirmPassword: "" });
    setError("");
    setOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/cuenta/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: form.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cambiar contraseña");
      setSuccess(true);
      setForm({ newPassword: "", confirmPassword: "" });
      setTimeout(() => {
        setSuccess(false);
        setOpen(false);
      }, 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error del servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-warm-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-7 py-5 bg-warm-50 border-b border-warm-100">
        <p className="text-xs font-semibold uppercase tracking-widest text-warm-500">
          Contraseña
        </p>
        <div className="flex items-center gap-2">
          {!open ? (
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-warm-400 hover:text-burgundy-500 transition-colors"
            >
              <Lock className="h-3.5 w-3.5" />
              Cambiar
            </button>
          ) : null}
        </div>
      </div>

      {/* Contenido */}
      {!open ? (
        <div className="px-7 py-5">
          <p className="text-sm text-warm-400">
            Tu contraseña está guardada de forma segura.{" "}
            <button
              onClick={() => setOpen(true)}
              className="text-burgundy-500 font-medium underline"
            >
              Cambiar contraseña
            </button>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nueva contraseña</label>
              <div className="relative">
                <input
                  name="newPassword"
                  type={showNew ? "text" : "password"}
                  value={form.newPassword}
                  onChange={handleChange}
                  required
                  className={`${inputClass} pr-12`}
                  placeholder="Mín. 8 caracteres"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-300 hover:text-warm-600 transition-colors"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Confirmar contraseña</label>
              <input
                name="confirmPassword"
                type={showNew ? "text" : "password"}
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="Repite la contraseña"
                autoComplete="new-password"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-5 py-4">
              <X className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 rounded-xl bg-sage-50 border border-sage-200 px-5 py-4">
              <CheckCircle2 className="h-5 w-5 text-sage-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-sage-700">¡Contraseña actualizada!</p>
                <p className="text-xs text-sage-500 mt-0.5">Tu nueva contraseña está activa.</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            {success ? (
              <div className="flex items-center gap-2 rounded-full bg-sage-500 px-6 py-3 text-sm font-semibold text-white">
                <Check className="h-4 w-4" /> Actualizada
              </div>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-full bg-burgundy-500 px-6 py-3 text-sm font-semibold text-white hover:bg-burgundy-600 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {loading ? "Guardando..." : "Actualizar contraseña"}
              </button>
            )}
            {!success && (
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-full border-2 border-warm-200 px-6 py-3 text-sm font-semibold text-warm-500 hover:border-warm-300 transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
