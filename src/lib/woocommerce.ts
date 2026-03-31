import type {
  WooProduct,
  WooCategory,
  WooVariation,
  WooPaginatedResponse,
} from "@/types/product";
import type { CreateOrderPayload, WooOrder } from "@/types/order";

const BASE_URL = process.env.WOOCOMMERCE_URL!;
const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY!;
const CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET!;

/** Error enriquecido con el código y mensaje originales de WooCommerce. */
export class WooCommerceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "WooCommerceError";
  }
}

function getAuthParams(): string {
  return `consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;
}

async function wooFetch<T>(
  endpoint: string,
  params: Record<string, string | number> = {},
  options: RequestInit = {}
): Promise<{ data: T; headers: Headers }> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.set(key, String(value));
  });

  const url = `${BASE_URL}/wp-json/wc/v3/${endpoint}?${getAuthParams()}&${searchParams.toString()}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    // Intentar preservar el error estructurado de WooCommerce
    try {
      const err = await res.json() as { code?: string; message?: string };
      throw new WooCommerceError(
        err.code ?? "woocommerce_error",
        err.message ?? `Error ${res.status}`,
        res.status
      );
    } catch (e) {
      if (e instanceof WooCommerceError) throw e;
      throw new WooCommerceError("woocommerce_error", `Error ${res.status} ${res.statusText}`, res.status);
    }
  }

  const data = await res.json();
  return { data, headers: res.headers };
}

// Products

export async function getProducts(
  params: Record<string, string | number> = {}
): Promise<WooPaginatedResponse<WooProduct>> {
  const { data, headers } = await wooFetch<WooProduct[]>("products", {
    per_page: 16,
    status: "publish",
    stock_status: "instock",
    ...params,
  });

  return {
    data,
    totalPages: Number(headers.get("x-wp-totalpages") || 1),
    total: Number(headers.get("x-wp-total") || 0),
  };
}

export async function getProductBySlug(
  slug: string
): Promise<WooProduct | null> {
  const { data } = await wooFetch<WooProduct[]>("products", {
    slug,
    status: "publish",
    stock_status: "instock",
  });
  return data[0] || null;
}

export async function getProductVariations(
  productId: number
): Promise<WooVariation[]> {
  const { data } = await wooFetch<WooVariation[]>(
    `products/${productId}/variations`,
    { per_page: 100 }
  );
  return data;
}

export async function getAllProductSlugs(): Promise<string[]> {
  const slugs: string[] = [];
  let page = 1;
  let totalPages = 1;

  try {
    while (page <= totalPages) {
      const result = await getProducts({ per_page: 100, page, _fields: "slug" });
      slugs.push(...result.data.map((p) => p.slug));
      totalPages = result.totalPages;
      page++;
    }
  } catch {
    // Return empty array during build if API not configured
    return [];
  }

  return slugs;
}

export async function searchProducts(
  query: string,
  page = 1
): Promise<WooPaginatedResponse<WooProduct>> {
  return getProducts({ search: query, page });
}

// Categories

export async function getCategories(
  params: Record<string, string | number> = {}
): Promise<WooCategory[]> {
  const { data } = await wooFetch<WooCategory[]>("products/categories", {
    per_page: 100,
    hide_empty: 1,
    ...params,
  });
  return data;
}

export async function getCategoryBySlug(
  slug: string
): Promise<WooCategory | null> {
  const { data } = await wooFetch<WooCategory[]>("products/categories", {
    slug,
  });
  return data[0] || null;
}

export async function getAllCategorySlugs(): Promise<string[]> {
  try {
    const categories = await getCategories();
    return categories.map((c) => c.slug);
  } catch {
    return [];
  }
}

// Orders

export async function createOrder(
  orderData: CreateOrderPayload
): Promise<WooOrder> {
  const { data } = await wooFetch<WooOrder>("orders", {}, {
    method: "POST",
    body: JSON.stringify(orderData),
  });
  return data;
}

export async function getOrder(orderId: number): Promise<WooOrder> {
  const { data } = await wooFetch<WooOrder>(`orders/${orderId}`);
  return data;
}

export async function updateOrderStatus(
  orderId: number,
  status: string
): Promise<WooOrder> {
  const { data } = await wooFetch<WooOrder>(`orders/${orderId}`, {}, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
  return data;
}
