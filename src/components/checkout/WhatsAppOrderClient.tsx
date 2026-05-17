"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { MessageCircle, CheckCircle, UserPlus, X } from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { formatPrice } from "@/lib/formatters";

function WhatsAppContent({ whatsappNumber }: { whatsappNumber: string }) {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const totalParam = searchParams.get("total");
  const guestEmail = searchParams.get("guestEmail");
  const guestName = searchParams.get("guestName");
  const guestLastName = searchParams.get("guestLastName");

  const { user } = useAuthStore();
  const [saveCardDismissed, setSaveCardDismissed] = useState(false);

  const showSaveCard = !user && !!guestEmail && !saveCardDismissed;

  const registerHref = guestEmail
    ? `/cuenta/registro?email=${encodeURIComponent(guestEmail)}${guestName ? `&firstName=${encodeURIComponent(guestName)}` : ""}${guestLastName ? `&lastName=${encodeURIComponent(guestLastName)}` : ""}`
    : "/cuenta/registro";

  const totalDisplay = totalParam ? formatPrice(Number(totalParam)) : null;

  function openWhatsApp() {
    const totalLine = totalDisplay ? ` por un total de ${totalDisplay}` : "";
    const text = encodeURIComponent(
      `Hola Rosa Pastell! Acabo de realizar el pedido #${orderNumber}${totalLine} y quiero recibir los datos para realizar el pago.`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, "_blank");
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

      {/* Instrucciones de pago */}
      <div className="bg-cream-100 rounded-2xl p-6 text-left mb-6">
        <h2 className="font-semibold text-warm-800 mb-3 text-center">
          ¿Cómo completar tu compra?
        </h2>
        <ol className="space-y-3 text-sm text-warm-700">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center text-xs font-bold">1</span>
            <span>Escríbenos por WhatsApp con tu número de pedido <strong>#{orderNumber}</strong></span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center text-xs font-bold">2</span>
            <span>Te enviaremos los datos de pago actualizados (transferencia o Nequi)</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center text-xs font-bold">3</span>
            <span>Realiza el pago y envíanos el comprobante por el mismo chat</span>
          </li>
        </ol>
      </div>

      <p className="text-sm text-warm-500 mb-6">
        Confirmaremos tu pedido una vez verifiquemos el pago. ¡Es rápido y fácil!
      </p>

      <button
        onClick={openWhatsApp}
        className="w-full flex items-center justify-center gap-3 rounded-full bg-[#25D366] px-8 py-4 text-base font-semibold text-white hover:bg-[#1ebe5d] transition-colors"
      >
        <MessageCircle className="h-5 w-5" />
        Solicitar datos de pago por WhatsApp
      </button>

      {/* Tarjeta: guardar datos */}
      {showSaveCard && (
        <div className="mt-6 flex items-start gap-4 rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-left">
          <UserPlus className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-warm-800">
              ¿Quieres recordar tus datos?
            </p>
            <p className="text-xs text-warm-500 mt-0.5">
              Crea una cuenta y la próxima vez tu dirección y datos se autocompletarán.
            </p>
            <Link
              href={registerHref}
              className="inline-block mt-2 rounded-full bg-burgundy-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-burgundy-600 transition-colors"
            >
              Crear cuenta gratis
            </Link>
          </div>
          <button
            onClick={() => setSaveCardDismissed(true)}
            className="text-warm-300 hover:text-warm-500 transition-colors flex-shrink-0"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

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
