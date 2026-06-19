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
  modes: ["educate"],
  degrees: ["unintentional"],
  counterIntel: "c",
  limitation: "l",
  gate: n === 5 ? null : `gate-${n}`,
  tracks: [],
}));

describe("achievedLevel", () => {
  it("returns 0 when level 1 is not met", () => {
    expect(achievedLevel(segment(4, "r"), () => false)).toBe(0);
  });

  it("is cumulative — stops at the first unmet level", () => {
    const met = new Set([1, 2]);
    expect(achievedLevel(segment(4, "r"), (l) => met.has(l))).toBe(2);
  });

  it("caps at the segment cap even when higher levels are met", () => {
    expect(achievedLevel(segment(3, "r"), () => true)).toBe(3);
  });
});

describe("nextStep", () => {
  it("advances with the achieved level's gate below the cap", () => {
    expect(nextStep(segment(4, "r"), levels, 2)).toEqual({
      kind: "advance",
      toLevel: 3,
      gate: "gate-2",
    });
  });

  it("points to level 1 from achieved 0", () => {
    const step = nextStep(segment(4, "r"), levels, 0);
    expect(step.kind).toBe("advance");
    if (step.kind === "advance") expect(step.toLevel).toBe(1);
  });

  it("returns the ceiling with residual risk at the cap", () => {
    expect(nextStep(segment(3, "transfer it"), levels, 3)).toEqual({
      kind: "ceiling",
      residualRisk: "transfer it",
    });
  });

  it("ceiling residualRisk is null at the top level", () => {
    expect(nextStep(segment(5, null), levels, 5)).toEqual({ kind: "ceiling", residualRisk: null });
  });
});
