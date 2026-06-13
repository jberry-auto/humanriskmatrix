import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DegreeGroup } from "@/lib/matrix/group";

const groups: DegreeGroup[] = [
  {
    degree: {
      id: "internal",
      name: "Internal",
      order: 1,
      categoryRange: [1, 3],
      adversaryRole: "None",
      awareness: "Low to none",
    },
    categories: [
      {
        id: 1,
        name: "Accidental Disclosure",
        degreeId: "internal",
        mappedModels: ["swiss-cheese"],
        insiderCategories: ["negligent-insider"],
        techniques: [
          {
            id: "1-a",
            label: "Misdirected email",
            mitreId: null,
            description: "Wrong recipient gets the email.",
          },
          { id: "1-b", label: "Lost device", mitreId: "T1566", description: "A device is lost." },
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
    const header = screen.getByRole("button", { name: /Internal/i });
    expect(screen.getByRole("button", { name: "Misdirected email" })).toBeInTheDocument();
    await userEvent.click(header);
    expect(screen.queryByRole("button", { name: "Misdirected email" })).not.toBeInTheDocument();
  });
});
