"use client";

import Link, { useLinkStatus } from "next/link";
import type { ComponentProps } from "react";

function NavigationFeedback() {
  const { pending } = useLinkStatus();

  return (
    <span
      role="status"
      aria-live="polite"
      aria-hidden={!pending}
      className={`pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-white/60 transition-opacity ${pending ? "opacity-100" : "opacity-0"}`}
    >
      {pending && (
        <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-burgundy-600 shadow-sm">
          Cargando…
        </span>
      )}
    </span>
  );
}

/** Las rejillas no deben consultar decenas de destinos al entrar en pantalla. */
export function CatalogLink({ children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link {...props} prefetch={false}>
      {children}
      <NavigationFeedback />
    </Link>
  );
}
