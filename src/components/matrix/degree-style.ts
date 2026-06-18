import type { IntentDegreeId } from "@/lib/content/schema";

// Literal Tailwind class per intent degree (so it is statically discoverable).
export interface DegreeStyle {
  readonly dot: string;
}

export const DEGREE_STYLE: Record<IntentDegreeId, DegreeStyle> = {
  unintentional: { dot: "bg-degree-unintentional" },
  unaware: { dot: "bg-degree-unaware" },
  deceived: { dot: "bg-degree-deceived" },
  coerced: { dot: "bg-degree-coerced" },
  intentional: { dot: "bg-degree-intentional" },
};
