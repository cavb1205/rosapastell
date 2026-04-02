"use client";

import { useTransition, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SIZES } from "@/lib/constants";

export function SizeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("talla") || "";
  const [pending, startTransition] = useTransition();
  const [pendingSize, setPendingSize] = useState<string | null>(null);

  function select(size: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (current === size) {
      params.delete("talla");
      setPendingSize(null);
    } else {
      params.set("talla", size);
      setPendingSize(size);
    }
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-semibold uppercase tracking-widest text-warm-400 mr-1">
        Talla
      </span>
      {SIZES.map((size) => {
        const isActive = current === size;
        const isLoading = pending && pendingSize === size;
        return (
          <button
            key={size}
            onClick={() => select(size)}
            disabled={pending}
            className={`relative min-w-[2.5rem] px-3 py-1.5 rounded-full text-xs font-semibold border transition-all disabled:cursor-wait ${
              isActive
                ? "bg-burgundy-500 text-white border-burgundy-500"
                : "border-warm-200 text-warm-600 hover:border-burgundy-300 hover:text-burgundy-500"
            } ${isLoading ? "opacity-70" : ""}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-1">
                <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                {size}
              </span>
            ) : size}
          </button>
        );
      })}
      {current && !pending && (
        <button
          onClick={() => select(current)}
          className="text-xs text-warm-400 hover:text-warm-700 underline underline-offset-2 transition-colors ml-1"
        >
          Limpiar
        </button>
      )}
    </div>
  );
}
