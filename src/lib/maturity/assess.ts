import type { MaturityLevel, MaturitySegment } from "../content/schema";

/**
 * Where a segment stands today: the highest level whose foundation is solid — i.e. the top of an
 * unbroken streak from Level 1, capped at the segment's ceiling. You cannot claim a level while a
 * level beneath it is unmet. Higher, out-of-order strengths don't raise this number; they surface
 * as context in {@link nextStep}. Returns 0 when Level 1 is not met.
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
  | {
      readonly kind: "advance";
      readonly toLevel: number;
      readonly gate: string;
      // The highest level already met out of order, when it sits above the consolidated footing —
      // signals "you have these practices, but a lower gap is holding the score back". Null when
      // progress is contiguous and the next level is plain growth.
      readonly reachedHigher: number | null;
    }
  | { readonly kind: "ceiling"; readonly residualRisk: string | null };

/**
 * What to do next from the consolidated footing: advance to the next level (with its gate), or —
 * once the foundation reaches the cap — manage the residual risk above it. When higher levels are
 * already met out of order, the step points at the first gap and reports the reach for context.
 */
export function nextStep(
  segment: MaturitySegment,
  levels: readonly MaturityLevel[],
  isLevelMet: (level: number) => boolean,
): NextStep {
  const achieved = achievedLevel(segment, isLevelMet);
  if (achieved >= segment.cap) {
    return { kind: "ceiling", residualRisk: segment.residualRisk };
  }
  const reach = highestMet(segment, isLevelMet);
  const toLevel = achieved + 1;
  return {
    kind: "advance",
    toLevel,
    gate: gateToReach(levels, toLevel),
    reachedHigher: reach > achieved ? reach : null,
  };
}

// The highest level met at all (capped), regardless of gaps below it.
function highestMet(segment: MaturitySegment, isLevelMet: (level: number) => boolean): number {
  let reach = 0;
  for (let level = 1; level <= segment.cap; level += 1) {
    if (isLevelMet(level)) reach = level;
  }
  return reach;
}

// How to reach a given level: complete the prior level's gate. Level 1 has no prior, so name it.
function gateToReach(levels: readonly MaturityLevel[], toLevel: number): string {
  if (toLevel <= 1) {
    const first = levels.find((l) => l.level === 1);
    return `Establish Level 1 — ${first?.name ?? "the basics"}.`;
  }
  const prior = levels.find((l) => l.level === toLevel - 1);
  return prior?.gate ?? "";
}
