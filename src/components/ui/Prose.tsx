import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface ProseProps {
  className?: string;
  children: ReactNode;
}

/** Long-form text wrapper (e.g. MDX). Measured line length, generous rhythm. */
export function Prose({ className, children }: ProseProps) {
  return (
    <div
      className={cn(
        "max-w-[68ch] leading-relaxed text-ink",
        "[&_p]:mt-4 [&_h2]:mt-10 [&_h3]:mt-6 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1",
        "[&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2",
        className,
      )}
    >
      {children}
    </div>
  );
}
