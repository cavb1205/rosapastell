import { getWooAuthHeader, parseWholesalePrice } from "./woocommerce";
import { checkoutBatches, readCheckoutBatches } from "./checkout-batches";
import { StockValidationError } from "./stock";
import type { OrderLineItem } from "@/types/order";

interface PriceRow {
  id: number;
  price: string;
  regular_price: string;
  meta_data?: { key: string; value: unknown }[];
}

/** Lecturas frescas y acotadas: nunca una petición simultánea por cada prenda. */
export async function resolveWholesalePrices(lineItems: OrderLineItem[]): Promise<OrderLineItem[]> {
  const rows = new Map<string, PriceRow>();
  try {
    await readCheckoutBatches(checkoutBatches(lineItems), async ({ parentId, ids }) => {
      const endpoint = parentId ? `products/${parentId}/variations` : "products";
      const res = await fetch(`${process.env.WOOCOMMERCE_URL}/wp-json/wc/v3/${endpoint}?include=${ids.join(",")}&per_page=100&_fields=id,price,regular_price,meta_data`, {
        headers: { Authorization: getWooAuthHeader() },
        cache: "no-store",
      });
      if (!res.ok) throw new StockValidationError();
      const data: unknown = await res.json();
      if (!Array.isArray(data)) throw new StockValidationError();
      for (const row of data as PriceRow[]) {
        if (!row || !Number.isInteger(row.id) || !ids.includes(row.id)) throw new StockValidationError();
        rows.set(parentId ? `${parentId}:${row.id}` : `${row.id}:0`, row);
      }
    });
    return lineItems.map((item) => {
      const row = rows.get(`${item.product_id}:${item.variation_id || 0}`);
      if (!row) throw new StockValidationError();
      const { wholesalePrice, wholesaleSalePrice } = parseWholesalePrice(row.meta_data);
      if (wholesalePrice === null) return item; // WooCommerce aplica el precio retail.
      const retail = parseFloat(row.regular_price || row.price);
      const unitPrice = wholesaleSalePrice ?? wholesalePrice;
      if (!Number.isFinite(retail) || !Number.isFinite(unitPrice)) throw new StockValidationError();
      return { ...item, subtotal: (retail * item.quantity).toFixed(2), total: (unitPrice * item.quantity).toFixed(2) };
    });
  } catch {
    throw new StockValidationError();
  }
}
