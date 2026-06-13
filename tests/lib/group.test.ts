import { describe, expect, it } from "vitest";

import type { IntentDegree, MatrixCategory } from "@/lib/content/schema";
import { groupCategoriesByDegree } from "@/lib/matrix/group";

const degrees: IntentDegree[] = [
  {
    id: "unaware",
    name: "Unaware",
    order: 2,
    categoryRange: [4, 6],
    adversaryRole: "x",
    awareness: "y",
  },
  {
    id: "unintentional",
    name: "Unintentional",
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
    degreeId: "unaware",
    mappedModels: [],
    insiderCategories: [],
    techniques: [{ id: "4-a", label: "a", mitreId: null, description: "d" }],
  },
  {
    id: 1,
    name: "Accidental Disclosure",
    degreeId: "unintentional",
    mappedModels: [],
    insiderCategories: [],
    techniques: [{ id: "1-a", label: "a", mitreId: null, description: "d" }],
  },
];

describe("groupCategoriesByDegree", () => {
  it("orders degrees by order and places categories under their degree", () => {
    const groups = groupCategoriesByDegree(categories, degrees);
    expect(groups.map((g) => g.degree.id)).toEqual(["unintentional", "unaware"]);
    expect(groups[0]?.categories[0]?.id).toBe(1);
    expect(groups[1]?.categories[0]?.id).toBe(4);
  });
});
