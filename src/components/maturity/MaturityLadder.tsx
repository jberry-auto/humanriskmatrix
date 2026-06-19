import { Heading } from "@/components/ui/Heading";
import { Tag } from "@/components/ui/Tag";
import { cn } from "@/lib/cn";
import type {
  IntentDegreeId,
  MaturityLevel,
  MaturitySegment,
  MaturitySegmentId,
} from "@/lib/content/schema";

// Literal class strings per intent degree so Tailwind v4 emits them (never interpolated). The
// level is banded by its highest (rightmost) degree.
const DEGREE_BAND: Record<IntentDegreeId, { readonly leftBorder: string; readonly wash: string }> =
  {
    unintentional: {
      leftBorder: "border-l-degree-unintentional",
      wash: "bg-degree-unintentional/[0.06]",
    },
    unaware: { leftBorder: "border-l-degree-unaware", wash: "bg-degree-unaware/[0.06]" },
    deceived: { leftBorder: "border-l-degree-deceived", wash: "bg-degree-deceived/[0.06]" },
    coerced: { leftBorder: "border-l-degree-coerced", wash: "bg-degree-coerced/[0.06]" },
    intentional: {
      leftBorder: "border-l-degree-intentional",
      wash: "bg-degree-intentional/[0.06]",
    },
  };

const SEGMENT_ORDER: readonly MaturitySegmentId[] = ["small", "mid-size", "enterprise"];

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

interface MaturityLadderProps {
  levels: readonly MaturityLevel[];
  segments: readonly MaturitySegment[];
}

export function MaturityLadder({ levels, segments }: MaturityLadderProps) {
  const segmentById = new Map(segments.map((s) => [s.id, s]));
  const ordered = [...levels].sort((a, b) => a.level - b.level);

  return (
    <ol className="flex flex-col gap-4">
      {ordered.map((level) => {
        const primaryDegree = level.degrees[level.degrees.length - 1] ?? "unintentional";
        const band = DEGREE_BAND[primaryDegree];
        const tracks = SEGMENT_ORDER.map((id) => level.tracks.find((t) => t.segment === id)).filter(
          (t): t is NonNullable<typeof t> => Boolean(t),
        );

        return (
          <li key={level.level} className="flex flex-col gap-2">
            <article
              className={cn(
                "flex flex-col gap-4 rounded-md border border-border border-l-4 p-5",
                band.leftBorder,
                band.wash,
                level.northStar && "border-dashed",
              )}
            >
              <header className="flex flex-col gap-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-mono text-xs font-semibold text-accent">
                    Level {level.level}
                  </span>
                  <Heading level={3} size="h3">
                    {level.name}
                  </Heading>
                  {level.northStar ? <Tag>North star</Tag> : null}
                </div>
                <p className="text-sm font-medium text-muted">{level.posture}</p>
              </header>

              <p className="text-sm leading-relaxed text-ink">{level.description}</p>

              <div className="flex flex-wrap gap-1.5">
                {level.modes.map((mode) => (
                  <Tag key={mode}>{titleCase(mode)}</Tag>
                ))}
                {level.degrees.map((degree) => (
                  <Tag key={degree} degree={degree}>
                    {titleCase(degree)}
                  </Tag>
                ))}
              </div>

              <dl className="grid gap-3 text-sm sm:grid-cols-3">
                <Meta term="Signals" detail={level.signals} />
                <Meta term="Counter-intelligence" detail={level.counterIntel} emphasis />
                <Meta term="Blind spot" detail={level.limitation} />
              </dl>

              <div
                className={cn("grid gap-3", tracks.length > 1 && "sm:grid-cols-2 lg:grid-cols-3")}
              >
                {tracks.map((track) => {
                  const segment = segmentById.get(track.segment);
                  // A "ceiling" only when the segment caps below the top (a real constraint with
                  // residual risk) — not when it simply reaches the top of the ladder.
                  const isCeiling = segment
                    ? level.level === segment.cap && segment.residualRisk !== null
                    : false;
                  return (
                    <div
                      key={track.segment}
                      className="flex flex-col gap-1.5 rounded-sm border border-border bg-surface p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.08em]">
                          {segment?.name ?? track.segment}
                        </span>
                        {isCeiling ? <Tag>Ceiling</Tag> : null}
                      </div>
                      <p className="text-sm text-muted">{track.approach}</p>
                      <ul className="flex list-disc flex-col gap-0.5 pl-4 text-sm text-muted">
                        {track.practices.map((practice) => (
                          <li key={practice}>{practice}</li>
                        ))}
                      </ul>
                      {isCeiling && segment?.residualRisk ? (
                        <p className="mt-1 border-t border-border pt-2 text-xs text-faint">
                          <span className="font-medium text-muted">Above the ceiling: </span>
                          {segment.residualRisk}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </article>

            {level.gate ? (
              <p className="px-5 text-sm text-muted">
                <span aria-hidden="true" className="mr-2 text-faint">
                  ↓
                </span>
                <span className="font-medium text-ink">To advance: </span>
                {level.gate}
              </p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function Meta({ term, detail, emphasis }: { term: string; detail: string; emphasis?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt
        className={cn(
          "text-xs font-semibold uppercase tracking-[0.08em]",
          emphasis ? "text-accent" : "text-muted",
        )}
      >
        {term}
      </dt>
      <dd className="leading-relaxed text-ink">{detail}</dd>
    </div>
  );
}
