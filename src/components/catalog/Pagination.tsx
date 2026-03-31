import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string>;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  function buildHref(page: number) {
    const params = new URLSearchParams(searchParams);
    if (page > 1) {
      params.set("page", String(page));
    } else {
      params.delete("page");
    }
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const pages: number[] = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <nav aria-label="Paginación" className="flex items-center justify-center gap-2 mt-10">
      {currentPage > 1 && (
        <Link
          href={buildHref(currentPage - 1)}
          className="flex items-center justify-center h-10 w-10 rounded-lg border border-warm-200 text-warm-600 hover:bg-warm-50 transition-colors"
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      )}
      {pages.map((page) => (
        <Link
          key={page}
          href={buildHref(page)}
          className={`flex items-center justify-center h-10 w-10 rounded-lg text-sm font-medium transition-colors ${
            page === currentPage
              ? "bg-burgundy-500 text-white"
              : "border border-warm-200 text-warm-600 hover:bg-warm-50"
          }`}
          aria-current={page === currentPage ? "page" : undefined}
        >
          {page}
        </Link>
      ))}
      {currentPage < totalPages && (
        <Link
          href={buildHref(currentPage + 1)}
          className="flex items-center justify-center h-10 w-10 rounded-lg border border-warm-200 text-warm-600 hover:bg-warm-50 transition-colors"
          aria-label="Página siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </nav>
  );
}
