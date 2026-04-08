import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getUserFromCookie } from "@/lib/auth";
import { formatPrice } from "@/lib/formatters";
import type { WooOrder } from "@/types/order";
import { SITE_NAME } from "@/lib/constants";
import { Package } from "lucide-react";

export const metadata: Metadata = {
  title: `Detalle de Pedido | ${SITE_NAME}`,
  robots: { index: false },
};

// ---------------------------------------------------------------------------
// Datos
// ---------------------------------------------------------------------------

async function fetchOrder(id: string): Promise<WooOrder | null> {
  const WP_URL = process.env.WOOCOMMERCE_URL!;
  const CK = process.env.WOOCOMMERCE_CONSUMER_KEY!;
  const CS = process.env.WOOCOMMERCE_CONSUMER_SECRET!;
  try {
    const res = await fetch(
      `${WP_URL}/wp-json/wc/v3/orders/${id}?consumer_key=${CK}&consumer_secret=${CS}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

const STATUS: Record<string, { label: string; dot: string; badge: string }> = {
  pending:    { label: "Pendiente de pago", dot: "bg-yellow-400",  badge: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  "on-hold":  { label: "En espera",         dot: "bg-orange-400",  badge: "bg-orange-50 text-orange-700 border-orange-200" },
  processing: { label: "En preparación",    dot: "bg-blue-400",    badge: "bg-blue-50 text-blue-700 border-blue-200" },
  completed:  { label: "Entregado",         dot: "bg-sage-400",    badge: "bg-sage-50 text-sage-500 border-sage-200" },
  cancelled:  { label: "Cancelado",         dot: "bg-warm-300",    badge: "bg-warm-50 text-warm-500 border-warm-200" },
  refunded:   { label: "Reembolsado",       dot: "bg-warm-300",    badge: "bg-warm-50 text-warm-400 border-warm-200" },
};

// Pasos visibles en el timeline (solo flujo normal)
const STEPS = [
  { key: "pending",    label: "Recibido" },
  { key: "on-hold",   label: "Verificando" },
  { key: "processing",label: "Preparando" },
  { key: "completed", label: "Entregado" },
];

const STEP_INDEX: Record<string, number> = {
  pending: 0, "on-hold": 1, processing: 2, completed: 3,
};

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

export default async function PedidoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUserFromCookie();
  if (!user) redirect("/cuenta/ingresar");

  const order = await fetchOrder(id);
  if (!order) notFound();

  // Seguridad: el pedido debe pertenecer al usuario autenticado
  if (order.customer_id !== user.id) notFound();

  const status = STATUS[order.status] ?? {
    label: order.status,
    dot: "bg-warm-300",
    badge: "bg-warm-50 text-warm-500 border-warm-200",
  };

  const isCancelled = ["cancelled", "refunded"].includes(order.status);
  const currentStep = STEP_INDEX[order.status] ?? -1;

  const itemsSubtotal = order.line_items.reduce(
    (acc, item) => acc + parseFloat(item.subtotal),
    0
  );
  const shippingTotal = parseFloat(order.shipping_total || "0");
  const discountTotal = parseFloat(order.discount_total || "0");

  return (
    <div className="min-h-screen bg-warm-50">

      {/* ── Header ── */}
      <div className="relative overflow-hidden bg-burgundy-500">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10" />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
          <Link
            href="/cuenta"
            className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-white/60 hover:text-white transition-colors mb-4"
          >
            ← Mis pedidos
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl text-white">
                Pedido #{order.number}
              </h1>
              <p className="mt-1.5 text-white/70 text-sm">
                {new Date(order.date_created).toLocaleDateString("es-CO", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <span
              className={`self-start sm:self-auto inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium ${status.badge}`}
            >
              <span className={`h-2 w-2 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>
        </div>
      </div>

      {/* ── Contenido ── */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">

            {/* Timeline de estado */}
            {!isCancelled && (
              <div className="bg-white rounded-2xl border border-warm-200 px-7 py-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-warm-400 mb-5">
                  Estado del pedido
                </p>
                <div className="relative flex items-center justify-between">
                  {/* Línea de fondo */}
                  <div className="absolute left-0 right-0 top-[14px] h-px bg-warm-200 z-0" />
                  {/* Línea de progreso */}
                  {currentStep > 0 && (
                    <div
                      className="absolute left-0 top-[14px] h-px bg-burgundy-400 z-0 transition-all duration-500"
                      style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                    />
                  )}
                  {STEPS.map((step, i) => {
                    const done = i <= currentStep;
                    const active = i === currentStep;
                    return (
                      <div key={step.key} className="relative z-10 flex flex-col items-center gap-2 text-center">
                        <div
                          className={`h-7 w-7 rounded-full border-2 flex items-center justify-center transition-all ${
                            done
                              ? "bg-burgundy-500 border-burgundy-500"
                              : "bg-white border-warm-200"
                          } ${active ? "ring-4 ring-burgundy-100" : ""}`}
                        >
                          {done && (
                            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 12 12">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-xs font-medium leading-tight max-w-[60px] ${done ? "text-burgundy-600" : "text-warm-300"}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Productos */}
            <div className="bg-white rounded-2xl border border-warm-200 shadow-sm overflow-hidden">
              <div className="px-7 py-5 border-b border-warm-100 bg-warm-50">
                <p className="text-xs font-semibold uppercase tracking-widest text-warm-500">
                  Productos ({order.line_items.length})
                </p>
              </div>
              <div className="divide-y divide-warm-100">
                {order.line_items.map((item) => {
                  const hasTalla = item.meta_data?.find(
                    (m) => m.display_key?.toLowerCase().includes("talla") || m.key?.toLowerCase() === "pa_talla"
                  );
                  return (
                    <div key={item.id} className="flex items-center gap-3 px-4 py-4 sm:gap-5 sm:px-6 sm:py-5">
                      {/* Imagen */}
                      <div className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-xl overflow-hidden bg-warm-100">
                        {item.image?.src ? (
                          <Image
                            src={item.image.src}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-warm-300" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-warm-800 text-sm leading-snug">{item.name}</p>
                        {hasTalla && (
                          <p className="text-xs text-warm-400 mt-0.5">
                            Talla: {hasTalla.display_value}
                          </p>
                        )}
                        <p className="text-xs text-warm-400 mt-0.5">
                          Cantidad: {item.quantity}
                        </p>
                      </div>

                      {/* Precio */}
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-warm-800 text-sm">
                          {formatPrice(parseFloat(item.total))}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-warm-400 mt-0.5">
                            {formatPrice(item.price)} c/u
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Nota del cliente */}
            {order.customer_note && (
              <div className="bg-white rounded-2xl border border-warm-200 px-7 py-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-warm-400 mb-3">
                  Tu nota
                </p>
                <p className="text-sm text-warm-600 italic">"{order.customer_note}"</p>
              </div>
            )}
          </div>

          {/* Columna lateral */}
          <div className="space-y-6">

            {/* Resumen de pago */}
            <div className="bg-white rounded-2xl border border-warm-200 shadow-sm overflow-hidden">
              <div className="px-7 py-5 border-b border-warm-100 bg-warm-50">
                <p className="text-xs font-semibold uppercase tracking-widest text-warm-500">
                  Resumen
                </p>
              </div>
              <div className="px-7 py-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-warm-500">Subtotal</span>
                  <span className="text-warm-800">{formatPrice(itemsSubtotal)}</span>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-warm-500">Descuento</span>
                    <span className="text-sage-500">−{formatPrice(discountTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-warm-500">Envío</span>
                  <span className="text-warm-800">
                    {shippingTotal > 0 ? formatPrice(shippingTotal) : "Por definir"}
                  </span>
                </div>
                <div className="h-px bg-warm-100" />
                <div className="flex justify-between">
                  <span className="font-semibold text-warm-800">Total</span>
                  <span className="font-bold text-lg text-burgundy-500">
                    {formatPrice(parseFloat(order.total))}
                  </span>
                </div>
              </div>
              {order.payment_method_title && (
                <div className="px-7 py-4 border-t border-warm-100 bg-warm-50">
                  <p className="text-xs text-warm-400">
                    Pago:{" "}
                    <span className="font-medium text-warm-600">
                      {order.payment_method_title}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Dirección de envío */}
            {order.shipping.address_1 && (
              <div className="bg-white rounded-2xl border border-warm-200 shadow-sm overflow-hidden">
                <div className="px-7 py-5 border-b border-warm-100 bg-warm-50">
                  <p className="text-xs font-semibold uppercase tracking-widest text-warm-500">
                    Enviar a
                  </p>
                </div>
                <div className="px-7 py-5">
                  <p className="font-medium text-warm-800 text-sm">
                    {order.shipping.first_name} {order.shipping.last_name}
                  </p>
                  <p className="text-sm text-warm-500 mt-1 leading-relaxed">
                    {order.shipping.address_1}
                    <br />
                    {order.shipping.city}, {order.shipping.state}
                  </p>
                  {order.shipping.phone && (
                    <p className="text-sm text-warm-400 mt-1">{order.shipping.phone}</p>
                  )}
                </div>
              </div>
            )}

            {/* Facturación */}
            <div className="bg-white rounded-2xl border border-warm-200 shadow-sm overflow-hidden">
              <div className="px-7 py-5 border-b border-warm-100 bg-warm-50">
                <p className="text-xs font-semibold uppercase tracking-widest text-warm-500">
                  Facturación
                </p>
              </div>
              <div className="px-7 py-5">
                <p className="font-medium text-warm-800 text-sm">
                  {order.billing.first_name} {order.billing.last_name}
                </p>
                <p className="text-sm text-warm-500 mt-1 leading-relaxed">
                  {order.billing.address_1}
                  <br />
                  {order.billing.city}, {order.billing.state}
                </p>
                <p className="text-sm text-warm-400 mt-1">{order.billing.email}</p>
                {order.billing.phone && (
                  <p className="text-sm text-warm-400">{order.billing.phone}</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
