"use client";

import { useState } from "react";
import { Pencil, X, Check, Loader2, CheckCircle2 } from "lucide-react";

interface Props {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const inputClass =
  "w-full rounded-xl border border-warm-300 bg-warm-50 px-4 py-3.5 text-sm text-warm-900 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 focus:bg-white hover:border-warm-400 transition-all";
const labelClass =
  "block text-xs font-semibold uppercase tracking-widest text-warm-500 mb-2";

export function PersonalDataForm({ firstName, lastName, email, phone }: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName, lastName, phone });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  function handleCancel() {
    setForm({ firstName, lastName, phone });
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
        body: JSON.stringify({
          first_name: form.firstName,
          last_name: form.lastName,
          billing: { phone: form.phone },
        }),
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

  return (
    <div className="bg-white rounded-2xl border border-warm-200 shadow-sm overflow-hidden">
      {/* Header de la card */}
      <div className="flex items-center justify-between px-7 py-5 bg-warm-50 border-b border-warm-100">
        <p className="text-xs font-semibold uppercase tracking-widest text-warm-500">
          Datos personales
        </p>
        <div className="flex items-center gap-2">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-warm-400 hover:text-burgundy-500 transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
              Editar
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

      {/* Contenido */}
      {!editing ? (
        <div className="divide-y divide-warm-100">
          <DataRow label="Nombre" value={`${form.firstName} ${form.lastName}`} />
          <DataRow label="Email" value={email} note="El email no se puede cambiar aquí" />
          <DataRow label="Teléfono / WhatsApp" value={form.phone || "—"} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nombre</label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className={labelClass}>Apellido</label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="Tu apellido"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Teléfono / WhatsApp</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className={inputClass}
              placeholder="+57 300 000 0000"
            />
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
                <p className="text-sm font-semibold text-sage-700">¡Datos actualizados!</p>
                <p className="text-xs text-sage-500 mt-0.5">Los cambios se guardaron correctamente.</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            {success ? (
              <div className="flex items-center gap-2 rounded-full bg-sage-500 px-6 py-3 text-sm font-semibold text-white">
                <Check className="h-4 w-4" /> Guardado
              </div>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-full bg-burgundy-500 px-6 py-3 text-sm font-semibold text-white hover:bg-burgundy-600 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {loading ? "Guardando..." : "Guardar cambios"}
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

function DataRow({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="px-7 py-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-warm-400 mb-1.5">
        {label}
      </p>
      <p className="text-warm-800 font-medium">{value}</p>
      {note && <p className="text-xs text-warm-300 mt-1">{note}</p>}
    </div>
  );
}
