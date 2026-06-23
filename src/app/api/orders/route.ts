import { NextRequest, NextResponse } from "next/server";
import { createOrder, getWooAuthHeader, getStoreStatus, parseWholesalePrice, updateOrder, OVERSOLD_AUTOCANCEL_META, WooCommerceError } from "@/lib/woocommerce";
import { getUserFromCookie } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { orderConfirmationHtml } from "@/lib/email-templates";
import { rateLimit } from "@/lib/rate-limit";
import { orderSchema } from "@/lib/validations";
import { findInsufficientStock, findOversold } from "@/lib/stock";
import type { OrderLineItem, CreateOrderPayload } from "@/types/order";

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

/**
 * Para usuarios mayoristas, consulta el precio mayorista de cada producto/variación
 * en WooCommerce y lo sobreescribe en los line_items.
 * Esto garantiza que WooCommerce registre el precio correcto.
 */
async function resolveWholesalePrices(
  lineItems: OrderLineItem[]
): Promise<OrderLineItem[]> {
  const WP_URL = process.env.WOOCOMMERCE_URL!;
  const authHeader = getWooAuthHeader();

  const resolved = await Promise.all(
    lineItems.map(async (item) => {
      try {
        // Si es variación, consultar la variación; si no, el producto
        const endpoint = item.variation_id
          ? `${WP_URL}/wp-json/wc/v3/products/${item.product_id}/variations/${item.variation_id}`
          : `${WP_URL}/wp-json/wc/v3/products/${item.product_id}`;

        const res = await fetch(endpoint, {
          headers: { Authorization: authHeader },
          next: { revalidate: 0 },
        });

        if (!res.ok) return item; // Si falla, dejar sin modificar

        const data = await res.json();
        const { wholesalePrice, wholesaleSalePrice } = parseWholesalePrice(
          data.meta_data
        );

        if (wholesalePrice === null) return item; // Sin precio mayorista

        // subtotal = precio retail original (para que WC muestre el descuento)
        const retailPrice = parseFloat(data.regular_price || data.price);
        const retailLineTotal = (retailPrice * item.quantity).toFixed(2);

        // total = precio mayorista real que paga el cliente
        const unitPrice = wholesaleSalePrice ?? wholesalePrice;
        const wholesaleLineTotal = (unitPrice * item.quantity).toFixed(2);

        return {
          ...item,
          subtotal: retailLineTotal,
          total: wholesaleLineTotal,
        };
      } catch {
        return item; // Si hay error de red, dejar sin modificar
      }
    })
  );

  return resolved;
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
  const storeStatus = await getStoreStatus({ fresh: true });
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
    const parsed = orderSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos del pedido incompletos o inválidos" },
        { status: 400 },
      );
    }

    const { _emailMeta: emailMeta, ...parsedPayload } = parsed.data;

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

    // 1) Pre-chequeo: impide la sobreventa de ítems agotados que pasaron el
    //    filtro por venir de una página/carrito cacheado.
    const insufficient = await findInsufficientStock(parsedPayload.line_items);
    if (insufficient.length > 0) {
      return NextResponse.json(stockErrorBody(insufficient), { status: 400 });
    }

    // Construir payload — puede agregar customer_id y precios mayoristas
    const orderPayload: CreateOrderPayload = { ...parsedPayload };

    // Si el usuario está autenticado, asociar la orden y resolver precios mayoristas
    const user = await getUserFromCookie();
    if (user) {
      orderPayload.customer_id = user.id;

      if (user.isWholesale) {
        orderPayload.line_items = await resolveWholesalePrices(
          parsedPayload.line_items
        );
      }
    }

    const order = await createOrder(orderPayload);

    // 2) Guarda post-creación contra la carrera de concurrencia: si el descuento
    //    de stock dejó algún ítem en negativo, este pedido perdió la carrera por
    //    la última unidad. Se cancela (WooCommerce restaura el stock) y se informa
    //    al cliente, para no quedar con un pedido imposible de despachar.
    //    (Solo aplica a pedidos que descuentan stock al crearse, p.ej. on-hold;
    //    los pendientes de Wompi no descuentan, así que no disparan aquí.)
    const oversold = await findOversold(parsedPayload.line_items);
    if (oversold.length > 0) {
      try {
        // Cancela (restaura el stock) y marca la cancelación como automática por
        // sobreventa, para que el webhook no envíe el email de "pedido cancelado".
        await updateOrder(order.id, {
          status: "cancelled",
          meta_data: [{ key: OVERSOLD_AUTOCANCEL_META, value: "yes" }],
        });
      } catch (err) {
        console.error(
          `[Orders] No se pudo cancelar el pedido sobrevendido ${order.id}:`,
          err instanceof Error ? err.message : err,
        );
      }
      return NextResponse.json(stockErrorBody(oversold), { status: 409 });
    }

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
