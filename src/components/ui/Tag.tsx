import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type Phase = "internal" | "approach" | "deception" | "imposition" | "alignment";

const dotColor: Record<Phase, string> = {
  internal: "bg-phase-internal",
  approach: "bg-phase-approach",
  deception: "bg-phase-deception",
  imposition: "bg-phase-imposition",
  alignment: "bg-phase-alignment",
};

interface TagProps {
  /** Optional phase — adds a color dot. The label text always carries the meaning. */
  phase?: Phase;
  className?: string;
  children: ReactNode;
}

/** A small label. When given a phase, shows a color dot AND the label (never color alone). */
export function Tag({ phase, className, children }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border border-border bg-surface px-2 py-0.5 text-xs font-medium text-ink",
        className,
      )}
    >
      {phase ? (
        <span aria-hidden="true" className={cn("size-2 rounded-full", dotColor[phase])} />
      ) : null}
      {children}
    </span>
  );
}
