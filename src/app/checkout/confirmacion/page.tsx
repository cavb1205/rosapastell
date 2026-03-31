import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { SITE_NAME, WHATSAPP_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Pedido Confirmado | ${SITE_NAME}`,
  robots: { index: false },
};

export default async function ConfirmacionPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-sage-100 mb-6">
        <CheckCircle className="w-8 h-8 text-sage-400" />
      </div>
      <h1 className="font-heading text-3xl text-warm-900 mb-3">
        ¡Gracias por tu compra!
      </h1>
      {id && (
        <p className="text-warm-500 mb-2">
          Pedido <strong className="text-warm-800">#{id}</strong>
        </p>
      )}
      <p className="text-warm-500 mb-8">
        Tu pago fue procesado exitosamente. Recibirás un correo de confirmación con los detalles de tu pedido.
      </p>
      <div className="flex flex-col gap-3">
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
