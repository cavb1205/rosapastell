import { NextRequest, NextResponse } from "next/server";
import { createOrder, getStoreStatus, WooCommerceError } from "@/lib/woocommerce";
import { getUserFromCookie, AUTH_COOKIE_NAME } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { orderConfirmationHtml } from "@/lib/email-templates";
import { rateLimit } from "@/lib/rate-limit";
import { orderSchema } from "@/lib/validations";
import { findInsufficientStock, StockValidationError } from "@/lib/stock";
import type { CreateOrderPayload } from "@/types/order";
import { isWompiCheckoutEnabled } from "@/lib/payment-methods";
import { orderValidationMessage } from "@/lib/order-validation";
import { resolveWholesalePrices } from "@/lib/wholesale-checkout";

// Códigos de error de WooCommerce relacionados con stock insuficiente
const STOCK_ERROR_CODES = [
  "woocommerce_not_enough_stock",
  "woocommerce_rest_insufficient_stock",
  "insufficient_stock",
  "rp_insufficient_stock",
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
  // Backstop por IP holgado: corta a una sola IP que inunde, pero alto para no
  // castigar a clientes legítimos que comparten IP de operador móvil (CGNAT)
  // durante el pico de un lanzamiento. El límite estricto real va por email
  // (más abajo, tras parsear el pedido).
  const blocked = rateLimit(request, { limit: 30, windowMs: 60_000, prefix: "orders-ip" });
  if (blocked) return blocked;

  // Gate de pausa de tienda: aunque el frontend oculta los botones, esta es la
  // verificación real que impide crear pedidos durante un lanzamiento. Se lee
  // sin caché para que el bloqueo aplique al instante al activar el interruptor.
  let storeStatus;
  try { storeStatus = await getStoreStatus({ fresh: true }); }
  catch { return NextResponse.json({ error: "No se pudo verificar la tienda. No se confirmó tu pedido." }, { status: 503 }); }
  if (storeStatus.paused) {
    return NextResponse.json(
      {
        error: storeStatus.message || "Las compras están en pausa temporalmente.",
        storePaused: true,
      },
      { status: 403 },
    );
  }

  try {
    const parsed = orderSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      // Diagnóstico sin emails, direcciones, nombres ni valores del carrito.
      console.warn("[Checkout] Validación rechazada", parsed.error.issues.slice(0, 5).map((issue) => ({ field: issue.path.join("."), code: issue.code })));
      return NextResponse.json(
        { error: orderValidationMessage(parsed.error), validationError: true },
        { status: 400 },
      );
    }

    const { _emailMeta: emailMeta, ...parsedPayload } = parsed.data;
    if (parsedPayload.payment_method === "wompi" && !isWompiCheckoutEnabled()) {
      return NextResponse.json({ error: "Los pagos en línea están temporalmente deshabilitados. Recarga el checkout y continúa por transferencia / WhatsApp.", paymentUnavailable: true }, { status: 409 });
    }
    const suppliedCheckoutKey = request.headers.get("Idempotency-Key");
    const checkoutKey = suppliedCheckoutKey ?? crypto.randomUUID();
    if (!/^[A-Za-z0-9-]{16,100}$/.test(checkoutKey)) return NextResponse.json({ error: "Identificador de compra inválido." }, { status: 400 });

    // Límite estricto por email: una misma persona/bot no puede crear muchos
    // pedidos por minuto, sin afectar a otras clientas que comparten su IP.
    const customerEmailRL = parsedPayload.billing?.email;
    if (customerEmailRL) {
      const tooMany = rateLimit(request, {
        limit: 5,
        windowMs: 60_000,
        prefix: "orders-email",
        identifier: customerEmailRL,
      });
      if (tooMany) return tooMany;
    }

    // Nombres legibles para el mensaje de "agotado", a partir de los índices.
    const stockErrorBody = (indices: number[]) => {
      const names = indices
        .map((i) => emailMeta?.items[i]?.name)
        .filter((n): n is string => Boolean(n));
      return {
        error: names.length
          ? `Estos productos se agotaron justo antes de confirmar: ${names.join(", ")}.`
          : "Uno o más productos se agotaron justo antes de confirmar tu pedido.",
        stockError: true,
      };
    };

    // La lectura debe funcionar incluso en un reintento. La decisión atómica
    // corresponde al backend: un pedido mayorista repetido ya descontó stock,
    // pero su misma clave debe recuperar ese pedido, no crear otro.
    const insufficient = await findInsufficientStock(parsedPayload.line_items);
    if (insufficient.length > 0 && !suppliedCheckoutKey) {
      return NextResponse.json(stockErrorBody(insufficient), { status: 400 });
    }

    // Construir payload — puede agregar customer_id y precios mayoristas
    const orderPayload: CreateOrderPayload = {
      ...parsedPayload,
      set_paid: false,
      status: parsedPayload.payment_method === "wompi" ? "pending" : "on-hold",
    };

    // Si el usuario está autenticado, asociar la orden y resolver precios mayoristas
    const user = await getUserFromCookie();
    if (request.cookies.has(AUTH_COOKIE_NAME) && !user) {
      return NextResponse.json({ error: "No se pudo validar tu sesión. Ingresa nuevamente antes de comprar." }, { status: 401 });
    }
    if (user) {
      orderPayload.customer_id = user.id;

      if (user.isWholesale) {
        orderPayload.payment_method = "whatsapp";
        orderPayload.payment_method_title = "Transferencia / WhatsApp";
        orderPayload.status = "on-hold";
        orderPayload.line_items = await resolveWholesalePrices(
          parsedPayload.line_items
        );
      }
    }

    const order = await createOrder(orderPayload, checkoutKey);

    // Solo el endpoint que reservó/descontó inventario puede responder éxito.

    // Enviar email de confirmación antes de responder
    // (await garantiza que la función no se cierre antes de enviar)
    const customerEmail = order.billing?.email;
    const firstName = order.billing?.first_name;
    if (customerEmail && emailMeta && !order.rp_checkout_replayed) {
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

    const response = NextResponse.json(order, { status: 201 });
    if (order.payment_method === "wompi") {
      response.cookies.set(`rp_pay_${order.id}`, order.order_key, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/api/checkout/wompi-signature", maxAge: 1800 });
      response.cookies.set(`rp_receipt_${order.id}`, order.order_key, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/checkout/confirmacion", maxAge: 86400 });
    }
    return response;
  } catch (error) {
    if (error instanceof StockValidationError || (error instanceof WooCommerceError && error.status >= 500)) {
      return NextResponse.json({ error: "No pudimos asegurar el inventario. No se confirmó tu pedido; intenta nuevamente." }, { status: 503 });
    }
    if (error instanceof WooCommerceError && isStockError(error)) {
      return NextResponse.json(
        {
          error: error.message,
          stockError: true,
        },
        { status: 400 },
      );
    }
    if (error instanceof WooCommerceError && error.status === 409) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    console.error("Orders API error:", error);
    return NextResponse.json(
      { error: "Error al crear la orden" },
      { status: 500 },
    );
  }
}
