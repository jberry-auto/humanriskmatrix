import { describe, expect, it } from "vitest";

import type { IntentDegree, MatrixCategory, Technique } from "@/lib/content/schema";
import { groupCategoriesByDegree } from "@/lib/matrix/group";

// This suite only exercises degree grouping; technique detail is irrelevant here.
function makeTechnique(id: string): Technique {
  return {
    id,
    label: "a",
    mitreId: null,
    description: "d",
    detailedDescription: "d",
    attackerBehavior: "d",
    insiderBehavior: "d",
    prevention: [
      { mode: "educate", action: "a" },
      { mode: "evaluate", action: "a" },
      { mode: "monitor", action: "a" },
      { mode: "intervene", action: "a" },
    ],
  };
}

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
    techniques: [makeTechnique("4-a")],
  },
  {
    id: 1,
    name: "Accidental Disclosure",
    degreeId: "unintentional",
    mappedModels: [],
    insiderCategories: [],
    techniques: [makeTechnique("1-a")],
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
