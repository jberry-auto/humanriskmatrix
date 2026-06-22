import type { MaturityLevel, MaturitySegment } from "../content/schema";

/**
 * The highest maturity level a segment satisfies. Levels are cumulative — a segment is at level N
 * only if levels 1..N are all met — and the result is capped at the segment's reachable ceiling.
 * Returns 0 when level 1 is not met.
 */
export function achievedLevel(
  segment: MaturitySegment,
  isLevelMet: (level: number) => boolean,
): number {
  let achieved = 0;
  for (let level = 1; level <= segment.cap; level += 1) {
    if (!isLevelMet(level)) break;
    achieved = level;
  }
  return achieved;
}

export type NextStep =
  | { readonly kind: "advance"; readonly toLevel: number; readonly gate: string }
  | { readonly kind: "ceiling"; readonly residualRisk: string | null };

/**
 * What to do from the achieved level: advance to the next level (with the gate describing how), or
 * — once the segment's cap is reached — manage the residual risk above it.
 */
export function nextStep(
  segment: MaturitySegment,
  levels: readonly MaturityLevel[],
  achieved: number,
): NextStep {
  if (achieved >= segment.cap) {
    return { kind: "ceiling", residualRisk: segment.residualRisk };
  }
  const toLevel = achieved + 1;
  if (achieved === 0) {
    const first = levels.find((l) => l.level === 1);
    return {
      kind: "advance",
      toLevel,
      gate: `Establish Level 1 — ${first?.name ?? "the basics"}.`,
    };
  }
  const current = levels.find((l) => l.level === achieved);
  return { kind: "advance", toLevel, gate: current?.gate ?? "" };
}
