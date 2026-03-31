import type { Metadata } from "next";
import { SITE_NAME, WHATSAPP_NUMBER } from "@/lib/constants";
import { WhatsAppOrderClient } from "@/components/checkout/WhatsAppOrderClient";

export const metadata: Metadata = {
  title: `Confirmar Pedido | ${SITE_NAME}`,
  robots: { index: false },
};

export default function WhatsAppOrderPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
      <WhatsAppOrderClient whatsappNumber={WHATSAPP_NUMBER} />
    </div>
  );
}
