import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");
  const amountInCents = searchParams.get("amount");
  const currency = searchParams.get("currency") ?? "COP";

  if (!reference || !amountInCents) {
    return NextResponse.json({ error: "Parámetros requeridos" }, { status: 400 });
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
