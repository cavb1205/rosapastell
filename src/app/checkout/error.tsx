"use client";

import Link from "next/link";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function CheckoutError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-lg mx-auto">
        <AlertCircle className="h-14 w-14 text-burgundy-300 mx-auto mb-4" />
        <h1 className="font-heading text-3xl text-warm-900 mb-3">
          Error en el checkout
        </h1>
        <p className="text-warm-500 mb-8">
          No te preocupes, tu carrito sigue intacto. Intenta de nuevo o revisa
          tu carrito.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-burgundy-500 px-6 py-3 text-sm font-semibold text-white hover:bg-burgundy-600 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Intentar de nuevo
          </button>
          <Link
            href="/carrito"
            className="inline-flex justify-center rounded-full border border-warm-200 px-6 py-3 text-sm font-semibold text-warm-600 hover:bg-warm-50 transition-colors"
          >
            Revisar carrito
          </Link>
        </div>
      </div>
    </div>
  );
}
