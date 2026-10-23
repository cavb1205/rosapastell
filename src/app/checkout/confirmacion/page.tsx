import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, AlertCircle } from "lucide-react";
import { SITE_NAME, WHATSAPP_URL } from "@/lib/constants";
import { cookies } from "next/headers";
import { getOrder } from "@/lib/woocommerce";
import type { WooOrder } from "@/types/order";

export const metadata: Metadata = {
  title: `Estado del pedido | ${SITE_NAME}`,
  robots: { index: false },
};

export default async function ConfirmacionPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; orderId?: string }>;
}) {
  const params = await searchParams;
  const id = params.orderId ?? params.id;
  let order: WooOrder | null = null;
  if (id && /^\d+$/.test(id) && Number.isSafeInteger(Number(id))) {
    const key = (await cookies()).get(`rp_receipt_${id}`)?.value;
    if (key) {
      try {
        const candidate = await getOrder(Number(id), true);
        if (candidate.order_key === key && candidate.payment_method === "wompi") order = candidate;
      } catch { /* Never turn a failed verification into a success message. */ }
    }
  }
  const confirmed = Boolean(order?.date_paid && ["processing", "completed"].includes(order.status));
  const review = order?.status === "rp-stock-review";
  const pending = order?.status === "pending";
  const title = confirmed ? "¡Compra confirmada!" : review ? "Tu pago requiere revisión" : pending ? "Pago pendiente de confirmación" : "No hemos confirmado tu pedido";
  const message = confirmed
    ? "Tu pago fue confirmado y el inventario quedó asignado a tu pedido."
    : review
      ? "Recibimos la aprobación del pago, pero debemos revisar la disponibilidad antes de confirmar el despacho. No vuelvas a pagar. Contáctanos por WhatsApp para resolverlo."
      : pending
        ? "Todavía estamos esperando la confirmación del pago. Si ya pagaste, no hagas otro pago; actualiza el estado en unos momentos."
        : "No podemos confirmar el pago y la disponibilidad en este momento. Si ya pagaste, no repitas el pago; contáctanos por WhatsApp para verificarlo.";

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-sage-100 mb-6">
        {confirmed ? <CheckCircle className="w-8 h-8 text-sage-400" /> : <AlertCircle className="w-8 h-8 text-warm-500" />}
      </div>
      <h1 className="font-heading text-3xl text-warm-900 mb-3">
        {title}
      </h1>
      {order && (
        <p className="text-warm-500 mb-2">
          Pedido <strong className="text-warm-800">#{order.number}</strong>
        </p>
      )}
      <p className="text-warm-500 mb-8">
        {message}
      </p>
      <div className="flex flex-col gap-3">
        {order && !confirmed && <a href={`/checkout/confirmacion?orderId=${order.id}`} className="text-sm font-semibold text-burgundy-500 underline underline-offset-2">Actualizar estado</a>}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full bg-[#25D366] px-8 py-3.5 text-sm font-semibold text-white hover:bg-[#1ebe5d] transition-colors"
        >
          Contactar por WhatsApp
        </a>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-warm-200 px-8 py-3.5 text-sm font-semibold text-warm-600 hover:bg-warm-50 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
