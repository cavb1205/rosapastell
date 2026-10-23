import { revalidateTag } from "next/cache";
import { CATALOG_PRODUCTS_TAG, CATALOG_CATEGORIES_TAG } from "./catalog-cache";

/** Los webhooks autenticados deben expirar también datos, no solo páginas. */
export function revalidateCatalogData() {
  revalidateTag(CATALOG_PRODUCTS_TAG, { expire: 0 });
  revalidateTag(CATALOG_CATEGORIES_TAG, { expire: 0 });
}
