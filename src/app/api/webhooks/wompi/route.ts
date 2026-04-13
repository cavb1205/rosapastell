import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { updateOrderStatus } from "@/lib/woocommerce";

// Wompi firma el evento con SHA-256 usando el event secret
function verifyWompiSignature(body: string, signature: string): boolean {
  const secret = process.env.WOMPI_EVENTS_SECRET;
  if (!secret) return false;
  const expected = createHash("sha256").update(body + secret).digest("hex");
  return expected === signature;
}

export async function POST(request: NextRequest) {
  const raw = await request.text();
  const signature = request.headers.get("x-event-checksum") ?? "";

  if (!verifyWompiSignature(raw, signature)) {
    console.warn("[Wompi Webhook] Firma inválida");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let event: {
    event: string;
    data: {
      transaction: {
        reference: string;
        status: "APPROVED" | "DECLINED" | "VOIDED" | "ERROR";
        amount_in_cents: number;
      };
    };
  };

  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
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
