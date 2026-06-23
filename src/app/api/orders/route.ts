import { NextRequest, NextResponse } from "next/server";
import { createOrder, getWooAuthHeader, getStoreStatus, parseWholesalePrice, WooCommerceError } from "@/lib/woocommerce";
import { getUserFromCookie } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { orderConfirmationHtml } from "@/lib/email-templates";
import { rateLimit } from "@/lib/rate-limit";
import { orderSchema } from "@/lib/validations";
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
 * Revalida el stock REAL (sin caché) de cada ítem justo antes de crear el pedido.
 *
 * La REST API de WooCommerce NO valida stock al crear órdenes (deja el inventario
 * en negativo → sobreventa). Como el cliente puede llegar con una página/carrito
 * cacheado de cuando aún había stock, este chequeo es la única defensa confiable
 * contra vender algo ya agotado.
 *
 * Devuelve los índices de los line_items sin stock suficiente. Fail-open: si no se
 * puede verificar un ítem (red caída, etc.) no se bloquea, para no congelar ventas
 * por un fallo transitorio del backend.
 */
async function findOutOfStockItems(
  lineItems: OrderLineItem[]
): Promise<number[]> {
  const WP_URL = process.env.WOOCOMMERCE_URL!;
  const authHeader = getWooAuthHeader();

  const results = await Promise.all(
    lineItems.map(async (item, index) => {
      try {
        const endpoint = item.variation_id
          ? `${WP_URL}/wp-json/wc/v3/products/${item.product_id}/variations/${item.variation_id}`
          : `${WP_URL}/wp-json/wc/v3/products/${item.product_id}`;

        const res = await fetch(endpoint, {
          headers: { Authorization: authHeader },
          cache: "no-store",
        });
        if (!res.ok) return null; // no se pudo verificar → fail-open

        const data = await res.json();

        // El dueño habilitó backorders para este producto: vender sin stock es
        // intencional, no se bloquea.
        if (data.backorders_allowed === true) return null;

        if (data.stock_status === "outofstock") return index;

        // Stock gestionado: bloquear si se piden más unidades de las que quedan.
        if (data.manage_stock && typeof data.stock_quantity === "number") {
          if (item.quantity > data.stock_quantity) return index;
        }

        return null;
      } catch {
        return null; // fail-open ante error de red
      }
    })
  );

  return results.filter((i): i is number => i !== null);
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
  const blocked = rateLimit(request, { limit: 5, windowMs: 60_000, prefix: "orders" });
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

    // Revalidación de stock fresca: impide la sobreventa de ítems agotados que
    // pasaron el filtro por venir de una página/carrito cacheado.
    const outOfStock = await findOutOfStockItems(parsedPayload.line_items);
    if (outOfStock.length > 0) {
      const names = outOfStock
        .map((i) => emailMeta?.items[i]?.name)
        .filter((n): n is string => Boolean(n));
      return NextResponse.json(
        {
          error: names.length
            ? `Estos productos se agotaron justo antes de confirmar: ${names.join(", ")}.`
            : "Uno o más productos se agotaron justo antes de confirmar tu pedido.",
          stockError: true,
        },
        { status: 400 },
      );
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
