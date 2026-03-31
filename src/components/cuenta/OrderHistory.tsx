import Link from "next/link";
import type { WooOrder } from "@/types/order";
import { formatPrice } from "@/lib/formatters";
import { Package, ChevronRight } from "lucide-react";

const STATUS_MAP: Record<string, { label: string; dot: string; badge: string }> = {
  pending:    { label: "Pendiente",    dot: "bg-yellow-400",  badge: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  "on-hold":  { label: "En espera",   dot: "bg-orange-400",  badge: "bg-orange-50 text-orange-700 border-orange-200" },
  processing: { label: "En proceso",  dot: "bg-blue-400",    badge: "bg-blue-50 text-blue-700 border-blue-200" },
  completed:  { label: "Completado",  dot: "bg-sage-400",    badge: "bg-sage-50 text-sage-500 border-sage-200" },
  cancelled:  { label: "Cancelado",   dot: "bg-warm-300",    badge: "bg-warm-50 text-warm-500 border-warm-200" },
  refunded:   { label: "Reembolsado", dot: "bg-warm-300",    badge: "bg-warm-50 text-warm-400 border-warm-200" },
};

interface OrderHistoryProps {
  userId: number;
}

async function fetchOrders(userId: number): Promise<WooOrder[]> {
  const WP_URL = process.env.WOOCOMMERCE_URL!;
  const CK = process.env.WOOCOMMERCE_CONSUMER_KEY!;
  const CS = process.env.WOOCOMMERCE_CONSUMER_SECRET!;

  try {
    const res = await fetch(
      `${WP_URL}/wp-json/wc/v3/orders?customer=${userId}&per_page=20&orderby=date&order=desc&consumer_key=${CK}&consumer_secret=${CS}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function OrderHistory({ userId }: OrderHistoryProps) {
  const orders = await fetchOrders(userId);

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-warm-200 p-14 text-center shadow-sm">
        <div className="mx-auto h-14 w-14 flex items-center justify-center rounded-full bg-warm-50 mb-4">
          <Package className="h-6 w-6 text-warm-300" />
        </div>
        <p className="font-semibold text-warm-700 text-sm">Sin pedidos aún</p>
        <p className="text-xs text-warm-400 mt-1">Aquí verás tus compras una vez que realices un pedido.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const status = STATUS_MAP[order.status] ?? {
          label: order.status,
          dot: "bg-warm-300",
          badge: "bg-warm-50 text-warm-500 border-warm-200",
        };

        const productNames = order.line_items
          .slice(0, 2)
          .map((item) => item.name)
          .join(", ");
        const extra = order.line_items.length > 2 ? ` +${order.line_items.length - 2} más` : "";

        return (
          <Link
            key={order.id}
            href={`/cuenta/pedidos/${order.id}`}
            className="group bg-white rounded-2xl border border-warm-200 px-6 py-5 shadow-sm hover:border-rose-300 hover:shadow-md transition-all flex items-center gap-4"
          >
            <div className="flex items-start justify-between gap-6 flex-1">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <p className="font-semibold text-warm-800 text-sm">
                    Pedido #{order.number}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${status.badge}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                </div>

                {productNames && (
                  <p className="text-xs text-warm-400 mt-1.5 truncate">
                    {productNames}{extra}
                  </p>
                )}

                <p className="text-xs text-warm-300 mt-1">
                  {new Date(order.date_created).toLocaleDateString("es-CO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-base font-bold text-burgundy-500">
                  {formatPrice(parseFloat(order.total))}
                </p>
                <p className="text-xs text-warm-300 mt-0.5">
                  {order.line_items.length}{" "}
                  {order.line_items.length === 1 ? "producto" : "productos"}
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-warm-300 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </Link>
        );
      })}
    </div>
  );
}
