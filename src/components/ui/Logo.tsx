import Link from "next/link";

interface LogoProps {
  instanceId?: string;
  markSize?: number;
  showText?: boolean;
  light?: boolean;
  className?: string;
  href?: string | null;
}

function LogoMark({ id, size, light }: { id: string; size: number; light: boolean }) {
  const backArc = light ? "rgba(255,255,255,0.35)" : "#C8BEB4";
  const frontArc = light ? "rgba(255,255,255,0.90)" : "#8A7B6C";
  const heart = light ? "#FDD8E8" : "#F89BBB";

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
        <mask id={`${id}-b`}>
          <circle cx="42" cy="60" r="42" fill="white" />
          <circle cx="65" cy="46" r="37" fill="black" />
        </mask>
        <mask id={`${id}-f`}>
          <circle cx="38" cy="60" r="34" fill="white" />
          <circle cx="59" cy="48" r="30" fill="black" />
        </mask>
      </defs>
      <circle cx="42" cy="60" r="42" fill={backArc} mask={`url(#${id}-b)`} />
      <circle cx="38" cy="60" r="34" fill={frontArc} mask={`url(#${id}-f)`} />
      <path
        d="M64 36 C60 31 53 28 53 23.5 C53 19 56.5 18 60 19.5 C61.5 20.2 63 22 64 24.5 C65 22 66.5 20.2 68 19.5 C71.5 18 75 19 75 23.5 C75 28 68 31 64 36Z"
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
  const textColor = light ? "text-white" : "text-warm-700";

  const inner = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark id={`rp-${instanceId}`} size={markSize} light={light} />
      {showText && (
        <span className={`font-heading text-xl tracking-wide leading-none ${textColor}`}>
          Rosa Pastell
        </span>
      )}
    </span>
  );

  if (href) {
    return <Link href={href} className="inline-flex items-center">{inner}</Link>;
  }
  return <>{inner}</>;
}
