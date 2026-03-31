"use client";

import { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import type { WooProduct } from "@/types/product";
import { ProductGrid } from "@/components/product/ProductGrid";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function SearchClient() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<WooProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const debouncedQuery = useDebounce(query, 400);

  const runSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setProducts([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setProducts(data.data || []);
      setSearched(true);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runSearch(debouncedQuery);
  }, [debouncedQuery, runSearch]);

  return (
    <div>
      <div className="relative max-w-xl mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar pijamas, tallas, estilos..."
          className="w-full rounded-full border border-warm-200 bg-white pl-12 pr-5 py-3.5 text-sm text-warm-800 focus:outline-none focus:ring-2 focus:ring-rose-300 hover:border-warm-300 transition-colors"
          autoFocus
        />
      </div>

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-warm-100 rounded-xl mb-3" />
              <div className="h-4 bg-warm-100 rounded mb-2" />
              <div className="h-4 w-2/3 bg-warm-100 rounded" />
            </div>
          ))}
        </div>
      )}

      {!loading && searched && (
        <>
          <p className="text-sm text-warm-500 mb-6">
            {products.length === 0
              ? `Sin resultados para "${query}"`
              : `${products.length} resultado${products.length !== 1 ? "s" : ""} para "${query}"`}
          </p>
          <ProductGrid products={products} />
        </>
      )}

      {!loading && !searched && (
        <p className="text-warm-400 text-sm">
          Escribe al menos 2 caracteres para buscar.
        </p>
      )}
    </div>
  );
}
