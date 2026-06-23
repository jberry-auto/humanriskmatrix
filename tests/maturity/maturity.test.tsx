import { render, screen, within } from "@testing-library/react";
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
        question: "small awareness question",
      },
      {
        segment: "enterprise",
        approach: "ent approach",
        practices: ["ent practice"],
        question: "ent awareness question",
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
        question: "ent detection question",
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
  it("answers a yes/no question per level and respects the cap", async () => {
    render(<MaturityAssessment segments={segments} levels={levels} />);

    // Default segment is Small (one question, since it caps at L1); nothing answered yet.
    expect(screen.getByRole("heading", { name: /Not yet at Level 1/ })).toBeInTheDocument();
    expect(screen.getByText("small awareness question")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Yes" }));

    // Small caps at L1, so a "yes" lands at the ceiling with the residual-risk guidance.
    expect(screen.getByRole("heading", { name: /Level 1 — Awareness/ })).toBeInTheDocument();
    expect(screen.getByText(/transfer the rest/)).toBeInTheDocument();
  });

  it("keeps the headline at the consolidated footing but surfaces an out-of-order reach", async () => {
    render(<MaturityAssessment segments={segments} levels={levels} />);

    await userEvent.click(screen.getByRole("button", { name: "Enterprise" }));

    // No to level 1, yes to level 2: footing is still nothing, but the level-2 reach is acknowledged.
    const q1 = screen.getByRole("group", { name: "Answer for question 1" });
    const q2 = screen.getByRole("group", { name: "Answer for question 2" });
    await userEvent.click(within(q1).getByRole("button", { name: "No" }));
    await userEvent.click(within(q2).getByRole("button", { name: "Yes" }));

    expect(screen.getByRole("heading", { name: /Not yet at Level 1/ })).toBeInTheDocument();
    expect(screen.getByText(/Level 2 practices/)).toBeInTheDocument();
    expect(screen.getByText(/close the Level 1 gap/)).toBeInTheDocument();
  });

  it("shows one question per level and switches them by segment", async () => {
    render(<MaturityAssessment segments={segments} levels={levels} />);

    expect(screen.getByText("small awareness question")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Enterprise" }));

    // Enterprise caps at L2 → both questions appear; the small one is gone.
    expect(screen.getByText("ent awareness question")).toBeInTheDocument();
    expect(screen.getByText("ent detection question")).toBeInTheDocument();
    expect(screen.queryByText("small awareness question")).not.toBeInTheDocument();
  });
});
