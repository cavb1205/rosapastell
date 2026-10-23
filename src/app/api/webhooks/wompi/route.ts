import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { applyWompiPayment } from "@/lib/woocommerce";
import { getVerifiedWompiTransaction } from "@/lib/wompi";
import { z } from "zod";

const eventSchema = z.object({
  event: z.string(),
  data: z.record(z.string(), z.unknown()),
  timestamp: z.number().int().nonnegative().safe(),
  signature: z.object({ properties: z.array(z.string().regex(/^[A-Za-z0-9_.]+$/).max(128)).min(1).max(64), checksum: z.string().regex(/^[a-fA-F0-9]{64}$/) }),
});
const transactionSchema = z.object({
  id: z.string().regex(/^[A-Za-z0-9_-]{1,150}$/),
  reference: z.string().max(255),
  status: z.string().max(50),
  amount_in_cents: z.number().int().nonnegative().safe(),
  currency: z.literal("COP"),
});

interface WompiEvent {
  event: string;
  data: {
    transaction: {
      id: string;
      reference: string;
      status: "APPROVED" | "DECLINED" | "VOIDED" | "ERROR";
      amount_in_cents: number;
      currency: string;
      [key: string]: unknown;
    };
  };
  timestamp: number;
  signature: {
    properties: string[];
    checksum: string;
  };
}

/**
 * Wompi firma los webhooks concatenando:
 * 1. Valores de las propiedades listadas en signature.properties (en orden)
 * 2. El timestamp del evento
 * 3. El events secret
 * Y aplicando SHA-256 al resultado.
 */
function verifyWompiSignature(event: WompiEvent): boolean {
  const secret = process.env.WOMPI_EVENTS_SECRET;
  if (!secret || !Array.isArray(event.signature?.properties) || !Number.isSafeInteger(event.timestamp)) return false;
  if (!["transaction.id", "transaction.status", "transaction.amount_in_cents"].every((key) => event.signature.properties.includes(key))) return false;

  const values = event.signature.properties.map((prop) => {
    const keys = prop.split(".");
    let value: unknown = event.data;
    for (const key of keys) {
      if (value && typeof value === "object") {
        value = (value as Record<string, unknown>)[key];
      } else {
        return "";
      }
    }
    return String(value);
  });

  const chain = values.join("") + String(event.timestamp) + secret;
  const expected = createHash("sha256").update(chain).digest("hex");

  return /^[a-fA-F0-9]{64}$/.test(event.signature.checksum) && timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(event.signature.checksum, "hex"));
}

// Idempotencia: evitar procesar el mismo webhook dos veces.
// Wompi puede reenviar webhooks si no recibe respuesta a tiempo.
// La idempotencia se guarda en WooCommerce, bajo bloqueo del pedido.

export async function POST(request: NextRequest) {
  let event: WompiEvent;

  try {
    const parsed = eventSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    event = parsed.data as unknown as WompiEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!event.signature?.checksum || !event.signature?.properties) {
    console.warn("[Wompi Webhook] Evento sin firma");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  if (!verifyWompiSignature(event)) {
    console.warn("[Wompi Webhook] Firma inválida");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (event.event !== "transaction.updated") {
    return NextResponse.json({ ok: true });
  }

  const parsedTransaction = transactionSchema.safeParse(event.data.transaction);
  if (!parsedTransaction.success) return NextResponse.json({ error: "Invalid transaction" }, { status: 400 });
  const { id: transactionId, reference, status } = parsedTransaction.data;

  // reference = "rp-{wooOrderId}"
  const match = reference.match(/^rp-(\d+)$/);
  if (!match) {
    console.warn(`[Wompi Webhook] Referencia no reconocida: ${reference}`);
    return NextResponse.json({ ok: true });
  }

  const wooOrderId = parseInt(match[1], 10);

  const statusMap: Record<string, string> = {
    APPROVED: "processing",
    DECLINED: "failed",
    VOIDED: "cancelled",
    ERROR: "failed",
  };

  const wooStatus = statusMap[status];
  if (!wooStatus) {
    console.warn(`[Wompi Webhook] Estado no mapeado: ${status} para transacción ${transactionId}`);
    return NextResponse.json({ ok: true });
  }

  try {
    // La firma habitual no incluye reference/currency. No confiar en esos
    // campos hasta contrastarlos con la transacción consultada en Wompi.
    const verified = await getVerifiedWompiTransaction(transactionId);
    if (verified.reference !== reference || verified.status !== status ||
      verified.amount_in_cents !== parsedTransaction.data.amount_in_cents || verified.currency !== parsedTransaction.data.currency) {
      throw new Error("El evento no coincide con la transacción consultada en Wompi");
    }
    const applied = await applyWompiPayment(wooOrderId, {
      transaction_id: transactionId,
      status,
      amount_in_cents: event.data.transaction.amount_in_cents,
      currency: event.data.transaction.currency,
    });
    if (!applied.ok) throw new Error("El backend no confirmó el evento");
    if (applied.review) console.error(`[Wompi Webhook] Orden ${wooOrderId}: pago guardado para revisión de inventario`);
    if (!applied.review) console.log(`[Wompi Webhook] Orden ${wooOrderId}: evento confirmado (tx: ${transactionId})`);
  } catch (err) {
    console.error(
      `[Wompi Webhook] Error actualizando orden ${wooOrderId} a "${wooStatus}" (tx: ${transactionId}):`,
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
