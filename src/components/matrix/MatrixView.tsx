"use client";

import { useCallback, useMemo, useState } from "react";

import { Checkbox } from "@/components/ui/Checkbox";
import { HorizontalScroll } from "@/components/ui/HorizontalScroll";
import { cn } from "@/lib/cn";
import type { MatrixColumn, Phase, PhaseId, Technique } from "@/lib/content/schema";
import type { PhaseGroup } from "@/lib/matrix/group";

import { HeatmapSummary } from "./HeatmapSummary";
import { PHASE_STYLE } from "./phase-style";
import { TechniqueDetailDrawer, type FrameworkRef, type InsiderRef } from "./TechniqueDetailDrawer";
import { useHeatmap } from "./use-heatmap";

interface TechniqueContext {
  technique: Technique;
  column: MatrixColumn;
  phase: Phase;
}

interface MatrixViewProps {
  groups: PhaseGroup[];
  frameworks: Record<string, FrameworkRef>;
  insiders: Record<string, InsiderRef>;
}

function selectedInColumn(col: MatrixColumn, selected: ReadonlySet<string>): number {
  return col.techniques.filter((t) => selected.has(t.id)).length;
}

export function MatrixView({ groups, frameworks, insiders }: MatrixViewProps) {
  const { selected, toggle, clear } = useHeatmap();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [focus, setFocus] = useState(false);
  const [expanded, setExpanded] = useState<ReadonlySet<PhaseId>>(
    () => new Set(groups.map((g) => g.phase.id)),
  );

  // All 11 columns left-to-right, each tagged with its phase.
  const orderedColumns = useMemo(
    () => groups.flatMap((g) => g.columns.map((col) => ({ col, phase: g.phase }))),
    [groups],
  );

  const index = useMemo(() => {
    const map = new Map<string, TechniqueContext>();
    for (const g of groups) {
      for (const col of g.columns) {
        for (const t of col.techniques)
          map.set(t.id, { technique: t, column: col, phase: g.phase });
      }
    }
    return map;
  }, [groups]);

  const active = activeId ? (index.get(activeId) ?? null) : null;

  const togglePhase = useCallback((id: PhaseId) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const expandAll = useCallback(
    () => setExpanded(new Set(groups.map((g) => g.phase.id))),
    [groups],
  );
  const collapseAll = useCallback(() => setExpanded(new Set<PhaseId>()), []);
  const onDrawerOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) setActiveId(null);
  }, []);

  const gridStyle = { gridTemplateColumns: `repeat(${orderedColumns.length}, minmax(11rem, 1fr))` };

  return (
    <div className="flex flex-col gap-6">
      <HeatmapSummary
        groups={groups}
        selected={selected}
        focus={focus}
        onFocusChange={setFocus}
        onClear={clear}
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
      />

      <p className="-mb-2 text-sm text-muted">
        Wide matrix — scroll horizontally (or use the arrows) to see all five phases.
      </p>
      <HorizontalScroll label="the matrix">
        <div className="grid gap-px rounded-md border border-border bg-border" style={gridStyle}>
          {/* Phase headers (span their columns) */}
          {groups.map((g) => {
            const style = PHASE_STYLE[g.phase.id];
            const isExpanded = expanded.has(g.phase.id);
            const phaseSel = g.columns.reduce((n, c) => n + selectedInColumn(c, selected), 0);
            return (
              <button
                key={`p-${g.phase.id}`}
                type="button"
                onClick={() => togglePhase(g.phase.id)}
                aria-expanded={isExpanded}
                style={{ gridColumn: `span ${g.columns.length}` }}
                className="flex items-center gap-2 bg-surface px-3 py-2 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
              >
                <span
                  aria-hidden="true"
                  className={cn("h-3.5 w-1.5 shrink-0 rounded-full", style.dot)}
                />
                <span className="font-serif text-sm font-semibold">{g.phase.name}</span>
                {phaseSel > 0 ? (
                  <span className="rounded-sm border border-border px-1 text-[10px] text-muted">
                    {phaseSel}
                  </span>
                ) : null}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className={cn(
                    "ml-auto size-3.5 shrink-0 text-muted transition-transform",
                    isExpanded && "rotate-90",
                  )}
                >
                  <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            );
          })}

          {/* Column headers */}
          {orderedColumns.map(({ col }) => {
            const colSel = selectedInColumn(col, selected);
            return (
              <div key={`h-${col.id}`} className="bg-surface px-2 py-2">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-[10px] text-faint">{col.id}</span>
                  <h2 className="text-xs font-semibold leading-tight">{col.name}</h2>
                </div>
                {colSel > 0 ? (
                  <span className="mt-0.5 block text-[10px] text-muted">{colSel} selected</span>
                ) : null}
              </div>
            );
          })}

          {/* Column bodies (technique cells stacked) */}
          {orderedColumns.map(({ col, phase }) => {
            const style = PHASE_STYLE[phase.id];
            const isExpanded = expanded.has(phase.id);
            const techniques = isExpanded
              ? focus
                ? col.techniques.filter((t) => selected.has(t.id))
                : col.techniques
              : [];
            return (
              <div key={`b-${col.id}`} className="bg-surface p-1">
                {!isExpanded ? (
                  <p className="px-1 py-1 text-[10px] text-faint">{col.techniques.length} hidden</p>
                ) : (
                  <ul className="flex flex-col gap-0.5">
                    {techniques.map((t) => {
                      const isSel = selected.has(t.id);
                      return (
                        <li
                          key={t.id}
                          className={cn(
                            "flex items-start gap-1.5 rounded-sm border-l-2 px-1.5 py-1",
                            isSel
                              ? `${style.selBorder} ${style.selBg}`
                              : "border-transparent hover:bg-bg",
                          )}
                        >
                          <Checkbox
                            isSelected={isSel}
                            onChange={() => toggle(t.id)}
                            aria-label={
                              isSel ? `Remove ${t.label} from heatmap` : `Add ${t.label} to heatmap`
                            }
                            className="mt-0.5"
                          />
                          <button
                            type="button"
                            onClick={() => setActiveId(t.id)}
                            className="flex-1 rounded-sm text-left text-xs leading-snug hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                          >
                            {t.label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </HorizontalScroll>

      <TechniqueDetailDrawer
        technique={active?.technique ?? null}
        column={active?.column ?? null}
        phase={active?.phase ?? null}
        frameworks={frameworks}
        insiders={insiders}
        isSelected={active ? selected.has(active.technique.id) : false}
        onToggleSelect={() => {
          if (active) toggle(active.technique.id);
        }}
        onOpenChange={onDrawerOpenChange}
      />
    </div>
  );
}
