"use client";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { cn } from "@/lib/cn";
import type { DegreeGroup } from "@/lib/matrix/group";

import { DEGREE_STYLE } from "./degree-style";

interface HeatmapSummaryProps {
  groups: readonly DegreeGroup[];
  selected: ReadonlySet<string>;
  focus: boolean;
  onFocusChange: (focus: boolean) => void;
  onClear: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

function degreeCount(group: DegreeGroup, selected: ReadonlySet<string>): number {
  let n = 0;
  for (const cat of group.categories) {
    for (const t of cat.techniques) if (selected.has(t.id)) n += 1;
  }
  return n;
}

export function HeatmapSummary({
  groups,
  selected,
  focus,
  onFocusChange,
  onClear,
  onExpandAll,
  onCollapseAll,
}: HeatmapSummaryProps) {
  const total = selected.size;
  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border bg-bg/90 py-3 backdrop-blur">
      <span className="text-sm font-medium">
        {total} {total === 1 ? "technique" : "techniques"} selected
      </span>
      <div className="flex flex-wrap gap-1.5">
        {groups.map((g) => {
          const n = degreeCount(g, selected);
          return (
            <span
              key={g.degree.id}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-sm border border-border px-2 py-0.5 text-xs",
                n === 0 && "text-muted",
              )}
            >
              <span
                aria-hidden="true"
                className={cn("size-2 rounded-full", DEGREE_STYLE[g.degree.id].dot)}
              />
              {g.degree.name} {n}
            </span>
          );
        })}
      </div>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <Checkbox isSelected={focus} onChange={onFocusChange} isDisabled={total === 0}>
          Focus
        </Checkbox>
        <Button size="sm" variant="ghost" onPress={onExpandAll}>
          Expand all
        </Button>
        <Button size="sm" variant="ghost" onPress={onCollapseAll}>
          Collapse all
        </Button>
        <Button size="sm" variant="secondary" onPress={onClear} isDisabled={total === 0}>
          Clear
        </Button>
      </div>
    </div>
  );
}
