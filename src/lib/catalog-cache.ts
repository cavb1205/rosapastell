/** Solo para información pública del catálogo; nunca pedidos, cuentas o checkout. */
export const CATALOG_PRODUCTS_TAG = "catalog-products";
export const CATALOG_CATEGORIES_TAG = "catalog-categories";

export const PRODUCT_CACHE = {
  next: { revalidate: 30, tags: [CATALOG_PRODUCTS_TAG] },
};

export const CATEGORY_CACHE = {
  next: { revalidate: 60, tags: [CATALOG_CATEGORIES_TAG] },
};
