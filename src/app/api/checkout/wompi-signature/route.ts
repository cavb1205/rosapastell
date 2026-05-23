import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
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

  const chain = `${reference}${amountInCents}${currency}${integritySecret}`;
  const signature = createHash("sha256").update(chain).digest("hex");

  return NextResponse.json({ signature });
}
