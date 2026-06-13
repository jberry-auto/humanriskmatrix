import type { IntentDegreeId } from "@/lib/content/schema";

// Literal Tailwind classes per intent degree (so they are statically discoverable).
export interface DegreeStyle {
  readonly dot: string;
  readonly selBorder: string;
  readonly selBg: string;
}

export const DEGREE_STYLE: Record<IntentDegreeId, DegreeStyle> = {
  internal: {
    dot: "bg-degree-internal",
    selBorder: "border-degree-internal",
    selBg: "bg-degree-internal/10",
  },
  approach: {
    dot: "bg-degree-approach",
    selBorder: "border-degree-approach",
    selBg: "bg-degree-approach/10",
  },
  deception: {
    dot: "bg-degree-deception",
    selBorder: "border-degree-deception",
    selBg: "bg-degree-deception/10",
  },
  imposition: {
    dot: "bg-degree-imposition",
    selBorder: "border-degree-imposition",
    selBg: "bg-degree-imposition/10",
  },
  alignment: {
    dot: "bg-degree-alignment",
    selBorder: "border-degree-alignment",
    selBg: "bg-degree-alignment/10",
  },
};
