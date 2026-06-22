import { Heading } from "@/components/ui/Heading";
import { Tag } from "@/components/ui/Tag";
import { cn } from "@/lib/cn";
import type { MaturityLevel, MaturitySegment, MaturitySegmentId } from "@/lib/content/schema";

import { PhaseIcon } from "./PhaseIcon";

// Maturity ramp, orange (low) → green (high). Literal class strings so Tailwind v4 emits them.
const MATURITY_BG: Record<number, string> = {
  1: "bg-maturity-1",
  2: "bg-maturity-2",
  3: "bg-maturity-3",
  4: "bg-maturity-4",
  5: "bg-maturity-5",
};

const SEGMENT_ORDER: readonly MaturitySegmentId[] = ["small", "mid-size", "enterprise"];

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

interface MaturityTimelineProps {
  levels: readonly MaturityLevel[];
  segments: readonly MaturitySegment[];
}

export function MaturityTimeline({ levels, segments }: MaturityTimelineProps) {
  const segmentById = new Map(segments.map((s) => [s.id, s]));
  const ordered = [...levels].sort((a, b) => a.level - b.level);

  return (
    <ol className="flex flex-col">
      {ordered.map((level, index) => {
        const isLast = index === ordered.length - 1;
        const tracks = SEGMENT_ORDER.map((id) => level.tracks.find((t) => t.segment === id)).filter(
          (t): t is NonNullable<typeof t> => Boolean(t),
        );

        return (
          <li
            key={level.level}
            className="grid grid-cols-[2.25rem_1fr] gap-x-4 sm:grid-cols-[2.75rem_1fr]"
          >
            <div className="flex flex-col items-center">
              <span
                aria-label={`Level ${level.level}`}
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full text-white shadow-sm",
                  MATURITY_BG[level.level] ?? "bg-maturity-1",
                )}
              >
                <PhaseIcon level={level.level} className="size-5" />
              </span>
              {!isLast ? <span aria-hidden="true" className="w-px flex-1 bg-border" /> : null}
            </div>

            <div className={cn(isLast ? "pb-2" : "pb-10")}>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-mono text-xs font-semibold text-accent">
                  Level {level.level}
                </span>
                <Heading level={3} size="h3">
                  {level.name}
                </Heading>
                {level.northStar ? <Tag>North star</Tag> : null}
              </div>
              <p className="mt-1 text-sm font-medium text-muted">{level.posture}</p>

              <div className="mt-4 grid gap-x-8 gap-y-4 md:grid-cols-2">
                <div className="flex flex-col gap-3 text-sm">
                  <p className="leading-relaxed text-ink">{level.description}</p>
                  <dl className="flex flex-col gap-1 text-xs">
                    <MetaLine term="Focus" detail={level.modes.map(titleCase).join(", ")} />
                    <MetaLine term="Signals" detail={level.signals} />
                    <MetaLine term="Tooling" detail={level.tooling} />
                    {level.counterIntel ? (
                      <MetaLine term="Counter-intel" detail={level.counterIntel} />
                    ) : null}
                    <MetaLine term="Blind spot" detail={level.limitation} />
                  </dl>
                </div>

                <div className="flex flex-col gap-2">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.08em] text-faint">
                    By size
                  </h4>
                  <dl className="flex flex-col gap-2 text-sm">
                    {tracks.map((track) => {
                      const segment = segmentById.get(track.segment);
                      const isCeiling = segment
                        ? level.level === segment.cap && segment.residualRisk !== null
                        : false;
                      return (
                        <div key={track.segment} className="flex flex-col">
                          <dt className="font-medium text-ink">
                            {segment?.name ?? track.segment}
                            {isCeiling ? (
                              <span className="ml-1.5 text-xs font-normal text-faint">
                                (ceiling)
                              </span>
                            ) : null}
                          </dt>
                          <dd className="text-muted">{track.approach}</dd>
                        </div>
                      );
                    })}
                  </dl>
                </div>
              </div>

              {level.gate ? (
                <p className="mt-4 text-sm">
                  <span className="font-medium text-ink">Next. </span>
                  <span className="text-muted">{level.gate}</span>
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function MetaLine({ term, detail }: { term: string; detail: string }) {
  return (
    <div className="flex gap-1.5">
      <dt className="shrink-0 font-semibold text-faint">{term}:</dt>
      <dd className="text-muted">{detail}</dd>
    </div>
  );
}
