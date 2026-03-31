import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/woocommerce";
import type { CreateOrderPayload } from "@/types/order";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateOrderPayload;
    const order = await createOrder(body);
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Orders API error:", error);
    return NextResponse.json(
      { error: "Error al crear la orden" },
      { status: 500 }
    );
  }
}
