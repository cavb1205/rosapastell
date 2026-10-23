import type { OrderLineItem } from "@/types/order";
import { CHECKOUT_BATCH_SIZE, CHECKOUT_READ_CONCURRENCY } from "./checkout-limits";

export interface CheckoutBatch {
  parentId: number | null;
  ids: number[];
}

export function checkoutBatches(items: OrderLineItem[]): CheckoutBatch[] {
  const groups = new Map<number | null, Set<number>>();
  for (const item of items) {
    const parentId = item.variation_id ? item.product_id : null;
    const ids = groups.get(parentId) ?? new Set<number>();
    ids.add(item.variation_id || item.product_id);
    groups.set(parentId, ids);
  }
  const batches: CheckoutBatch[] = [];
  for (const [parentId, ids] of groups) {
    const values = [...ids];
    for (let i = 0; i < values.length; i += CHECKOUT_BATCH_SIZE) {
      batches.push({ parentId, ids: values.slice(i, i + CHECKOUT_BATCH_SIZE) });
    }
  }
  return batches;
}

/** El trabajo se inicia dentro del worker, nunca creando 200 fetch simultáneos. */
export async function readCheckoutBatches<T>(
  batches: CheckoutBatch[],
  read: (batch: CheckoutBatch) => Promise<T>
): Promise<T[]> {
  const results: T[] = new Array(batches.length);
  let next = 0;
  let failed = false;
  await Promise.all(Array.from({ length: Math.min(CHECKOUT_READ_CONCURRENCY, batches.length) }, async () => {
    while (!failed && next < batches.length) {
      const index = next++;
      try { results[index] = await read(batches[index]); }
      catch (error) { failed = true; throw error; }
    }
  }));
  return results;
}
