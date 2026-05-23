import { NextRequest, NextResponse } from "next/server";
import { getProducts, searchProducts } from "@/lib/woocommerce";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const blocked = rateLimit(request, { limit: 30, windowMs: 60_000, prefix: "products" });
  if (blocked) return blocked;

  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search");
    const page = Number(searchParams.get("page") || 1);
    const category = searchParams.get("category");
    const orderby = searchParams.get("orderby") || "popularity";
    const order = searchParams.get("order") || "desc";
    const perPage = Math.min(Number(searchParams.get("per_page") || 16), 100);

    if (search) {
      const result = await searchProducts(search, page);
      return NextResponse.json(result);
    }

    const params: Record<string, string | number> = {
      page,
      per_page: perPage,
      orderby,
      order,
    };

    if (category) {
      params.category = category;
    }

    const result = await getProducts(params);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { error: "Error al obtener productos" },
      { status: 500 }
    );
  }
}
