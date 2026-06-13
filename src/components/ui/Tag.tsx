import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type Degree = "internal" | "approach" | "deception" | "imposition" | "alignment";

const dotColor: Record<Degree, string> = {
  internal: "bg-degree-internal",
  approach: "bg-degree-approach",
  deception: "bg-degree-deception",
  imposition: "bg-degree-imposition",
  alignment: "bg-degree-alignment",
};

interface TagProps {
  /** Optional intent degree — adds a color dot. The label text always carries the meaning. */
  degree?: Degree;
  className?: string;
  children: ReactNode;
}

/** A small label. When given a degree, shows a color dot AND the label (never color alone). */
export function Tag({ degree, className, children }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border border-border bg-surface px-2 py-0.5 text-xs font-medium text-ink",
        className,
      )}
    >
      {degree ? (
        <span aria-hidden="true" className={cn("size-2 rounded-full", dotColor[degree])} />
      ) : null}
      {children}
    </span>
  );
}
