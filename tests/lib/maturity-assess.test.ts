import { describe, expect, it } from "vitest";

import type { MaturityLevel, MaturitySegment } from "@/lib/content/schema";
import { achievedLevel, nextStep } from "@/lib/maturity/assess";

function segment(cap: number, residualRisk: string | null): MaturitySegment {
  return { id: "mid-size", name: "Mid-size", description: "d", cap, residualRisk };
}

const levels: MaturityLevel[] = [1, 2, 3, 4, 5].map((n) => ({
  level: n,
  name: `L${n}`,
  posture: "p",
  description: "d",
  signals: "s",
  tooling: "t",
  modes: ["educate"],
  degrees: ["unintentional"],
  counterIntel: "c",
  limitation: "l",
  gate: n === 5 ? null : `gate-${n}`,
  tracks: [],
}));

const met = (...levels: number[]) => {
  const set = new Set(levels);
  return (level: number) => set.has(level);
};

describe("achievedLevel", () => {
  it("returns 0 when level 1 is not met", () => {
    expect(achievedLevel(segment(4, "r"), () => false)).toBe(0);
  });

  it("does not credit a high level when its foundation is skipped", () => {
    // Only level 3 met — no consolidated footing yet, so the headline stays at 0.
    expect(achievedLevel(segment(4, "r"), met(3))).toBe(0);
  });

  it("returns the top of a contiguous streak from level 1", () => {
    expect(achievedLevel(segment(4, "r"), met(1, 2))).toBe(2);
    // The gap at 3 stops the streak even though 4 is met.
    expect(achievedLevel(segment(4, "r"), met(1, 2, 4))).toBe(2);
  });

  it("caps at the segment cap even when higher levels are met", () => {
    expect(achievedLevel(segment(3, "r"), () => true)).toBe(3);
  });
});

describe("nextStep", () => {
  it("advances to the next level's gate when progress is contiguous", () => {
    expect(nextStep(segment(4, "r"), levels, met(1, 2))).toEqual({
      kind: "advance",
      toLevel: 3,
      gate: "gate-2",
      reachedHigher: null,
    });
  });

  it("plain growth when nothing is met yet", () => {
    expect(nextStep(segment(4, "r"), levels, () => false)).toEqual({
      kind: "advance",
      toLevel: 1,
      gate: "Establish Level 1 — L1.",
      reachedHigher: null,
    });
  });

  it("reports the out-of-order reach and points at the gap below it", () => {
    // Levels 1, 2, 4 met → footing is 2, but level 4 practices exist; close the level-3 gap.
    expect(nextStep(segment(5, "r"), levels, met(1, 2, 4))).toEqual({
      kind: "advance",
      toLevel: 3,
      gate: "gate-2",
      reachedHigher: 4,
    });
  });

  it("flags a top-level-only selection as an unconsolidated reach", () => {
    // Clicking only the top question: no footing, but the reach is surfaced and the gap is level 1.
    expect(nextStep(segment(5, "r"), levels, met(5))).toEqual({
      kind: "advance",
      toLevel: 1,
      gate: "Establish Level 1 — L1.",
      reachedHigher: 5,
    });
  });

  it("returns the ceiling with residual risk once the footing reaches the cap", () => {
    expect(nextStep(segment(3, "transfer it"), levels, met(1, 2, 3))).toEqual({
      kind: "ceiling",
      residualRisk: "transfer it",
    });
  });

  it("ceiling residualRisk is null at the top level", () => {
    expect(nextStep(segment(5, null), levels, () => true)).toEqual({
      kind: "ceiling",
      residualRisk: null,
    });
  });
});
