/**
 * Skeleton para la página de categoría — se muestra mientras se obtienen
 * los productos de WooCommerce. Replica fielmente el layout real.
 */
export default function CategoryLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <div className="skeleton h-3.5 w-10 rounded" />
        <div className="skeleton h-3.5 w-2 rounded" />
        <div className="skeleton h-3.5 w-28 rounded" />
      </div>

      {/* Título + pills de categoría */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <div className="skeleton h-9 w-48 rounded-lg mb-2" />
          <div className="skeleton h-3.5 w-24 rounded" />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="skeleton h-8 w-24 rounded-full" />
          <div className="skeleton h-8 w-20 rounded-full" />
          <div className="skeleton h-8 w-28 rounded-full" />
          <div className="skeleton h-8 w-16 rounded-full" />
          <div className="skeleton h-8 w-22 rounded-full" />
        </div>
      </div>

      {/* Sort selector */}
      <div className="flex justify-end mb-6">
        <div className="skeleton h-10 w-44 rounded-xl" />
      </div>

      {/* Grid de productos — 12 tarjetas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="skeleton aspect-square" />
            <div className="p-3 space-y-2">
              <div className="skeleton h-4 w-4/5 rounded" />
              <div className="skeleton h-4 w-2/5 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
