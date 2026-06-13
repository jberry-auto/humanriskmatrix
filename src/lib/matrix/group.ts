import type { IntentDegree, MatrixCategory } from "@/lib/content/schema";

export interface DegreeGroup {
  readonly degree: IntentDegree;
  readonly categories: readonly MatrixCategory[];
}

/** Group categories under their intent degree, ordered by degree order then category id. */
export function groupCategoriesByDegree(
  categories: readonly MatrixCategory[],
  degrees: readonly IntentDegree[],
): DegreeGroup[] {
  return [...degrees]
    .sort((a, b) => a.order - b.order)
    .map((degree) => ({
      degree,
      categories: categories.filter((c) => c.degreeId === degree.id).sort((a, b) => a.id - b.id),
    }));
}
