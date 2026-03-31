import Link from "next/link";

interface LogoProps {
  /** ID único para los masks SVG — usar uno distinto por cada instancia en la página */
  instanceId?: string;
  markSize?: number;
  showText?: boolean;
  /** Versión clara para fondos oscuros (panel burgundy, footer, etc.) */
  light?: boolean;
  className?: string;
  href?: string | null;
}

function LogoMark({
  id,
  size,
  light,
}: {
  id: string;
  size: number;
  light: boolean;
}) {
  // Colores del doble arco
  const backArc = light ? "rgba(255,255,255,0.35)" : "#6B5D4F"; // warm-600
  const frontArc = light ? "rgba(255,255,255,0.90)" : "#4D4238"; // warm-700
  const heart = light ? "#F0CCCC" : "#D4A0A0"; // rose-200 / rose-300

  return (
    <svg
      width={size}
      height={Math.round(size * 1.05)}
      viewBox="0 0 100 105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Máscara arco trasero (más grande, más claro → efecto profundidad) */}
        <mask id={`${id}-b`}>
          <circle cx="42" cy="60" r="42" fill="white" />
          <circle cx="65" cy="46" r="37" fill="black" />
        </mask>
        {/* Máscara arco frontal (más pequeño, más oscuro → primer plano) */}
        <mask id={`${id}-f`}>
          <circle cx="38" cy="60" r="34" fill="white" />
          <circle cx="59" cy="48" r="30" fill="black" />
        </mask>
      </defs>

      {/* Arco trasero */}
      <circle cx="42" cy="60" r="42" fill={backArc} mask={`url(#${id}-b)`} />

      {/* Arco frontal */}
      <circle cx="38" cy="60" r="34" fill={frontArc} mask={`url(#${id}-f)`} />

      {/* Corazón — posicionado en la "apertura" del arco */}
      <path
        d="M64 36
           C60 31 53 28 53 23.5
           C53 19 56.5 18 60 19.5
           C61.5 20.2 63 22 64 24.5
           C65 22 66.5 20.2 68 19.5
           C71.5 18 75 19 75 23.5
           C75 28 68 31 64 36Z"
        fill={heart}
      />
    </svg>
  );
}

export function Logo({
  instanceId = "default",
  markSize = 36,
  showText = true,
  light = false,
  className = "",
  href = "/",
}: LogoProps) {
  const textColor = light ? "text-rose-100" : "text-burgundy-600";

  const inner = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark id={`rp-${instanceId}`} size={markSize} light={light} />
      {showText && (
        <span
          className={`font-heading text-xl tracking-wide leading-none ${textColor}`}
        >
          Rosa Pastell
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {inner}
      </Link>
    );
  }

  return <>{inner}</>;
}
