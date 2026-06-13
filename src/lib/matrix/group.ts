import type { MatrixColumn, Phase } from "@/lib/content/schema";

export interface PhaseGroup {
  readonly phase: Phase;
  readonly columns: readonly MatrixColumn[];
}

/** Group columns under their phase, ordered by phase order then column id. */
export function groupColumnsByPhase(
  columns: readonly MatrixColumn[],
  phases: readonly Phase[],
): PhaseGroup[] {
  return [...phases]
    .sort((a, b) => a.order - b.order)
    .map((phase) => ({
      phase,
      columns: columns.filter((c) => c.phaseId === phase.id).sort((a, b) => a.id - b.id),
    }));
}
