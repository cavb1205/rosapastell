"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { ShieldCheck } from "lucide-react";
import { WompiWidget } from "./WompiWidget";

function WompiContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("orderId");
  const orderNumber = searchParams.get("order");
  const amountInCents = searchParams.get("amount");
  const email = searchParams.get("email") ?? "";
  const name = searchParams.get("name") ?? "";
  const phone = searchParams.get("phone") ?? "";

  if (!orderId || !orderNumber || !amountInCents) {
    router.replace("/checkout");
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-sage-100">
          <ShieldCheck className="h-6 w-6 text-sage-500" />
        </div>
        <h1 className="font-heading text-2xl text-warm-900">Pago Seguro</h1>
        <p className="text-sm text-warm-500">
          Pedido <strong className="text-warm-800">#{orderNumber}</strong>
        </p>
      </div>

      {/* Widget de Wompi */}
      <div className="bg-white rounded-2xl border border-warm-200 shadow-sm overflow-hidden p-6">
        <WompiWidget
          orderId={parseInt(orderId, 10)}
          orderNumber={orderNumber}
          amountInCents={parseInt(amountInCents, 10)}
          customerEmail={email}
          customerName={name}
          customerPhone={phone}
        />
      </div>

      <p className="text-center text-xs text-warm-400">
        Pago procesado de forma segura por{" "}
        <span className="font-semibold text-warm-600">Wompi</span> · Bancolombia
      </p>
    </div>
  );
}

export function WompiCheckoutClient() {
  return (
    <Suspense fallback={<div className="animate-pulse h-96 bg-warm-100 rounded-2xl" />}>
      <WompiContent />
    </Suspense>
  );
}
