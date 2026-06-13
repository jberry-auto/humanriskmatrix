"use client";

import { Button } from "@/components/ui/Button";
import { SideSheet } from "@/components/ui/SideSheet";
import { Tag } from "@/components/ui/Tag";
import type { MatrixColumn, Phase, Technique } from "@/lib/content/schema";
import { mitreUrl } from "@/lib/matrix/mitre";

export interface FrameworkRef {
  readonly title: string;
  readonly summary: string;
}
export interface InsiderRef {
  readonly name: string;
}

interface TechniqueDetailDrawerProps {
  technique: Technique | null;
  column: MatrixColumn | null;
  phase: Phase | null;
  frameworks: Record<string, FrameworkRef>;
  insiders: Record<string, InsiderRef>;
  isSelected: boolean;
  onToggleSelect: () => void;
  onOpenChange: (isOpen: boolean) => void;
}

export function TechniqueDetailDrawer({
  technique,
  column,
  phase,
  frameworks,
  insiders,
  isSelected,
  onToggleSelect,
  onOpenChange,
}: TechniqueDetailDrawerProps) {
  const isOpen = technique !== null && column !== null && phase !== null;

  return (
    <SideSheet isOpen={isOpen} onOpenChange={onOpenChange} title={technique?.label ?? ""}>
      {technique && column && phase ? (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Tag phase={phase.id}>{phase.name}</Tag>
            <span className="text-sm text-muted">
              Column {column.id} · {column.name}
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

          <section className="flex flex-col gap-1">
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Phase context
            </h3>
            <p className="text-sm">
              <span className="text-muted">Adversary role: </span>
              {phase.adversaryRole}
            </p>
            <p className="text-sm">
              <span className="text-muted">Human awareness: </span>
              {phase.awareness}
            </p>
          </section>

          {column.mappedModels.length > 0 ? (
            <section className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                Why people do this
              </h3>
              <ul className="flex flex-col gap-2">
                {column.mappedModels.map((slug) => {
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

          {column.insiderCategories.length > 0 ? (
            <section className="flex flex-col gap-1">
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                Relevant insider categories
              </h3>
              <p className="text-sm text-muted">
                {column.insiderCategories
                  .map((slug) => insiders[slug]?.name)
                  .filter((n): n is string => Boolean(n))
                  .join(" · ")}
              </p>
            </section>
          ) : null}

          <div className="border-t border-border pt-4">
            <Button variant={isSelected ? "secondary" : "primary"} onPress={onToggleSelect}>
              {isSelected ? "Remove from heatmap" : "Add to environmental heatmap"}
            </Button>
          </div>

          <p className="text-xs text-faint">
            Described to help defenders recognize and reduce risk — not as operational instructions.
          </p>
        </div>
      ) : null}
    </SideSheet>
  );
}
