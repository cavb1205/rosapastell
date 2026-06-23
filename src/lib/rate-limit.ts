import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 300_000);
}

function getIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * In-memory rate limiter. Returns null if allowed, or a 429 Response if blocked.
 *
 * @param request    - incoming request (used to extract IP)
 * @param limit      - max requests allowed in the window
 * @param windowMs   - time window in milliseconds
 * @param prefix     - unique key prefix per route
 * @param identifier - clave en vez de la IP (p. ej. email). Útil bajo CGNAT,
 *                     donde muchos clientes legítimos comparten una IP y un
 *                     límite por-IP los bloquearía durante un lanzamiento.
 */
export function rateLimit(
  request: NextRequest,
  {
    limit,
    windowMs,
    prefix,
    identifier,
  }: { limit: number; windowMs: number; prefix: string; identifier?: string },
): NextResponse | null {
  const subject = identifier ? identifier.trim().toLowerCase() : getIP(request);
  const key = `${prefix}:${subject}`;
  const now = Date.now();

  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  entry.count++;

  if (entry.count > limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta de nuevo en unos minutos." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      },
    );
  }

  return null;
}
