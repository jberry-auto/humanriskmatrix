import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { DegreeGroup } from "@/lib/matrix/group";
import { encodeHeatmap, type HighlightColor } from "@/lib/matrix/share";

const groups: DegreeGroup[] = [
  {
    degree: {
      id: "unintentional",
      name: "Unintentional",
      order: 1,
      categoryRange: [1, 3],
      adversaryRole: "None",
      awareness: "Low to none",
    },
    categories: [
      {
        id: 1,
        name: "Accidental Disclosure",
        degreeId: "unintentional",
        mappedModels: ["swiss-cheese"],
        insiderCategories: ["negligent-insider"],
        techniques: [
          {
            id: "1-a",
            label: "Misdirected email",
            mitreId: null,
            description: "Wrong recipient gets the email.",
            detailedDescription: "Autocomplete sends a sensitive email to the wrong person.",
            attackerBehavior: "An adversary harvests the leaked thread for follow-on targeting.",
            insiderBehavior: "The sender trusts autocomplete and clicks send without checking.",
            prevention: [
              { mode: "educate", action: "Remind staff to verify recipients before sending." },
              { mode: "evaluate", action: "Simulate misaddressed-email scenarios." },
              {
                mode: "monitor",
                action: "Watch DLP signals for external sends of sensitive data.",
              },
              { mode: "intervene", action: "Send a blame-free nudge when a misfire is detected." },
            ],
          },
          {
            id: "1-b",
            label: "Lost device",
            mitreId: "T1566",
            description: "A device is lost.",
            detailedDescription: "An unencrypted device leaves the building and is lost.",
            attackerBehavior: "Whoever finds it can browse stored data at leisure.",
            insiderBehavior: "The employee misplaces the device during routine travel.",
            prevention: [
              { mode: "educate", action: "Teach device-handling habits for travel." },
              { mode: "evaluate", action: "Test recovery and wipe procedures." },
              { mode: "monitor", action: "Track device check-in and encryption status." },
              { mode: "intervene", action: "Remotely wipe and re-issue with coaching." },
            ],
          },
        ],
      },
    ],
  },
];

const frameworks = { "swiss-cheese": { title: "Swiss Cheese", summary: "layered defenses" } };
const insiders = { "negligent-insider": { name: "Negligent insider" } };

async function renderMatrix() {
  const { MatrixView } = await import("@/components/matrix/MatrixView");
  return render(<MatrixView groups={groups} frameworks={frameworks} insiders={insiders} />);
}

const cycleButton = (label: string) =>
  screen.getByRole("button", { name: new RegExp(`^${label}: `) });

beforeEach(() => {
  localStorage.clear();
  window.location.hash = "";
  vi.resetModules();
});

afterEach(() => {
  window.location.hash = "";
});

describe("MatrixView", () => {
  it("opens the detail drawer (with detail sections) by clicking the technique", async () => {
    await renderMatrix();
    await userEvent.click(screen.getByRole("button", { name: "Misdirected email" }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Wrong recipient gets the email.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "How an adversary operates" })).toBeInTheDocument();
  });

  it("cycles a technique through highlight colors and persists to v2 storage", async () => {
    await renderMatrix();
    expect(screen.getByText(/0 techniques selected/i)).toBeInTheDocument();

    await userEvent.click(cycleButton("Misdirected email"));
    expect(screen.getByText(/1 technique selected/i)).toBeInTheDocument();
    expect(screen.getByText("Green 1")).toBeInTheDocument();
    expect(localStorage.getItem("hrm.heatmap.v2")).toContain("green");

    await userEvent.click(cycleButton("Misdirected email"));
    expect(screen.getByText("Yellow 1")).toBeInTheDocument();
    expect(screen.getByText("Green 0")).toBeInTheDocument();
  });

  it("shares a link that encodes the current selection", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });

    await renderMatrix();
    await userEvent.click(cycleButton("Misdirected email"));
    await userEvent.click(screen.getByRole("button", { name: "Share" }));

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText.mock.calls[0]?.[0]).toContain("#h=");
    expect(window.location.hash).toMatch(/^#h=/);
  });

  it("seeds the selection from a shared link hash on mount", async () => {
    const encoded = encodeHeatmap(new Map<string, HighlightColor>([["1-a", "red"]]), [
      "1-a",
      "1-b",
    ]);
    window.location.hash = `#h=${encoded}`;

    await renderMatrix();
    expect(screen.getByText(/1 technique selected/i)).toBeInTheDocument();
    expect(screen.getByText("Red 1")).toBeInTheDocument();
  });

  it("collapses an intent degree", async () => {
    await renderMatrix();
    expect(cycleButton("Misdirected email")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Unintentional/i }));
    expect(screen.queryByRole("button", { name: /^Misdirected email: / })).not.toBeInTheDocument();
  });
});
