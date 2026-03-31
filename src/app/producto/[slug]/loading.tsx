/**
 * Skeleton para la página de producto — dos columnas: galería a la izquierda,
 * detalles a la derecha. Refleja el layout real mientras se carga WooCommerce.
 */
export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <div className="skeleton h-3.5 w-10 rounded" />
        <div className="skeleton h-3.5 w-2 rounded" />
        <div className="skeleton h-3.5 w-24 rounded" />
        <div className="skeleton h-3.5 w-2 rounded" />
        <div className="skeleton h-3.5 w-36 rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">

        {/* Galería */}
        <div>
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="flex gap-3 mt-4">
            <div className="skeleton h-20 w-20 rounded-xl" />
            <div className="skeleton h-20 w-20 rounded-xl" />
            <div className="skeleton h-20 w-20 rounded-xl" />
          </div>
        </div>

        {/* Detalles */}
        <div className="space-y-6 py-2">
          {/* Nombre */}
          <div className="space-y-2">
            <div className="skeleton h-9 w-4/5 rounded-lg" />
            <div className="skeleton h-9 w-3/5 rounded-lg" />
          </div>

          {/* Precio */}
          <div className="skeleton h-8 w-32 rounded-lg" />

          {/* Descripción */}
          <div className="space-y-2">
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-11/12 rounded" />
            <div className="skeleton h-4 w-4/6 rounded" />
          </div>

          {/* Selector de talla */}
          <div>
            <div className="skeleton h-4 w-16 rounded mb-3" />
            <div className="flex gap-2 flex-wrap">
              <div className="skeleton h-10 w-16 rounded-lg" />
              <div className="skeleton h-10 w-16 rounded-lg" />
              <div className="skeleton h-10 w-16 rounded-lg" />
              <div className="skeleton h-10 w-16 rounded-lg" />
              <div className="skeleton h-10 w-16 rounded-lg" />
            </div>
          </div>

          {/* Botones CTA */}
          <div className="space-y-3 pt-2">
            <div className="skeleton h-14 w-full rounded-xl" />
            <div className="skeleton h-14 w-full rounded-xl" />
          </div>
        </div>
      </div>

      {/* Productos relacionados */}
      <div className="mt-16">
        <div className="skeleton h-7 w-48 rounded-lg mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
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
    </div>
  );
}
