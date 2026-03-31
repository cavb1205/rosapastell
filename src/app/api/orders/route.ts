import { NextRequest, NextResponse } from "next/server";
import { createOrder, WooCommerceError } from "@/lib/woocommerce";
import type { CreateOrderPayload } from "@/types/order";

// Códigos de error de WooCommerce relacionados con stock insuficiente
const STOCK_ERROR_CODES = [
  "woocommerce_not_enough_stock",
  "woocommerce_rest_insufficient_stock",
  "insufficient_stock",
];

function isStockError(error: WooCommerceError): boolean {
  return (
    STOCK_ERROR_CODES.includes(error.code) ||
    error.message.toLowerCase().includes("stock") ||
    error.message.toLowerCase().includes("agotado") ||
    error.message.toLowerCase().includes("existencias")
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateOrderPayload;
    const order = await createOrder(body);
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof WooCommerceError && isStockError(error)) {
      return NextResponse.json(
        {
          error: error.message,
          stockError: true,
        },
        { status: 400 }
      );
    }

    console.error("Orders API error:", error);
    return NextResponse.json(
      { error: "Error al crear la orden" },
      { status: 500 }
    );
  }
}
