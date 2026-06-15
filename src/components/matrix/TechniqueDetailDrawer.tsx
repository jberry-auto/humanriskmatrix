"use client";

import type { ReactNode } from "react";

import { SideSheet } from "@/components/ui/SideSheet";
import { Tag } from "@/components/ui/Tag";
import {
  COUNTERMEASURE_MODES,
  type CountermeasureMode,
  type IntentDegree,
  type MatrixCategory,
  type Technique,
} from "@/lib/content/schema";
import { cn } from "@/lib/cn";
import { mitreUrl } from "@/lib/matrix/mitre";
import { HIGHLIGHT_COLORS, type HighlightColor } from "@/lib/matrix/share";

import { HIGHLIGHT_STYLE } from "./highlight-style";

export interface FrameworkRef {
  readonly title: string;
  readonly summary: string;
}
export interface InsiderRef {
  readonly name: string;
}

const MODE_LABEL: Record<CountermeasureMode, string> = {
  educate: "Educate",
  evaluate: "Evaluate",
  monitor: "Monitor",
  intervene: "Intervene",
};

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-ink">{title}</h3>
      {children}
    </section>
  );
}

interface HighlightControlProps {
  color: HighlightColor | null;
  onSetColor: (color: HighlightColor | null) => void;
}

function HighlightControl({ color, onSetColor }: HighlightControlProps) {
  return (
    <div role="group" aria-label="Highlight" className="flex flex-wrap gap-1.5">
      <button
        type="button"
        aria-pressed={color === null}
        onClick={() => onSetColor(null)}
        className={cn(
          "rounded-sm border px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          color === null ? "border-ink font-semibold text-ink" : "border-border text-muted",
        )}
      >
        None
      </button>
      {HIGHLIGHT_COLORS.map((c) => {
        const style = HIGHLIGHT_STYLE[c];
        const isActive = color === c;
        return (
          <button
            key={c}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSetColor(c)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-sm border px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              isActive
                ? `${style.border} ${style.bg} font-semibold text-ink`
                : "border-border text-muted",
            )}
          >
            <span aria-hidden="true" className={cn("size-2.5 rounded-full", style.dot)} />
            {style.label}
          </button>
        );
      })}
    </div>
  );
}

interface TechniqueDetailDrawerProps {
  technique: Technique | null;
  category: MatrixCategory | null;
  degree: IntentDegree | null;
  frameworks: Record<string, FrameworkRef>;
  insiders: Record<string, InsiderRef>;
  color: HighlightColor | null;
  onSetColor: (color: HighlightColor | null) => void;
  onOpenChange: (isOpen: boolean) => void;
}

export function TechniqueDetailDrawer({
  technique,
  category,
  degree,
  frameworks,
  insiders,
  color,
  onSetColor,
  onOpenChange,
}: TechniqueDetailDrawerProps) {
  const isOpen = technique !== null && category !== null && degree !== null;

  return (
    <SideSheet isOpen={isOpen} onOpenChange={onOpenChange} title={technique?.label ?? ""}>
      {technique && category && degree ? (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Tag degree={degree.id}>{degree.name}</Tag>
            <span className="text-sm text-muted">
              Category {category.id} · {category.name}
            </span>
          </div>

          <p className="leading-relaxed text-ink">{technique.description}</p>

          {technique.mitreId ? (
            <p className="text-sm">
              <span className="text-muted">{"MITRE ATT&CK: "}</span>
              <a
                href={mitreUrl(technique.mitreId)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-accent underline underline-offset-2"
              >
                {technique.mitreId}
              </a>
            </p>
          ) : null}

          <DetailSection title="Overview">
            <p className="text-sm leading-relaxed text-ink">{technique.detailedDescription}</p>
          </DetailSection>

          <DetailSection title="How an adversary operates">
            <p className="text-sm leading-relaxed text-ink">{technique.attackerBehavior}</p>
          </DetailSection>

          <DetailSection title="How the insider acts">
            <p className="text-sm leading-relaxed text-ink">{technique.insiderBehavior}</p>
          </DetailSection>

          <DetailSection title="Countermeasures">
            <div className="flex flex-col gap-3">
              {COUNTERMEASURE_MODES.map((mode) => {
                const actions = technique.prevention.filter((c) => c.mode === mode);
                if (actions.length === 0) return null;
                return (
                  <div key={mode} className="flex flex-col gap-1">
                    <h4 className="text-xs font-semibold text-ink">{MODE_LABEL[mode]}</h4>
                    <ul className="flex flex-col gap-1">
                      {actions.map((c) => (
                        <li key={c.action} className="text-sm leading-relaxed text-muted">
                          {c.action}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </DetailSection>

          <section className="flex flex-col gap-1 border-t border-border pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Intent context
            </h3>
            <p className="text-sm">
              <span className="text-muted">Adversary role: </span>
              {degree.adversaryRole}
            </p>
            <p className="text-sm">
              <span className="text-muted">Human awareness: </span>
              {degree.awareness}
            </p>
          </section>

          {category.mappedModels.length > 0 ? (
            <section className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                Why people do this
              </h3>
              <ul className="flex flex-col gap-2">
                {category.mappedModels.map((slug) => {
                  const fw = frameworks[slug];
                  return fw ? (
                    <li key={slug} className="text-sm">
                      <span className="font-medium">{fw.title}</span>
                      <span className="text-muted"> — {fw.summary}</span>
                    </li>
                  ) : null;
                })}
              </ul>
            </section>
          ) : null}

          {category.insiderCategories.length > 0 ? (
            <section className="flex flex-col gap-1">
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                Relevant insider categories
              </h3>
              <p className="text-sm text-muted">
                {category.insiderCategories
                  .map((slug) => insiders[slug]?.name)
                  .filter((n): n is string => Boolean(n))
                  .join(" · ")}
              </p>
            </section>
          ) : null}

          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Highlight on heatmap
            </h3>
            <HighlightControl color={color} onSetColor={onSetColor} />
          </div>

          <p className="text-xs text-faint">
            Described to help defenders recognize and reduce risk — not as operational instructions.
          </p>
        </div>
      ) : null}
    </SideSheet>
  );
}
