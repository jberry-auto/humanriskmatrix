import type { HighlightColor } from "@/lib/matrix/share";

// Literal Tailwind classes per highlight color (so they are statically discoverable),
// plus the human-readable label that accompanies the color for accessibility.
export interface HighlightStyle {
  readonly dot: string;
  readonly border: string;
  readonly bg: string;
  readonly label: string;
}

export const HIGHLIGHT_STYLE: Record<HighlightColor, HighlightStyle> = {
  green: { dot: "bg-hl-green", border: "border-hl-green", bg: "bg-hl-green/10", label: "Green" },
  yellow: {
    dot: "bg-hl-yellow",
    border: "border-hl-yellow",
    bg: "bg-hl-yellow/15",
    label: "Yellow",
  },
  red: { dot: "bg-hl-red", border: "border-hl-red", bg: "bg-hl-red/10", label: "Red" },
};
