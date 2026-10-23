import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { rateLimit } from "@/lib/rate-limit";
import { getPaymentReadiness, WooCommerceError } from "@/lib/woocommerce";
import { isWompiCheckoutEnabled } from "@/lib/payment-methods";

export async function GET(request: NextRequest) {
  if (!isWompiCheckoutEnabled()) return NextResponse.json({ error: "Los pagos en línea están temporalmente deshabilitados." }, { status: 403 });
  const blocked = rateLimit(request, { limit: 10, windowMs: 60_000, prefix: "wompi-sig" });
  if (blocked) return blocked;

  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");
  const amountInCents = searchParams.get("amount");
  const currency = searchParams.get("currency") ?? "COP";

  if (
    !reference ||
    !amountInCents ||
    !/^rp-\d+$/.test(reference) ||
    !/^\d+$/.test(amountInCents) ||
    currency !== "COP"
  ) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;
  if (!integritySecret) {
    console.error("[Wompi] WOMPI_INTEGRITY_SECRET no configurado");
    return NextResponse.json({ error: "Error de configuración" }, { status: 500 });
  }

  const orderId = Number(reference.slice(3));
  const orderKey = request.cookies.get(`rp_pay_${orderId}`)?.value;
  if (!orderKey) return NextResponse.json({ error: "La sesión de pago venció. Regresa al carrito." }, { status: 403 });
  let readiness;
  try {
    readiness = await getPaymentReadiness(orderId, orderKey);
    if (readiness.amount_in_cents !== Number(amountInCents) || readiness.currency !== currency) {
      return NextResponse.json({ error: "El importe no coincide con el pedido." }, { status: 409 });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof WooCommerceError ? error.message : "No se pudo verificar la reserva." }, { status: error instanceof WooCommerceError && error.status < 500 ? error.status : 503 });
  }
  const expirationTime = readiness.expiration_time;
  const chain = `${reference}${readiness.amount_in_cents}${currency}${expirationTime}${integritySecret}`;
  const signature = createHash("sha256").update(chain).digest("hex");

  return NextResponse.json({ signature, expirationTime });
}
