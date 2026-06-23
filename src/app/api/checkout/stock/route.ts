import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { findInsufficientStock } from "@/lib/stock";

/**
 * Chequeo de stock de solo lectura para el checkout (aviso temprano). NO crea
 * pedidos: avisa al cliente que un ítem se agotó antes de que llene el formulario.
 * La validación dura sigue estando en POST /api/orders.
 */
const schema = z.object({
  items: z
    .array(
      z.object({
        product_id: z.number().int().positive(),
        variation_id: z.number().int().positive().optional(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1)
    .max(50),
});

export async function POST(request: NextRequest) {
  // Holgado a propósito: es un read que dispara cada cliente al abrir el checkout
  // y muchos comparten IP (CGNAT). Su fallo solo omite el aviso temprano.
  const blocked = rateLimit(request, { limit: 60, windowMs: 60_000, prefix: "stock-check" });
  if (blocked) return blocked;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  // Índices (alineados con el array enviado) de los ítems sin stock suficiente.
  const outOfStock = await findInsufficientStock(parsed.data.items);
  return NextResponse.json({ outOfStock });
}
