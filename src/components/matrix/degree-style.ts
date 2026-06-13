import type { IntentDegreeId } from "@/lib/content/schema";

// Literal Tailwind classes per intent degree (so they are statically discoverable).
export interface DegreeStyle {
  readonly dot: string;
  readonly selBorder: string;
  readonly selBg: string;
}

export const DEGREE_STYLE: Record<IntentDegreeId, DegreeStyle> = {
  unintentional: {
    dot: "bg-degree-unintentional",
    selBorder: "border-degree-unintentional",
    selBg: "bg-degree-unintentional/10",
  },
  unaware: {
    dot: "bg-degree-unaware",
    selBorder: "border-degree-unaware",
    selBg: "bg-degree-unaware/10",
  },
  deceived: {
    dot: "bg-degree-deceived",
    selBorder: "border-degree-deceived",
    selBg: "bg-degree-deceived/10",
  },
  coerced: {
    dot: "bg-degree-coerced",
    selBorder: "border-degree-coerced",
    selBg: "bg-degree-coerced/10",
  },
  complicit: {
    dot: "bg-degree-complicit",
    selBorder: "border-degree-complicit",
    selBg: "bg-degree-complicit/10",
  },
};
