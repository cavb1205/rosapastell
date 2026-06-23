import { getWooAuthHeader } from "@/lib/woocommerce";
import type { OrderLineItem } from "@/types/order";

/**
 * Validación de stock fresca (sin caché) contra WooCommerce. Es la única defensa
 * confiable contra la sobreventa: la REST API de WooCommerce NO valida stock al
 * crear órdenes (deja el inventario en negativo) y el cliente puede llegar con
 * una página/carrito cacheado de cuando aún había stock.
 *
 * Todas las funciones son fail-open: si un ítem no se puede verificar (red caída,
 * etc.) no se bloquea, para no congelar ventas por un fallo transitorio.
 */

interface StockData {
  stock_status?: "instock" | "outofstock" | "onbackorder";
  stock_quantity?: number | null;
  manage_stock?: boolean;
  backorders_allowed?: boolean;
}

/** Lee el estado de stock actual de un producto/variación, sin caché. */
async function fetchStockData(item: OrderLineItem): Promise<StockData | null> {
  const WP_URL = process.env.WOOCOMMERCE_URL!;
  const endpoint = item.variation_id
    ? `${WP_URL}/wp-json/wc/v3/products/${item.product_id}/variations/${item.variation_id}`
    : `${WP_URL}/wp-json/wc/v3/products/${item.product_id}`;

  try {
    const res = await fetch(endpoint, {
      headers: { Authorization: getWooAuthHeader() },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as StockData;
  } catch {
    return null;
  }
}

/**
 * Índices de los line_items SIN stock suficiente AHORA (pre-creación del pedido).
 * Bloquea ítems agotados o cuya cantidad supera el stock, salvo que el producto
 * permita backorders (decisión explícita del dueño).
 */
export async function findInsufficientStock(
  lineItems: OrderLineItem[]
): Promise<number[]> {
  const results = await Promise.all(
    lineItems.map(async (item, index) => {
      const data = await fetchStockData(item);
      if (!data) return null; // fail-open
      if (data.backorders_allowed === true) return null;

      if (data.stock_status === "outofstock") return index;
      if (data.manage_stock && typeof data.stock_quantity === "number") {
        if (item.quantity > data.stock_quantity) return index;
      }
      return null;
    })
  );
  return results.filter((i): i is number => i !== null);
}

/**
 * Índices de los line_items que quedaron en stock NEGATIVO (post-creación del
 * pedido). Detecta la sobreventa por carrera de concurrencia: dos pedidos por la
 * última unidad descuentan ambos y uno deja el inventario en negativo.
 * Solo aplica a pedidos cuyo estado descuenta stock al crearse (p.ej. on-hold);
 * los pendientes de Wompi no descuentan, así que no disparan aquí.
 */
export async function findOversold(
  lineItems: OrderLineItem[]
): Promise<number[]> {
  const results = await Promise.all(
    lineItems.map(async (item, index) => {
      const data = await fetchStockData(item);
      if (!data) return null; // fail-open
      if (data.backorders_allowed === true) return null;
      if (
        data.manage_stock &&
        typeof data.stock_quantity === "number" &&
        data.stock_quantity < 0
      ) {
        return index;
      }
      return null;
    })
  );
  return results.filter((i): i is number => i !== null);
}
