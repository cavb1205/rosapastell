import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";
import { WompiCheckoutClient } from "@/components/checkout/WompiCheckoutClient";
import { isWompiCheckoutEnabled } from "@/lib/payment-methods";
import Link from "next/link";

export const metadata: Metadata = {
  title: `Pago Seguro | ${SITE_NAME}`,
  robots: { index: false },
};

export default function WompiCheckoutPage() {
  if (!isWompiCheckoutEnabled()) return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center">
      <h1 className="font-heading text-2xl text-warm-900">Pago por transferencia / WhatsApp</h1>
      <p className="mt-4 text-warm-500">Los pagos en línea no están disponibles temporalmente. Si ya realizaste un pago, no lo repitas y contáctanos para verificarlo.</p>
      <Link href="/checkout" className="mt-6 inline-block text-burgundy-500 underline">Volver al checkout</Link>
    </div>
  );
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
      <WompiCheckoutClient />
    </div>
  );
}
