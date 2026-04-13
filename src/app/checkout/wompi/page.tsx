import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";
import { WompiCheckoutClient } from "@/components/checkout/WompiCheckoutClient";

export const metadata: Metadata = {
  title: `Pago Seguro | ${SITE_NAME}`,
  robots: { index: false },
};

export default function WompiCheckoutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
      <WompiCheckoutClient />
    </div>
  );
}
