import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type Level = 1 | 2 | 3 | 4;
type Size = "display" | "h1" | "h2" | "h3" | "h4";

const tag = { 1: "h1", 2: "h2", 3: "h3", 4: "h4" } as const;

const sizeClass: Record<Size, string> = {
  display: "text-4xl sm:text-5xl",
  h1: "text-3xl sm:text-4xl",
  h2: "text-2xl",
  h3: "text-xl",
  h4: "text-lg",
};

interface HeadingProps {
  /** Semantic heading level (h1–h4). */
  level?: Level;
  /** Visual size, decoupled from level. Defaults to match the level. */
  size?: Size;
  id?: string;
  className?: string;
  children: ReactNode;
}

export function Heading({ level = 2, size, id, className, children }: HeadingProps) {
  const Tag = tag[level];
  const visual = size ?? tag[level];
  return (
    <Tag id={id} className={cn(sizeClass[visual], className)}>
      {children}
    </Tag>
  );
}
