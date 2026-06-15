"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { cn } from "@/lib/cn";
import type { DegreeGroup } from "@/lib/matrix/group";
import { encodeHeatmap, HIGHLIGHT_COLORS, type HeatmapSelection } from "@/lib/matrix/share";

import { DEGREE_STYLE } from "./degree-style";
import { HIGHLIGHT_STYLE } from "./highlight-style";

interface HeatmapSummaryProps {
  groups: readonly DegreeGroup[];
  selection: HeatmapSelection;
  allIds: readonly string[];
  focus: boolean;
  onFocusChange: (focus: boolean) => void;
  onClear: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

function degreeCount(group: DegreeGroup, selection: HeatmapSelection): number {
  let n = 0;
  for (const cat of group.categories) {
    for (const t of cat.techniques) if (selection.has(t.id)) n += 1;
  }
  return n;
}

function buildShareUrl(selection: HeatmapSelection, allIds: readonly string[]): string {
  const encoded = encodeHeatmap(selection, allIds);
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#h=${encoded}`;
}

export function HeatmapSummary({
  groups,
  selection,
  allIds,
  focus,
  onFocusChange,
  onClear,
  onExpandAll,
  onCollapseAll,
}: HeatmapSummaryProps) {
  const total = selection.size;
  const [copied, setCopied] = useState(false);

  const colorCounts = HIGHLIGHT_COLORS.map((color) => ({
    color,
    style: HIGHLIGHT_STYLE[color],
    count: [...selection.values()].filter((c) => c === color).length,
  }));

  const onShare = useCallback(() => {
    const url = buildShareUrl(selection, allIds);
    // Reflect the map in the address bar so the URL is shareable even without clipboard access.
    window.location.hash = url.slice(url.indexOf("#") + 1);
    void navigator.clipboard?.writeText(url).catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [selection, allIds]);

  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border bg-bg/90 py-3 backdrop-blur">
      <span className="text-sm font-medium">
        {total} {total === 1 ? "technique" : "techniques"} selected
      </span>

      <div className="flex flex-wrap gap-1.5">
        {colorCounts.map(({ color, style, count }) => (
          <span
            key={color}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-sm border border-border px-2 py-0.5 text-xs",
              count === 0 && "text-muted",
            )}
          >
            <span aria-hidden="true" className={cn("size-2 rounded-full", style.dot)} />
            {style.label} {count}
          </span>
        ))}
      </div>

      <div className="hidden flex-wrap gap-1.5 lg:flex">
        {groups.map((g) => {
          const n = degreeCount(g, selection);
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
        <Button size="sm" variant="primary" onPress={onShare} isDisabled={total === 0}>
          {copied ? "Link copied" : "Share"}
        </Button>
        <Button size="sm" variant="secondary" onPress={onClear} isDisabled={total === 0}>
          Clear
        </Button>
      </div>
    </div>
  );
}
