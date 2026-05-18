"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

interface WompiWidgetProps {
  orderId: number;
  orderNumber: string;
  amountInCents: number;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
}

declare global {
  interface Window {
    WidgetCheckout?: new (config: Record<string, unknown>) => {
      open: (cb: (result: { transaction: { status: string; id: string } }) => void) => void;
    };
  }
}

export function WompiWidget({
  orderId,
  orderNumber,
  amountInCents,
  customerEmail,
  customerName,
  customerPhone,
}: WompiWidgetProps) {
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [declined, setDeclined] = useState(false);
  const opened = useRef(false);

  const reference = `rp-${orderId}`;
  const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY ?? "";
  const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/confirmacion?id=${orderNumber}`;

  // Obtener firma del servidor
  useEffect(() => {
    fetch(
      `/api/checkout/wompi-signature?reference=${reference}&amount=${amountInCents}&currency=COP`
    )
      .then((r) => r.json())
      .then((d) => {
        if (d.signature) setSignature(d.signature);
        else setError("No se pudo generar la firma de pago.");
      })
      .catch(() => setError("Error al preparar el pago."));
  }, [reference, amountInCents]);

  // Cargar script de Wompi y abrir widget
  useEffect(() => {
    if (!signature || !publicKey || opened.current) return;

    function tryOpen() {
      if (opened.current) return;
      if (!window.WidgetCheckout) return;

      opened.current = true;

      const widget = new window.WidgetCheckout({
        currency: "COP",
        amountInCents,
        reference,
        publicKey,
        signature: { integrity: signature },
        redirectUrl,
        customerData: {
          email: customerEmail,
          fullName: customerName,
          phoneNumber: customerPhone,
          phoneNumberPrefix: "+57",
        },
      });

      widget.open(({ transaction }) => {
        if (transaction.status === "APPROVED") {
          window.location.href = redirectUrl;
        } else {
          setDeclined(true);
        }
      });
    }

    // Si el script ya fue cargado en una visita anterior
    if (window.WidgetCheckout) {
      tryOpen();
      return;
    }

    // Inyectar script
    const existing = document.getElementById("wompi-script") as HTMLScriptElement | null;
    if (existing) {
      // Script ya inyectado pero aún cargando — esperar onload
      existing.addEventListener("load", tryOpen);
      return () => existing.removeEventListener("load", tryOpen);
    }

    const script = document.createElement("script");
    script.id = "wompi-script";
    script.src = "https://checkout.wompi.co/widget.js";
    script.async = true;

    script.onload = () => tryOpen();
    script.onerror = () =>
      setError("No se pudo cargar el módulo de pago. Verifica tu conexión e intenta de nuevo.");

    document.head.appendChild(script);

    // Timeout de seguridad
    const timeout = setTimeout(() => {
      if (!opened.current) {
        setError("El módulo de pago tardó demasiado en cargar. Intenta recargar la página.");
      }
    }, 15_000);

    return () => clearTimeout(timeout);
  }, [signature, publicKey, amountInCents, reference, redirectUrl, customerEmail, customerName, customerPhone]);

  function handleRetry() {
    setDeclined(false);
    opened.current = false;
    setSignature(null);
    setError("");
    // Re-fetch firma para reintentar
    fetch(
      `/api/checkout/wompi-signature?reference=${reference}&amount=${amountInCents}&currency=COP`
    )
      .then((r) => r.json())
      .then((d) => {
        if (d.signature) setSignature(d.signature);
        else setError("No se pudo generar la firma de pago.");
      })
      .catch(() => setError("Error al preparar el pago."));
  }

  if (declined) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="w-14 h-14 flex items-center justify-center rounded-full bg-red-50">
          <AlertCircle className="h-7 w-7 text-red-400" />
        </div>
        <div>
          <p className="text-warm-800 font-semibold mb-1">Tu pago no fue aprobado</p>
          <p className="text-sm text-warm-500">Puedes intentarlo de nuevo o elegir otro método de pago.</p>
        </div>
        <button
          onClick={handleRetry}
          className="flex items-center gap-2 rounded-full bg-burgundy-500 px-6 py-3 text-sm font-semibold text-white hover:bg-burgundy-600 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Intentar de nuevo
        </button>
        <a href="/checkout" className="text-sm text-warm-400 hover:text-warm-600 transition-colors">
          Volver al checkout
        </a>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="rounded-xl bg-red-50 border border-red-100 px-5 py-4 text-sm text-red-600">
          {error}
        </div>
        <button
          onClick={handleRetry}
          className="flex items-center gap-2 text-sm font-semibold text-burgundy-500 hover:text-burgundy-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <Loader2 className="h-7 w-7 animate-spin text-burgundy-400" />
      <p className="text-sm text-warm-500">Cargando módulo de pago seguro…</p>
    </div>
  );
}
