import { getWooAuthHeader } from "@/lib/woocommerce";
import type { OrderLineItem } from "@/types/order";

/**
 * Lectura fresca (sin caché) contra WooCommerce para detectar carritos obsoletos.
 * No reemplaza la reserva atómica del endpoint privado de checkout.
 *
 * Las lecturas van EN LOTE para no golpear WooCommerce con una petición por ítem
 * (crítico en el pico de un lanzamiento): los productos simples se piden juntos
 * con `?include=`, y las variaciones se agrupan por producto padre. Así N ítems
 * se resuelven en (1 + nº de padres distintos) peticiones en vez de N.
 *
 * Esta lectura es solo un aviso temprano. La reserva atómica se realiza en el
 * backend al crear el pedido. Una lectura incompleta bloquea la compra.
 */

interface StockData {
  stock_status?: "instock" | "outofstock" | "onbackorder";
  stock_quantity?: number | null;
  manage_stock?: boolean | "parent";
  backorders_allowed?: boolean;
}

export class StockValidationError extends Error {
  constructor() {
    super("No pudimos verificar la disponibilidad. Tu pedido no se confirmó; intenta nuevamente.");
    this.name = "StockValidationError";
  }
}

// Campos mínimos que necesitamos, para aligerar el payload de WooCommerce.
const STOCK_FIELDS = "id,stock_status,stock_quantity,manage_stock,backorders_allowed";

/** Clave única por ítem (variación o producto simple). */
function keyOf(item: Pick<OrderLineItem, "product_id" | "variation_id">): string {
  return `${item.product_id}:${item.variation_id ?? 0}`;
}

async function fetchJson(url: string): Promise<(StockData & { id: number })[]> {
  try {
    const res = await fetch(url, {
      headers: { Authorization: getWooAuthHeader() },
      cache: "no-store",
    });
    if (!res.ok) throw new StockValidationError();
    const rows: unknown = await res.json();
    if (!Array.isArray(rows) || rows.some((row) => !row || !Number.isInteger(row.id) ||
      !["instock", "outofstock", "onbackorder"].includes(row.stock_status) ||
      typeof row.backorders_allowed !== "boolean" ||
      ![true, false, "parent"].includes(row.manage_stock) ||
      (row.manage_stock === true && !Number.isFinite(row.stock_quantity)))) {
      throw new StockValidationError();
    }
    return rows;
  } catch {
    throw new StockValidationError();
  }
}

/**
 * Lee el estado de stock de todos los ítems en lote, sin caché.
 * Devuelve un mapa `product_id:variation_id` → StockData. Un ítem ausente en el
 * mapa (lote fallido, id inexistente) hace fallar la validación.
 */
async function fetchStockMap(
  lineItems: OrderLineItem[]
): Promise<Map<string, StockData>> {
  const WP_URL = process.env.WOOCOMMERCE_URL!;
  const map = new Map<string, StockData>();

  // Agrupar: productos simples juntos; variaciones por producto padre.
  const simpleIds = new Set<number>();
  const variationIdsByParent = new Map<number, Set<number>>();
  for (const item of lineItems) {
    if (item.variation_id) {
      const set = variationIdsByParent.get(item.product_id) ?? new Set<number>();
      set.add(item.variation_id);
      variationIdsByParent.set(item.product_id, set);
    } else {
      simpleIds.add(item.product_id);
    }
  }

  const tasks: Promise<void>[] = [];

  if (simpleIds.size > 0) {
    const url = `${WP_URL}/wp-json/wc/v3/products?include=${[...simpleIds].join(
      ","
    )}&per_page=100&_fields=${STOCK_FIELDS}`;
    tasks.push(
      fetchJson(url).then((rows) => {
        for (const row of rows) map.set(`${row.id}:0`, row);
      })
    );
  }

  for (const [parentId, variationIds] of variationIdsByParent) {
    const url = `${WP_URL}/wp-json/wc/v3/products/${parentId}/variations?include=${[
      ...variationIds,
    ].join(",")}&per_page=100&_fields=${STOCK_FIELDS}`;
    tasks.push(
      fetchJson(url).then((rows) => {
        for (const row of rows) map.set(`${parentId}:${row.id}`, row);
      })
    );
  }

  await Promise.all(tasks);
  if (lineItems.some((item) => !map.has(keyOf(item)))) throw new StockValidationError();
  return map;
}

/**
 * Índices de los line_items SIN stock suficiente AHORA (pre-creación del pedido).
 * Bloquea ítems agotados o cuya cantidad supera el stock, salvo que el producto
 * permita backorders (decisión explícita del dueño).
 */
export async function findInsufficientStock(
  lineItems: OrderLineItem[]
): Promise<number[]> {
  const stockMap = await fetchStockMap(lineItems);
  const insufficient: number[] = [];
  const quantities = new Map<string, number>();
  for (const item of lineItems) quantities.set(keyOf(item), (quantities.get(keyOf(item)) ?? 0) + item.quantity);

  lineItems.forEach((item, index) => {
    const data = stockMap.get(keyOf(item));
    if (!data) throw new StockValidationError();
    if (data.backorders_allowed === true) return;

    if (data.stock_status === "outofstock") {
      insufficient.push(index);
      return;
    }
    if (data.manage_stock && typeof data.stock_quantity === "number") {
      if (quantities.get(keyOf(item))! > data.stock_quantity) insufficient.push(index);
    }
  });

  return insufficient;
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
  const stockMap = await fetchStockMap(lineItems);
  const oversold: number[] = [];

  lineItems.forEach((item, index) => {
    const data = stockMap.get(keyOf(item));
    if (!data) throw new StockValidationError();
    if (data.backorders_allowed === true) return;
    if (
      data.manage_stock &&
      typeof data.stock_quantity === "number" &&
      data.stock_quantity < 0
    ) {
      oversold.push(index);
    }
  });

  return oversold;
}
