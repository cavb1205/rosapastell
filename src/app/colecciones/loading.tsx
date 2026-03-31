/**
 * Skeleton para la página de colecciones — grid de tarjetas de categoría.
 */
export default function ColeccionesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="skeleton h-3.5 w-10 rounded" />
          <div className="skeleton h-3.5 w-2 rounded" />
          <div className="skeleton h-3.5 w-24 rounded" />
        </div>
        <div className="skeleton h-10 w-60 rounded-lg mb-3" />
        <div className="skeleton h-4 w-80 rounded" />
      </div>

      {/* Grid de colecciones — 8 tarjetas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="skeleton aspect-square" />
            <div className="p-4 space-y-2">
              <div className="skeleton h-5 w-3/4 rounded" />
              <div className="skeleton h-3.5 w-1/2 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
