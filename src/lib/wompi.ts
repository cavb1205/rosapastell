/** Read-only, server-to-server verification. Never creates or refunds payments. */
export interface VerifiedWompiTransaction {
  id: string;
  reference: string;
  status: string;
  amount_in_cents: number;
  currency: string;
}

export async function getVerifiedWompiTransaction(id: string): Promise<VerifiedWompiTransaction> {
  const key = process.env.WOMPI_PRIVATE_KEY;
  if (!key || !/^prv_(prod|test)_[A-Za-z0-9_-]+$/.test(key)) throw new Error("Falta configurar la consulta segura de Wompi");
  if (!/^[A-Za-z0-9_-]{1,150}$/.test(id)) throw new Error("Identificador de transacción inválido");
  const origin = key.startsWith("prv_prod_") ? "https://production.wompi.co" : "https://sandbox.wompi.co";
  const response = await fetch(`${origin}/v1/transactions/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error("No se pudo consultar el pago en Wompi");
  const body = await response.json();
  const tx = body?.data;
  if (!tx || tx.id !== id || typeof tx.reference !== "string" || typeof tx.status !== "string" ||
    !Number.isSafeInteger(tx.amount_in_cents) || tx.amount_in_cents < 0 || tx.currency !== "COP") {
    throw new Error("Wompi no devolvió una transacción válida");
  }
  return { id: tx.id, reference: tx.reference, status: tx.status, amount_in_cents: tx.amount_in_cents, currency: tx.currency };
}
