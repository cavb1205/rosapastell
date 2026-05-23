import { NextRequest, NextResponse } from "next/server";
import { getCategories } from "@/lib/woocommerce";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const blocked = rateLimit(request, { limit: 30, windowMs: 60_000, prefix: "categories" });
  if (blocked) return blocked;

  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Categories API error:", error);
    return NextResponse.json(
      { error: "Error al obtener categorías" },
      { status: 500 }
    );
  }
}
