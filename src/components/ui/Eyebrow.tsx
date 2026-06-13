import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface EyebrowProps {
  className?: string;
  children: ReactNode;
}

/** Small-caps label that sits above a heading. */
export function Eyebrow({ className, children }: EyebrowProps) {
  return (
    <p className={cn("text-xs font-semibold uppercase tracking-[0.12em] text-muted", className)}>
      {children}
    </p>
  );
}
