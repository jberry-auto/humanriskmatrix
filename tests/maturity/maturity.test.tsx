import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { MaturityAssessment } from "@/components/maturity/MaturityAssessment";
import { MaturityPhases } from "@/components/maturity/MaturityPhases";
import { MaturityTimeline } from "@/components/maturity/MaturityTimeline";
import type { MaturityLevel, MaturitySegment } from "@/lib/content/schema";

const segments: MaturitySegment[] = [
  {
    id: "small",
    name: "Small",
    description: "small desc",
    cap: 1,
    residualRisk: "transfer the rest",
  },
  { id: "enterprise", name: "Enterprise", description: "ent desc", cap: 2, residualRisk: null },
];

const levels: MaturityLevel[] = [
  {
    level: 1,
    name: "Awareness",
    posture: "people are a checkbox",
    description: "desc one",
    signals: "completion records",
    tooling: "fixture tool one",
    modes: ["educate"],
    degrees: ["unintentional"],
    counterIntel: null,
    limitation: "blind to intent",
    gate: "track behaviors over time",
    tracks: [
      {
        segment: "small",
        approach: "small approach",
        practices: ["small practice"],
        assessmentCriteria: ["small does awareness"],
      },
      {
        segment: "enterprise",
        approach: "ent approach",
        practices: ["ent practice"],
        assessmentCriteria: ["ent does awareness"],
      },
    ],
  },
  {
    level: 2,
    name: "Detection",
    posture: "some are threats",
    description: "desc two",
    signals: "correlated analytics",
    tooling: "fixture tool two",
    modes: ["monitor"],
    degrees: ["intentional"],
    counterIntel: "CI detection",
    limitation: "case by case",
    gate: null,
    northStar: true,
    tracks: [
      {
        segment: "enterprise",
        approach: "ent detect",
        practices: ["ent detect practice"],
        assessmentCriteria: ["ent does detection"],
      },
    ],
  },
];

describe("MaturityPhases", () => {
  it("renders an icon circle and caption per level", () => {
    render(<MaturityPhases levels={levels} />);
    expect(screen.getByText("Awareness")).toBeInTheDocument();
    expect(screen.getByText("Detection")).toBeInTheDocument();
    expect(screen.getByText("L1")).toBeInTheDocument();
    expect(screen.getByText("L2")).toBeInTheDocument();
  });
});

describe("MaturityTimeline", () => {
  it("renders each phase's story, the per-size tracks, the ceiling, and the gate", () => {
    render(<MaturityTimeline levels={levels} segments={segments} />);

    expect(screen.getByRole("heading", { name: "Awareness" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Detection" })).toBeInTheDocument();
    expect(screen.getByText("people are a checkbox")).toBeInTheDocument();
    // CI is a small secondary note, present only where it applies (level 2 here, not level 1)
    expect(screen.getByText("Counter-intel:")).toBeInTheDocument();
    expect(screen.getByText("CI detection")).toBeInTheDocument();
    // example tooling lives in its own meta line, not the prose
    expect(screen.getByText("fixture tool one")).toBeInTheDocument();
    // node carries the degree as text for screen readers
    expect(screen.getByLabelText("Level 2")).toBeInTheDocument();
    // by-size tracks + ceiling marker (Small caps at L1)
    expect(screen.getByText("small approach")).toBeInTheDocument();
    expect(screen.getByText("(ceiling)")).toBeInTheDocument();
    // gate line for level 1
    expect(screen.getByText(/track behaviors over time/)).toBeInTheDocument();
    // Small appears once (L1 only); Enterprise at both levels
    expect(screen.getAllByText("Small")).toHaveLength(1);
    expect(screen.getAllByText("Enterprise")).toHaveLength(2);
  });
});

describe("MaturityAssessment", () => {
  it("scores against the selected segment and respects the cap", async () => {
    render(<MaturityAssessment segments={segments} levels={levels} />);

    // Default segment is Small; nothing checked yet.
    expect(screen.getByRole("heading", { name: /Not yet at Level 1/ })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("checkbox", { name: "small does awareness" }));

    // Small caps at L1, so meeting L1 lands at the ceiling with the residual-risk guidance.
    expect(screen.getByRole("heading", { name: /Level 1 — Awareness/ })).toBeInTheDocument();
    expect(screen.getByText(/transfer the rest/)).toBeInTheDocument();
  });

  it("switches the criteria shown when the segment changes", async () => {
    render(<MaturityAssessment segments={segments} levels={levels} />);

    expect(screen.getByRole("checkbox", { name: "small does awareness" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Enterprise" }));

    // Enterprise caps at L2 → both levels' criteria appear; the small criterion is gone.
    expect(screen.getByRole("checkbox", { name: "ent does awareness" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "ent does detection" })).toBeInTheDocument();
    expect(
      screen.queryByRole("checkbox", { name: "small does awareness" }),
    ).not.toBeInTheDocument();
  });
});
