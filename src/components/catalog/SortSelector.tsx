"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SORT_OPTIONS } from "@/lib/constants";

export function SortSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("orderby") || "popularity";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("orderby", value);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      value={current}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-lg border border-warm-200 bg-white px-3 py-2 text-sm text-warm-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
      aria-label="Ordenar por"
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
