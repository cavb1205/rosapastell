import { NextRequest, NextResponse } from "next/server";
import { createOrder, WooCommerceError } from "@/lib/woocommerce";
import type { CreateOrderPayload } from "@/types/order";
import { sendEmail } from "@/lib/brevo";
import { orderConfirmationHtml } from "@/lib/email-templates";

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

interface OrderRequestBody extends CreateOrderPayload {
  _emailMeta?: {
    items: { name: string; size: string; quantity: number; price: number; image?: string }[];
    subtotal: number;
    discount?: number;
    couponCode?: string;
    total: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OrderRequestBody;

    // Extraer metadatos de email antes de enviar a WooCommerce
    const emailMeta = body._emailMeta;
    const { _emailMeta, ...orderPayload } = body;

    const order = await createOrder(orderPayload);

    // Enviar email de confirmación — server-side, no puede ser cancelado por navegación
    const customerEmail = order.billing?.email;
    const firstName = order.billing?.first_name;
    if (customerEmail && emailMeta) {
      sendEmail({
        to: [{ email: customerEmail, name: firstName }],
        subject: `Tu pedido #${order.number} en Rosa Pastell`,
        htmlContent: orderConfirmationHtml({
          orderNumber: order.number,
          firstName: firstName || "Cliente",
          items: emailMeta.items,
          subtotal: emailMeta.subtotal,
          discount: emailMeta.discount,
          couponCode: emailMeta.couponCode,
          total: emailMeta.total,
          city: order.billing?.city || "",
          address: order.billing?.address_1 || "",
        }),
      }).catch((err) => console.error("[Email] Error enviando confirmación:", err));
    }

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
