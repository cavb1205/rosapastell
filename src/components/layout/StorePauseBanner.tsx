/**
 * Aviso global que aparece en la parte superior del sitio cuando la tienda
 * está en pausa (lanzamiento de colección). Combina con el motivo de corazones
 * ♥ y los divisores finos del SiteHeader para mantener la estética de marca.
 *
 * Se renderiza desde el layout (Server Component) según el estado leído en el
 * servidor, así no hay parpadeo de hidratación.
 */
export function StorePauseBanner({ message }: { message: string }) {
  const text =
    message ||
    "Estamos preparando la nueva colección ✨ Muy pronto disponible";

  return (
    <div className="w-full bg-gradient-to-r from-burgundy-800 via-burgundy-900 to-burgundy-800">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2.5 px-4 py-2.5 sm:gap-4">
        <span aria-hidden className="hidden h-px w-8 bg-rose-200/40 sm:block lg:w-12" />
        <span aria-hidden className="text-xs text-rose-200">♥</span>
        <p className="text-center text-[13px] font-medium tracking-wide text-cream-50 sm:text-sm">
          {text}
        </p>
        <span aria-hidden className="text-xs text-rose-200">♥</span>
        <span aria-hidden className="hidden h-px w-8 bg-rose-200/40 sm:block lg:w-12" />
      </div>
    </div>
  );
}
