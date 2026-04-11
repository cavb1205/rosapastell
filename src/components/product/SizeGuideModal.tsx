"use client";

import { useEffect } from "react";
import { X, Ruler } from "lucide-react";

const SIZES = [
  { talla: "XS",  busto: "80–84",  cintura: "60–64",  cadera: "86–90"  },
  { talla: "S",   busto: "84–88",  cintura: "64–68",  cadera: "90–94"  },
  { talla: "M",   busto: "88–92",  cintura: "68–72",  cadera: "94–98"  },
  { talla: "L",   busto: "92–96",  cintura: "72–76",  cadera: "98–102" },
  { talla: "XL",  busto: "96–102", cintura: "76–82",  cadera: "102–108"},
  { talla: "XXL", busto: "102–110",cintura: "82–90",  cadera: "108–116"},
];

const HOW_TO = [
  {
    label: "Busto",
    desc: "Mide alrededor de la parte más ancha del pecho, manteniendo la cinta horizontal.",
  },
  {
    label: "Cintura",
    desc: "Mide en la parte más estrecha del torso, generalmente a la altura del ombligo.",
  },
  {
    label: "Cadera",
    desc: "Mide alrededor de la parte más ancha de las caderas y glúteos.",
  },
];

interface SizeGuideModalProps {
  onClose: () => void;
}

export function SizeGuideModal({ onClose }: SizeGuideModalProps) {
  // Cerrar con Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="size-guide-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden max-h-[92dvh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-warm-100">
          <div className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-burgundy-400" />
            <h2 id="size-guide-title" className="font-heading text-lg text-warm-900">
              Guía de tallas
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-warm-400 hover:text-warm-700 hover:bg-warm-100 transition-colors"
            aria-label="Cerrar guía de tallas"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content scrollable */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

          {/* Tabla de medidas */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-burgundy-400 mb-3">
              Medidas en centímetros
            </p>
            <div className="overflow-x-auto rounded-xl border border-warm-100">
              <table className="w-full text-sm text-center">
                <thead>
                  <tr className="bg-burgundy-50 text-warm-700">
                    <th className="py-2.5 px-4 font-semibold text-left">Talla</th>
                    <th className="py-2.5 px-4 font-semibold">Busto</th>
                    <th className="py-2.5 px-4 font-semibold">Cintura</th>
                    <th className="py-2.5 px-4 font-semibold">Cadera</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZES.map((row, i) => (
                    <tr
                      key={row.talla}
                      className={i % 2 === 0 ? "bg-white" : "bg-warm-50"}
                    >
                      <td className="py-2.5 px-4 font-semibold text-left text-warm-800">
                        {row.talla}
                      </td>
                      <td className="py-2.5 px-4 text-warm-600">{row.busto}</td>
                      <td className="py-2.5 px-4 text-warm-600">{row.cintura}</td>
                      <td className="py-2.5 px-4 text-warm-600">{row.cadera}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cómo medirse */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-burgundy-400 mb-3">
              Cómo medirte
            </p>
            <div className="space-y-3">
              {HOW_TO.map((item) => (
                <div key={item.label} className="flex gap-3">
                  <span className="shrink-0 mt-0.5 h-5 w-5 rounded-full bg-burgundy-100 text-burgundy-600 text-[11px] font-bold flex items-center justify-center">
                    {item.label[0]}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-warm-800">{item.label}</p>
                    <p className="text-sm text-warm-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Consejo */}
          <div className="bg-burgundy-50 rounded-xl px-4 py-3">
            <p className="text-sm text-burgundy-700 leading-relaxed">
              💡 Si estás entre dos tallas, elige la <strong>mayor</strong> para mayor comodidad.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
