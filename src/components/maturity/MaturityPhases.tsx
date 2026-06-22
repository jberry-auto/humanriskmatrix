import { cn } from "@/lib/cn";
import type { MaturityLevel } from "@/lib/content/schema";

import { PhaseIcon } from "./PhaseIcon";

// Maturity ramp, orange (low) → green (high). Literal class strings so Tailwind v4 emits them.
const MATURITY_BG: Record<number, string> = {
  1: "bg-maturity-1",
  2: "bg-maturity-2",
  3: "bg-maturity-3",
  4: "bg-maturity-4",
  5: "bg-maturity-5",
};

interface MaturityPhasesProps {
  levels: readonly MaturityLevel[];
}

export function MaturityPhases({ levels }: MaturityPhasesProps) {
  const ordered = [...levels].sort((a, b) => a.level - b.level);

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute inset-x-[10%] top-5 h-px bg-border-strong sm:top-6"
      />
      <ol className="relative grid grid-cols-5 gap-2">
        {ordered.map((level) => (
          <li key={level.level} className="flex flex-col items-center gap-2 text-center">
            <span
              className={cn(
                "flex size-10 items-center justify-center rounded-full text-white shadow-sm sm:size-12",
                MATURITY_BG[level.level] ?? "bg-maturity-1",
              )}
            >
              <PhaseIcon level={level.level} className="size-5 sm:size-6" />
            </span>
            <span className="font-mono text-xs font-semibold text-accent">L{level.level}</span>
            <span className="text-[11px] font-medium leading-tight text-ink sm:text-xs">
              {level.name}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
