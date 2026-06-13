import { describe, expect, it } from "vitest";

import type { MatrixColumn, Phase } from "@/lib/content/schema";
import { groupColumnsByPhase } from "@/lib/matrix/group";

const phases: Phase[] = [
  {
    id: "approach",
    name: "Approach",
    order: 2,
    columnRange: [4, 6],
    adversaryRole: "x",
    awareness: "y",
  },
  {
    id: "internal",
    name: "Internal",
    order: 1,
    columnRange: [1, 3],
    adversaryRole: "x",
    awareness: "y",
  },
];

const columns: MatrixColumn[] = [
  {
    id: 4,
    name: "Reconnaissance",
    phaseId: "approach",
    mappedModels: [],
    insiderCategories: [],
    techniques: [{ id: "4-a", label: "a", mitreId: null, description: "d" }],
  },
  {
    id: 1,
    name: "Accidental Disclosure",
    phaseId: "internal",
    mappedModels: [],
    insiderCategories: [],
    techniques: [{ id: "1-a", label: "a", mitreId: null, description: "d" }],
  },
];

describe("groupColumnsByPhase", () => {
  it("orders phases by order and places columns under their phase", () => {
    const groups = groupColumnsByPhase(columns, phases);
    expect(groups.map((g) => g.phase.id)).toEqual(["internal", "approach"]);
    expect(groups[0]?.columns[0]?.id).toBe(1);
    expect(groups[1]?.columns[0]?.id).toBe(4);
  });
});
