import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/woocommerce";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const blocked = rateLimit(request, { limit: 20, windowMs: 60_000, prefix: "search" });
  if (blocked) return blocked;

  try {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get("q");
    const page = Number(searchParams.get("page") || 1);

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ data: [], totalPages: 0, total: 0 });
    }

    const result = await searchProducts(query.trim(), page);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Error en la búsqueda" },
      { status: 500 }
    );
  }
}
