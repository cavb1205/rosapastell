import { NextRequest, NextResponse } from "next/server";
import { createOrder, WooCommerceError } from "@/lib/woocommerce";
import { sendEmail } from "@/lib/email";
import { orderConfirmationHtml } from "@/lib/email-templates";
import { rateLimit } from "@/lib/rate-limit";
import { orderSchema } from "@/lib/validations";

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
  const blocked = rateLimit(request, { limit: 5, windowMs: 60_000, prefix: "orders" });
  if (blocked) return blocked;

  try {
    const parsed = orderSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos del pedido incompletos o inválidos" },
        { status: 400 },
      );
    }

    const { _emailMeta: emailMeta, ...orderPayload } = parsed.data;

    const order = await createOrder(orderPayload);

    // Enviar email de confirmación antes de responder
    // (await garantiza que la función no se cierre antes de enviar)
    const customerEmail = order.billing?.email;
    const firstName = order.billing?.first_name;
    if (customerEmail && emailMeta) {
      try {
        await sendEmail({
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
            paymentMethod: order.payment_method === "wompi" ? "wompi" : "whatsapp",
          }),
        });
      } catch (err) {
        console.error("[Email] Error enviando confirmación:", err);
      }
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof WooCommerceError && isStockError(error)) {
      return NextResponse.json(
        {
          error: error.message,
          stockError: true,
        },
        { status: 400 },
      );
    }

    console.error("Orders API error:", error);
    return NextResponse.json(
      { error: "Error al crear la orden" },
      { status: 500 },
    );
  }
}
