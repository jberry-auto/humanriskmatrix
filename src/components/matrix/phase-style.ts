import type { PhaseId } from "@/lib/content/schema";

// Literal Tailwind classes per phase (so they are statically discoverable).
export interface PhaseStyle {
  readonly dot: string;
  readonly selBorder: string;
  readonly selBg: string;
}

export const PHASE_STYLE: Record<PhaseId, PhaseStyle> = {
  internal: {
    dot: "bg-phase-internal",
    selBorder: "border-phase-internal",
    selBg: "bg-phase-internal/10",
  },
  approach: {
    dot: "bg-phase-approach",
    selBorder: "border-phase-approach",
    selBg: "bg-phase-approach/10",
  },
  deception: {
    dot: "bg-phase-deception",
    selBorder: "border-phase-deception",
    selBg: "bg-phase-deception/10",
  },
  imposition: {
    dot: "bg-phase-imposition",
    selBorder: "border-phase-imposition",
    selBg: "bg-phase-imposition/10",
  },
  alignment: {
    dot: "bg-phase-alignment",
    selBorder: "border-phase-alignment",
    selBg: "bg-phase-alignment/10",
  },
};
