import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DegreeGroup } from "@/lib/matrix/group";

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

beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
});

describe("MatrixView", () => {
  it("opens the detail drawer with the technique's description", async () => {
    await renderMatrix();
    await userEvent.click(screen.getByRole("button", { name: "Misdirected email" }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Wrong recipient gets the email.")).toBeInTheDocument();
  });

  it("renders the per-technique detail sections and mode-grouped countermeasures", async () => {
    await renderMatrix();
    await userEvent.click(screen.getByRole("button", { name: "Misdirected email" }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "How an adversary operates" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "How the insider acts" })).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Countermeasures" })).toBeInTheDocument();
    for (const mode of ["Educate", "Evaluate", "Monitor", "Intervene"]) {
      expect(screen.getByRole("heading", { name: mode })).toBeInTheDocument();
    }
    expect(
      screen.getByText("Send a blame-free nudge when a misfire is detected."),
    ).toBeInTheDocument();
  });

  it("selects a technique into the heatmap and persists it", async () => {
    await renderMatrix();
    expect(screen.getByText(/0 techniques selected/i)).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("checkbox", { name: /add Misdirected email to heatmap/i }),
    );

    expect(screen.getByText(/1 technique selected/i)).toBeInTheDocument();
    expect(localStorage.getItem("hrm.heatmap.v1")).toContain("1-a");
  });

  it("collapses an intent degree", async () => {
    await renderMatrix();
    const header = screen.getByRole("button", { name: /Unintentional/i });
    expect(screen.getByRole("button", { name: "Misdirected email" })).toBeInTheDocument();
    await userEvent.click(header);
    expect(screen.queryByRole("button", { name: "Misdirected email" })).not.toBeInTheDocument();
  });
});
