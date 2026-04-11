import { NextResponse } from "next/server";
import { getProducts } from "@/lib/woocommerce";
import type { SearchIndexItem } from "@/components/catalog/SearchClient";

export const revalidate = 3600; // 1 hora, se invalida con webhook

async function fetchAllInStock(): Promise<SearchIndexItem[]> {
  const items: SearchIndexItem[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const result = await getProducts({ per_page: 100, page });
    totalPages = result.totalPages;

    for (const p of result.data) {
      items.push({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        image: p.images[0]?.src ?? "",
        category: p.categories[0]?.name ?? "",
      });
    }

    page++;
  }

  return items;
}

export async function GET() {
  try {
    const items = await fetchAllInStock();
    return NextResponse.json(items, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Search index error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
