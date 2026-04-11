"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { WooProduct } from "@/types/product";
export interface SearchIndexItem {
  id: number;
  name: string;
  slug: string;
  price: string;
  image: string;
  category: string;
}
import { ProductGrid } from "@/components/product/ProductGrid";
import { formatPrice } from "@/lib/formatters";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const MAX_SUGGESTIONS = 6;

function normalize(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function SearchClient() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<WooProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Índice estático
  const [index, setIndex] = useState<SearchIndexItem[]>([]);
  const [suggestions, setSuggestions] = useState<SearchIndexItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 350);

  // Cargar índice una sola vez
  useEffect(() => {
    fetch("/api/search/index")
      .then((r) => r.json())
      .then((data: SearchIndexItem[]) => setIndex(data))
      .catch(() => {});
  }, []);

  // Filtrar sugerencias localmente — sin llamadas al servidor
  useEffect(() => {
    if (query.trim().length < 2 || index.length === 0) {
      setSuggestions([]);
      return;
    }
    const q = normalize(query.trim());
    const results = index
      .filter((item) => normalize(item.name).includes(q))
      .slice(0, MAX_SUGGESTIONS);
    setSuggestions(results);
  }, [query, index]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const runSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setProducts([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setShowSuggestions(false);
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

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
    if (e.key === "Enter") {
      runSearch(query);
    }
  }

  function handleClear() {
    setQuery("");
    setProducts([]);
    setSearched(false);
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  }

  return (
    <div>
      {/* Input con dropdown de sugerencias */}
      <div className="relative max-w-xl mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Buscar pijamas, tallas, estilos..."
          className="w-full rounded-full border border-warm-200 bg-white pl-12 pr-10 py-3.5 text-sm text-warm-800 focus:outline-none focus:ring-2 focus:ring-burgundy-200 hover:border-warm-300 transition-colors"
          autoFocus
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-300 hover:text-warm-500 transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Dropdown sugerencias */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-lg border border-warm-100 overflow-hidden z-50"
          >
            {suggestions.map((item) => (
              <Link
                key={item.id}
                href={`/producto/${item.slug}`}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-warm-50 transition-colors"
                onClick={() => setShowSuggestions(false)}
              >
                {item.image ? (
                  <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-cream-100">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-cream-100" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-warm-800 truncate">{item.name}</p>
                  {item.category && (
                    <p className="text-xs text-warm-400 truncate">{item.category}</p>
                  )}
                </div>
                <span className="text-sm font-semibold text-burgundy-500 shrink-0">
                  {formatPrice(item.price)}
                </span>
              </Link>
            ))}
            {/* Ver todos los resultados */}
            <button
              type="button"
              onClick={() => runSearch(query)}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-burgundy-500 hover:bg-burgundy-50 transition-colors border-t border-warm-100"
            >
              <Search className="h-4 w-4" />
              Ver todos los resultados para &ldquo;{query}&rdquo;
            </button>
          </div>
        )}
      </div>

      {/* Resultados de búsqueda completa */}
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
