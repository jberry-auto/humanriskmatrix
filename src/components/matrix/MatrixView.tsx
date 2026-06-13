"use client";

import { useCallback, useMemo, useState } from "react";

import { Checkbox } from "@/components/ui/Checkbox";
import { HorizontalScroll } from "@/components/ui/HorizontalScroll";
import { cn } from "@/lib/cn";
import type { IntentDegree, IntentDegreeId, MatrixCategory, Technique } from "@/lib/content/schema";
import type { DegreeGroup } from "@/lib/matrix/group";

import { DEGREE_STYLE } from "./degree-style";
import { HeatmapSummary } from "./HeatmapSummary";
import { TechniqueDetailDrawer, type FrameworkRef, type InsiderRef } from "./TechniqueDetailDrawer";
import { useHeatmap } from "./use-heatmap";

interface TechniqueContext {
  technique: Technique;
  category: MatrixCategory;
  degree: IntentDegree;
}

interface MatrixViewProps {
  groups: DegreeGroup[];
  frameworks: Record<string, FrameworkRef>;
  insiders: Record<string, InsiderRef>;
}

function selectedInCategory(cat: MatrixCategory, selected: ReadonlySet<string>): number {
  return cat.techniques.filter((t) => selected.has(t.id)).length;
}

export function MatrixView({ groups, frameworks, insiders }: MatrixViewProps) {
  const { selected, toggle, clear } = useHeatmap();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [focus, setFocus] = useState(false);
  const [expanded, setExpanded] = useState<ReadonlySet<IntentDegreeId>>(
    () => new Set(groups.map((g) => g.degree.id)),
  );

  // All 11 categories left-to-right, each tagged with its intent degree.
  const orderedCategories = useMemo(
    () => groups.flatMap((g) => g.categories.map((cat) => ({ cat, degree: g.degree }))),
    [groups],
  );

  const index = useMemo(() => {
    const map = new Map<string, TechniqueContext>();
    for (const g of groups) {
      for (const cat of g.categories) {
        for (const t of cat.techniques)
          map.set(t.id, { technique: t, category: cat, degree: g.degree });
      }
    }
    return map;
  }, [groups]);

  const active = activeId ? (index.get(activeId) ?? null) : null;

  const toggleDegree = useCallback((id: IntentDegreeId) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const expandAll = useCallback(
    () => setExpanded(new Set(groups.map((g) => g.degree.id))),
    [groups],
  );
  const collapseAll = useCallback(() => setExpanded(new Set<IntentDegreeId>()), []);
  const onDrawerOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) setActiveId(null);
  }, []);

  const gridStyle = {
    gridTemplateColumns: `repeat(${orderedCategories.length}, minmax(11rem, 1fr))`,
  };

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
        Wide matrix — scroll horizontally (or use the arrows) to move along the spectrum of intent.
      </p>
      <HorizontalScroll label="the matrix">
        <div className="grid gap-px rounded-md border border-border bg-border" style={gridStyle}>
          {/* Degree headers (span their categories) */}
          {groups.map((g) => {
            const style = DEGREE_STYLE[g.degree.id];
            const isExpanded = expanded.has(g.degree.id);
            const degreeSel = g.categories.reduce((n, c) => n + selectedInCategory(c, selected), 0);
            return (
              <button
                key={`d-${g.degree.id}`}
                type="button"
                onClick={() => toggleDegree(g.degree.id)}
                aria-expanded={isExpanded}
                style={{ gridColumn: `span ${g.categories.length}` }}
                className="flex items-center gap-2 bg-surface px-3 py-2 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
              >
                <span
                  aria-hidden="true"
                  className={cn("h-3.5 w-1.5 shrink-0 rounded-full", style.dot)}
                />
                <span className="font-serif text-sm font-semibold">{g.degree.name}</span>
                {degreeSel > 0 ? (
                  <span className="rounded-sm border border-border px-1 text-[10px] text-muted">
                    {degreeSel}
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

          {/* Category headers */}
          {orderedCategories.map(({ cat }) => {
            const catSel = selectedInCategory(cat, selected);
            return (
              <div key={`h-${cat.id}`} className="bg-surface px-2 py-2">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-[10px] text-faint">{cat.id}</span>
                  <h2 className="text-xs font-semibold leading-tight">{cat.name}</h2>
                </div>
                {catSel > 0 ? (
                  <span className="mt-0.5 block text-[10px] text-muted">{catSel} selected</span>
                ) : null}
              </div>
            );
          })}

          {/* Category bodies (technique cells stacked) */}
          {orderedCategories.map(({ cat, degree }) => {
            const style = DEGREE_STYLE[degree.id];
            const isExpanded = expanded.has(degree.id);
            const techniques = isExpanded
              ? focus
                ? cat.techniques.filter((t) => selected.has(t.id))
                : cat.techniques
              : [];
            return (
              <div key={`b-${cat.id}`} className="bg-surface p-1">
                {!isExpanded ? (
                  <p className="px-1 py-1 text-[10px] text-faint">{cat.techniques.length} hidden</p>
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
        category={active?.category ?? null}
        degree={active?.degree ?? null}
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
