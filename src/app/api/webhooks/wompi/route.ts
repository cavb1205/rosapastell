import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { updateOrderStatus } from "@/lib/woocommerce";

interface WompiEvent {
  event: string;
  data: {
    transaction: {
      id: string;
      reference: string;
      status: "APPROVED" | "DECLINED" | "VOIDED" | "ERROR";
      amount_in_cents: number;
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
  if (!secret) return false;

  // Extraer los valores de las propiedades dinámicas
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

  return expected === event.signature.checksum;
}

export async function POST(request: NextRequest) {
  let event: WompiEvent;

  try {
    event = await request.json();
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

  const { reference, status } = event.data.transaction;

  // reference = "rp-{wooOrderId}"
  const match = reference.match(/^rp-(\d+)$/);
  if (!match) {
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
  if (wooStatus) {
    try {
      await updateOrderStatus(wooOrderId, wooStatus);
    } catch (err) {
      console.error(`[Wompi Webhook] Error actualizando orden ${wooOrderId}:`, err);
      return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
