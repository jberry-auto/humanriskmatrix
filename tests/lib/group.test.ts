import { describe, expect, it } from "vitest";

import type { IntentDegree, MatrixCategory } from "@/lib/content/schema";
import { groupCategoriesByDegree } from "@/lib/matrix/group";

const degrees: IntentDegree[] = [
  {
    id: "approach",
    name: "Approach",
    order: 2,
    categoryRange: [4, 6],
    adversaryRole: "x",
    awareness: "y",
  },
  {
    id: "internal",
    name: "Internal",
    order: 1,
    categoryRange: [1, 3],
    adversaryRole: "x",
    awareness: "y",
  },
];

const categories: MatrixCategory[] = [
  {
    id: 4,
    name: "Reconnaissance",
    degreeId: "approach",
    mappedModels: [],
    insiderCategories: [],
    techniques: [{ id: "4-a", label: "a", mitreId: null, description: "d" }],
  },
  {
    id: 1,
    name: "Accidental Disclosure",
    degreeId: "internal",
    mappedModels: [],
    insiderCategories: [],
    techniques: [{ id: "1-a", label: "a", mitreId: null, description: "d" }],
  },
];

describe("groupCategoriesByDegree", () => {
  it("orders degrees by order and places categories under their degree", () => {
    const groups = groupCategoriesByDegree(categories, degrees);
    expect(groups.map((g) => g.degree.id)).toEqual(["internal", "approach"]);
    expect(groups[0]?.categories[0]?.id).toBe(1);
    expect(groups[1]?.categories[0]?.id).toBe(4);
  });
});
