import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export const metadata: Metadata = {
  title: `Checkout | ${SITE_NAME}`,
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-heading text-3xl text-warm-900 mb-8">
        Finalizar Compra
      </h1>
      <CheckoutClient />
    </div>
  );
}
