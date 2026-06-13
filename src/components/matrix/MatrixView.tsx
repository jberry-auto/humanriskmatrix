"use client";

import { useCallback, useMemo, useState } from "react";

import { Checkbox } from "@/components/ui/Checkbox";
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

      {groups.map((g) => {
        const style = PHASE_STYLE[g.phase.id];
        const phaseSel = g.columns.reduce((n, c) => n + selectedInColumn(c, selected), 0);
        if (focus && phaseSel === 0) return null;
        const isExpanded = expanded.has(g.phase.id);
        const regionId = `phase-${g.phase.id}`;
        return (
          <section key={g.phase.id} className="rounded-md border border-border">
            <button
              type="button"
              onClick={() => togglePhase(g.phase.id)}
              aria-expanded={isExpanded}
              aria-controls={regionId}
              className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <span aria-hidden="true" className={cn("h-5 w-1.5 rounded-full", style.dot)} />
              <span className="font-serif text-lg font-semibold">{g.phase.name}</span>
              <span className="text-sm text-muted">
                Columns {g.phase.columnRange[0]}–{g.phase.columnRange[1]}
              </span>
              {phaseSel > 0 ? (
                <span className="rounded-sm border border-border px-1.5 py-0.5 text-xs text-muted">
                  {phaseSel} selected
                </span>
              ) : null}
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className={cn(
                  "ml-auto size-4 text-muted transition-transform",
                  isExpanded && "rotate-90",
                )}
              >
                <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {isExpanded ? (
              <div
                id={regionId}
                className="grid gap-4 border-t border-border p-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {g.columns.map((col) => {
                  const techniques = focus
                    ? col.techniques.filter((t) => selected.has(t.id))
                    : col.techniques;
                  if (focus && techniques.length === 0) return null;
                  const colSel = selectedInColumn(col, selected);
                  return (
                    <div key={col.id} className="flex flex-col gap-2">
                      <div className="flex items-baseline gap-2 border-b border-border pb-1">
                        <span className="font-mono text-xs text-faint">{col.id}</span>
                        <h2 className="text-sm font-semibold">{col.name}</h2>
                        {colSel > 0 ? (
                          <span className="ml-auto text-xs text-muted">{colSel}</span>
                        ) : null}
                      </div>
                      <ul className="flex flex-col">
                        {techniques.map((t) => {
                          const isSel = selected.has(t.id);
                          return (
                            <li
                              key={t.id}
                              className={cn(
                                "flex items-start gap-2 rounded-sm border-l-2 py-1 pl-2 pr-1",
                                isSel ? `${style.selBorder} ${style.selBg}` : "border-transparent",
                              )}
                            >
                              <Checkbox
                                isSelected={isSel}
                                onChange={() => toggle(t.id)}
                                aria-label={
                                  isSel
                                    ? `Remove ${t.label} from heatmap`
                                    : `Add ${t.label} to heatmap`
                                }
                                className="mt-1"
                              />
                              <button
                                type="button"
                                onClick={() => setActiveId(t.id)}
                                className="flex-1 rounded-sm text-left text-sm hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                              >
                                {t.label}
                              </button>
                              {t.mitreId ? (
                                <span className="mt-0.5 shrink-0 font-mono text-[10px] text-faint">
                                  {t.mitreId}
                                </span>
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </section>
        );
      })}

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
