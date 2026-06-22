// Per-level phase icons. These are placeholder line icons.
//
// To use the real set (AdobeStock_638912671.ai): in Illustrator, export each of the five icons as
// its own optimized SVG, then paste the inner markup of each into the matching `case` below. Keep
// `viewBox="0 0 24 24"`, `fill="none"`, and `stroke="currentColor"` so they inherit size and the
// white-on-circle color. (The .ai is EPS PostScript and cannot be split into icons automatically.)
import type { SVGProps } from "react";

interface PhaseIconProps {
  level: number;
  className?: string;
}

export function PhaseIcon({ level, className }: PhaseIconProps) {
  const props: SVGProps<SVGSVGElement> = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    className,
  };

  switch (level) {
    case 1: // Compliance Awareness — clipboard with a check
      return (
        <svg {...props}>
          <path d="M9 4h6v3H9z" />
          <path d="M16 5h2v15H6V5h2" />
          <path d="m9 13 2 2 4-4" />
        </svg>
      );
    case 2: // Just-in-Time Training — a moment-of-action bolt
      return (
        <svg {...props}>
          <path d="M13 3 5 14h6l-1 7 8-11h-6z" />
        </svg>
      );
    case 3: // Threat-Informed Risk Management — a gauge
      return (
        <svg {...props}>
          <path d="M4 15a8 8 0 0 1 16 0" />
          <path d="m12 15 4-3" />
          <circle cx="12" cy="15" r="1" />
        </svg>
      );
    case 4: // Insider-Threat Detection — an eye
      return (
        <svg {...props}>
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );
    default: // Adaptive Security Program — a shield with a check
      return (
        <svg {...props}>
          <path d="M12 3 5 6v5c0 4 3 7 7 8 4-1 7-4 7-8V6z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
  }
}
