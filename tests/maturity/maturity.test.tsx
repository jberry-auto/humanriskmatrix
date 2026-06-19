import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { MaturityAssessment } from "@/components/maturity/MaturityAssessment";
import { MaturityLadder } from "@/components/maturity/MaturityLadder";
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
    modes: ["educate"],
    degrees: ["unintentional"],
    counterIntel: "none here",
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

describe("MaturityLadder", () => {
  it("renders the full story, segment columns, ceiling, and gate", () => {
    render(<MaturityLadder levels={levels} segments={segments} />);

    expect(screen.getByRole("heading", { name: "Awareness" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Detection" })).toBeInTheDocument();
    expect(screen.getByText("people are a checkbox")).toBeInTheDocument();
    // CI throughline labelled (not conveyed by color alone)
    expect(screen.getAllByText("Counter-intelligence").length).toBeGreaterThan(0);
    expect(screen.getByText("none here")).toBeInTheDocument();
    // mode + degree chips render as text
    expect(screen.getByText("Educate")).toBeInTheDocument();
    expect(screen.getByText("Intentional")).toBeInTheDocument();
    // north-star + ceiling tags
    expect(screen.getByText("North star")).toBeInTheDocument();
    expect(screen.getByText("Ceiling")).toBeInTheDocument();
    expect(screen.getByText(/transfer the rest/)).toBeInTheDocument();
    // gate connector for level 1
    expect(screen.getByText(/track behaviors over time/)).toBeInTheDocument();
    // Small column only at L1 (caps there); Enterprise at both levels
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
