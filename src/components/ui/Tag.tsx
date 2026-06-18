import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type Degree = "unintentional" | "unaware" | "deceived" | "coerced" | "intentional";

const dotColor: Record<Degree, string> = {
  unintentional: "bg-degree-unintentional",
  unaware: "bg-degree-unaware",
  deceived: "bg-degree-deceived",
  coerced: "bg-degree-coerced",
  intentional: "bg-degree-intentional",
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
