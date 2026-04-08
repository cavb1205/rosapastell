"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/store/auth";

interface RegisterFormProps {
  initialValues?: { firstName?: string; lastName?: string; email?: string };
  onSuccess?: () => void;
}

export function RegisterForm({ initialValues, onSuccess }: RegisterFormProps) {
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    firstName: initialValues?.firstName ?? searchParams.get("firstName") ?? "",
    lastName: initialValues?.lastName ?? searchParams.get("lastName") ?? "",
    email: initialValues?.email ?? searchParams.get("email") ?? "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [emailExists, setEmailExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setEmailExists(false);

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "EMAIL_ALREADY_REGISTERED") {
          setEmailExists(true);
        } else {
          setError(data.error || "Error al crear la cuenta");
        }
        return;
      }

      setAuth(data.user, "");
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/cuenta");
        router.refresh();
      }
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
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Nombre y apellido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Nombre</label>
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
            autoComplete="given-name"
            placeholder="Tu nombre"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Apellido</label>
          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
            autoComplete="family-name"
            placeholder="Tu apellido"
            className={inputClass}
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className={labelClass}>Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          autoComplete="email"
          placeholder="tu@email.com"
          className={inputClass}
        />
      </div>

      {/* Teléfono */}
      <div>
        <label className={labelClass}>
          Teléfono / WhatsApp{" "}
          <span className="normal-case font-normal text-warm-300 tracking-normal">(opcional)</span>
        </label>
        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          autoComplete="tel"
          placeholder="+57 300 000 0000"
          className={inputClass}
        />
      </div>

      {/* Contraseñas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
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
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className={labelClass}>Confirmar</label>
          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
            placeholder="Repite tu contraseña"
            className={inputClass}
          />
        </div>
      </div>

      {/* Email ya registrado */}
      {emailExists && (
        <div className="rounded-xl bg-burgundy-50 border border-burgundy-200 px-4 py-3 space-y-2">
          <p className="text-sm text-burgundy-700 font-medium">
            Este email ya tiene una cuenta registrada.
          </p>
          <Link
            href="/cuenta/ingresar"
            className="inline-block text-sm font-semibold text-burgundy-500 underline underline-offset-2 hover:text-burgundy-700 transition-colors"
          >
            Ingresar con este email →
          </Link>
        </div>
      )}

      {/* Error genérico */}
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
          className="w-full rounded-full bg-burgundy-500 px-6 py-4 text-sm font-semibold tracking-wide text-white shadow-sm hover:bg-burgundy-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <span className="flex-1 h-px bg-warm-200" />
        <span className="text-xs text-warm-400">¿Ya tienes cuenta?</span>
        <span className="flex-1 h-px bg-warm-200" />
      </div>

      <Link
        href="/cuenta/ingresar"
        className="block w-full text-center rounded-full border-2 border-warm-200 px-6 py-3.5 text-sm font-semibold text-warm-600 hover:border-burgundy-300 hover:text-burgundy-500 transition-all"
      >
        Ingresar
      </Link>

    </form>
  );
}
