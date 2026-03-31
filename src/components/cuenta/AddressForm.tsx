"use client";

import { useState } from "react";
import { Pencil, X, Check, Loader2, MapPin, CheckCircle2 } from "lucide-react";
import { COLOMBIAN_DEPARTMENTS } from "@/lib/constants";
import type { WooAddress } from "@/types/customer";

interface Props {
  type: "billing" | "shipping";
  address: WooAddress;
}

const EMPTY_ADDRESS: WooAddress = {
  first_name: "",
  last_name: "",
  address_1: "",
  address_2: "",
  city: "",
  state: "",
  postcode: "",
  country: "CO",
  phone: "",
};

const inputClass =
  "w-full rounded-xl border border-warm-300 bg-warm-50 px-4 py-3.5 text-sm text-warm-900 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 focus:bg-white hover:border-warm-400 transition-all";
const labelClass =
  "block text-xs font-semibold uppercase tracking-widest text-warm-500 mb-2";

function formatAddress(addr: WooAddress): string {
  const parts = [addr.address_1, addr.city, addr.state].filter(Boolean);
  return parts.join(", ") || "—";
}

export function AddressForm({ type, address }: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<WooAddress>({ ...EMPTY_ADDRESS, ...address });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const title = type === "billing" ? "Dirección de facturación" : "Dirección de envío";

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  function handleCancel() {
    setForm({ ...EMPTY_ADDRESS, ...address });
    setEditing(false);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/cuenta/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [type]: { ...form, country: "CO" } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setEditing(false);
      }, 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  const hasAddress = !!(address.address_1 || address.city);

  return (
    <div className="bg-white rounded-2xl border border-warm-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-7 py-5 bg-warm-50 border-b border-warm-100">
        <p className="text-xs font-semibold uppercase tracking-widest text-warm-500">
          {title}
        </p>
        <div className="flex items-center gap-2">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-warm-400 hover:text-burgundy-500 transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
              {hasAddress ? "Editar" : "Agregar"}
            </button>
          ) : (
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 text-xs font-medium text-warm-400 hover:text-warm-700 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Display */}
      {!editing ? (
        <div className="px-7 py-6">
          {hasAddress ? (
            <div className="flex gap-3">
              <MapPin className="h-4 w-4 text-warm-300 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-warm-800 font-medium text-sm">
                  {form.first_name} {form.last_name}
                </p>
                <p className="text-warm-500 text-sm mt-1 leading-relaxed">
                  {form.address_1}
                  {form.address_2 && `, ${form.address_2}`}
                  <br />
                  {form.city}
                  {form.state && `, ${form.state}`}
                  {form.postcode && ` ${form.postcode}`}
                  <br />
                  Colombia
                </p>
                {form.phone && (
                  <p className="text-warm-400 text-sm mt-1">{form.phone}</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-warm-400 italic">
              No hay dirección guardada.{" "}
              <button
                onClick={() => setEditing(true)}
                className="text-burgundy-500 underline font-medium not-italic"
              >
                Agregar una
              </button>
            </p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5">
          {/* Nombre */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nombre</label>
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="Nombre del destinatario"
              />
            </div>
            <div>
              <label className={labelClass}>Apellido</label>
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="Apellido"
              />
            </div>
          </div>

          {/* Dirección */}
          <div>
            <label className={labelClass}>Dirección</label>
            <input
              name="address_1"
              value={form.address_1}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="Calle, carrera, avenida, número de casa…"
            />
          </div>

          <div>
            <label className={labelClass}>
              Complemento{" "}
              <span className="normal-case font-normal tracking-normal text-warm-300">
                (opcional)
              </span>
            </label>
            <input
              name="address_2"
              value={form.address_2}
              onChange={handleChange}
              className={inputClass}
              placeholder="Apartamento, barrio, conjunto…"
            />
          </div>

          {/* Ciudad y Departamento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Ciudad / Municipio</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="Tu ciudad"
              />
            </div>
            <div>
              <label className={labelClass}>Departamento</label>
              <select
                name="state"
                value={form.state}
                onChange={handleChange}
                required
                className={`${inputClass} cursor-pointer`}
              >
                <option value="">Seleccionar…</option>
                {COLOMBIAN_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Código postal y teléfono */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Código postal{" "}
                <span className="normal-case font-normal tracking-normal text-warm-300">
                  (opcional)
                </span>
              </label>
              <input
                name="postcode"
                value={form.postcode}
                onChange={handleChange}
                className={inputClass}
                placeholder="000000"
              />
            </div>
            <div>
              <label className={labelClass}>Teléfono de contacto</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={inputClass}
                placeholder="+57 300 000 0000"
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
                <p className="text-sm font-semibold text-sage-700">¡Dirección guardada!</p>
                <p className="text-xs text-sage-500 mt-0.5">La dirección se actualizó correctamente.</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            {success ? (
              <div className="flex items-center gap-2 rounded-full bg-sage-500 px-6 py-3 text-sm font-semibold text-white">
                <Check className="h-4 w-4" /> Guardada
              </div>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-full bg-burgundy-500 px-6 py-3 text-sm font-semibold text-white hover:bg-burgundy-600 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {loading ? "Guardando..." : "Guardar dirección"}
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
