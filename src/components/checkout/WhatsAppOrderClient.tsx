"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { MessageCircle, CheckCircle, Copy } from "lucide-react";
import { Suspense } from "react";

const BANK_INFO = {
  bank: "Bancolombia",
  type: "Cuenta de Ahorros",
  number: "000-000000-00",
  name: "Rosa Pastell",
  nit: "000.000.000-0",
  nequi: "+57 315 608 2381",
};

function WhatsAppContent({ whatsappNumber }: { whatsappNumber: string }) {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const msg = searchParams.get("msg");

  function openWhatsApp() {
    const text = msg || `Hola Rosa Pastell! Pedido #${orderNumber}`;
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, "_blank");
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <div className="text-center">
      <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-sage-100 mb-4">
        <CheckCircle className="w-8 h-8 text-sage-400" />
      </div>
      <h1 className="font-heading text-3xl text-warm-900 mb-2">
        ¡Pedido Creado!
      </h1>
      {orderNumber && (
        <p className="text-warm-500 mb-6">
          Número de pedido: <strong className="text-warm-800">#{orderNumber}</strong>
        </p>
      )}

      {/* Bank info */}
      <div className="bg-cream-100 rounded-2xl p-6 text-left mb-6">
        <h2 className="font-semibold text-warm-800 mb-4 text-center">
          Datos para el pago
        </h2>
        <div className="space-y-3">
          {[
            { label: "Banco", value: BANK_INFO.bank },
            { label: "Tipo de cuenta", value: BANK_INFO.type },
            { label: "Número de cuenta", value: BANK_INFO.number },
            { label: "A nombre de", value: BANK_INFO.name },
            { label: "NIT", value: BANK_INFO.nit },
          ].map((row) => (
            <div key={row.label} className="flex justify-between items-center gap-2">
              <span className="text-sm text-warm-500">{row.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-warm-800">{row.value}</span>
                <button
                  onClick={() => copyToClipboard(row.value)}
                  className="text-warm-300 hover:text-warm-500 transition-colors"
                  title="Copiar"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
          <div className="pt-2 border-t border-cream-200">
            <div className="flex justify-between items-center gap-2">
              <span className="text-sm text-warm-500">Nequi</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-warm-800">{BANK_INFO.nequi}</span>
                <button
                  onClick={() => copyToClipboard(BANK_INFO.nequi)}
                  className="text-warm-300 hover:text-warm-500 transition-colors"
                  title="Copiar"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-warm-500 mb-6">
        Una vez realices el pago, envíanos el comprobante por WhatsApp para confirmar tu pedido.
      </p>

      <button
        onClick={openWhatsApp}
        className="w-full flex items-center justify-center gap-3 rounded-full bg-[#25D366] px-8 py-4 text-base font-semibold text-white hover:bg-[#1ebe5d] transition-colors"
      >
        <MessageCircle className="h-5 w-5" />
        Enviar comprobante por WhatsApp
      </button>

      <a
        href="/"
        className="block mt-4 text-sm text-warm-400 hover:text-warm-600 transition-colors"
      >
        Volver al inicio
      </a>
    </div>
  );
}

export function WhatsAppOrderClient({ whatsappNumber }: { whatsappNumber: string }) {
  return (
    <Suspense fallback={<div className="animate-pulse h-96 bg-warm-100 rounded-xl" />}>
      <WhatsAppContent whatsappNumber={whatsappNumber} />
    </Suspense>
  );
}
