/**
 * Global loading fallback — shown for any route without its own loading.tsx.
 * Uses the Rosa Pastell double-crescent mark (inline SVG) to stay brand-consistent.
 */
export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-7">
      {/* Rosa Pastell mark — pulsing gently */}
      <div className="animate-pulse">
        <svg
          width="56"
          height="59"
          viewBox="0 0 100 105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <mask id="gl-b">
              <circle cx="42" cy="60" r="42" fill="white" />
              <circle cx="65" cy="46" r="37" fill="black" />
            </mask>
            <mask id="gl-f">
              <circle cx="38" cy="60" r="34" fill="white" />
              <circle cx="59" cy="48" r="30" fill="black" />
            </mask>
          </defs>
          <circle cx="42" cy="60" r="42" fill="#C8BEB4" mask="url(#gl-b)" />
          <circle cx="38" cy="60" r="34" fill="#A89B8E" mask="url(#gl-f)" />
          <path
            d="M64 36 C60 31 53 28 53 23.5 C53 19 56.5 18 60 19.5
               C61.5 20.2 63 22 64 24.5 C65 22 66.5 20.2 68 19.5
               C71.5 18 75 19 75 23.5 C75 28 68 31 64 36Z"
            fill="#D4A0A0"
          />
        </svg>
      </div>

      {/* Staggered bouncing dots */}
      <div className="flex items-end gap-1.5" aria-hidden="true">
        <span
          className="block h-2 w-2 rounded-full bg-rose-300 animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="block h-2 w-2 rounded-full bg-rose-300 animate-bounce"
          style={{ animationDelay: "160ms" }}
        />
        <span
          className="block h-2 w-2 rounded-full bg-rose-400 animate-bounce"
          style={{ animationDelay: "320ms" }}
        />
      </div>
    </div>
  );
}
