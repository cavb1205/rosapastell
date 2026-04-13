"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

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
        }
      });
    }

    // Si el script ya fue cargado en una visita anterior
    if (window.WidgetCheckout) {
      tryOpen();
      return;
    }

    // Inyectar script si no existe
    if (!document.getElementById("wompi-script")) {
      const script = document.createElement("script");
      script.id = "wompi-script";
      script.src = "https://checkout.wompi.co/widget.js";
      script.async = true;
      document.head.appendChild(script);
    }

    // Polling: esperar hasta que window.WidgetCheckout esté disponible
    const interval = setInterval(() => {
      if (window.WidgetCheckout) {
        clearInterval(interval);
        tryOpen();
      }
    }, 100);

    // Timeout de seguridad a los 10 segundos
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!opened.current) {
        setError("No se pudo cargar el módulo de pago. Verifica tu conexión e intenta de nuevo.");
      }
    }, 10_000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [signature, publicKey, amountInCents, reference, redirectUrl, customerEmail, customerName, customerPhone]);

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-100 px-5 py-4 text-sm text-red-600">
        {error}
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
