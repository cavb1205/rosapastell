import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { getStoreStatus } from "@/lib/woocommerce";

export const metadata: Metadata = {
  title: `Checkout | ${SITE_NAME}`,
  robots: { index: false },
};

export default async function CheckoutPage() {
  const { paused, message } = await getStoreStatus();

  if (paused) {
    return (
      <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="font-heading text-3xl text-warm-900 mb-4">
          Compras en pausa
        </h1>
        <p className="text-warm-600 mb-8">
          {message ||
            "Estamos preparando la nueva colección ✨ Muy pronto podrás finalizar tu compra."}
        </p>
        <Link
          href="/"
          className="inline-block rounded-full bg-burgundy-500 px-6 py-3 text-sm font-semibold text-white hover:bg-burgundy-600 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-heading text-3xl text-warm-900 mb-8">
        Finalizar Compra
      </h1>
      <CheckoutClient />
    </div>
  );
}
