"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import type {
  LevelTrack,
  MaturityLevel,
  MaturitySegment,
  MaturitySegmentId,
} from "@/lib/content/schema";
import { achievedLevel, nextStep } from "@/lib/maturity/assess";

const SEGMENT_ORDER: readonly MaturitySegmentId[] = ["small", "mid-size", "enterprise"];

interface MaturityAssessmentProps {
  segments: readonly MaturitySegment[];
  levels: readonly MaturityLevel[];
}

export function MaturityAssessment({ segments, levels }: MaturityAssessmentProps) {
  const ordered = useMemo(
    () => [...segments].sort((a, b) => SEGMENT_ORDER.indexOf(a.id) - SEGMENT_ORDER.indexOf(b.id)),
    [segments],
  );
  const [segmentId, setSegmentId] = useState<MaturitySegmentId>(ordered[0]?.id ?? "mid-size");
  // level number -> true (yes) / false (no). Absent = unanswered.
  const [answers, setAnswers] = useState<ReadonlyMap<number, boolean>>(new Map());

  const segment = ordered.find((s) => s.id === segmentId) ?? ordered[0];

  const questions = useMemo(() => {
    if (!segment) return [];
    return levels
      .filter((l) => l.level <= segment.cap)
      .sort((a, b) => a.level - b.level)
      .map((level) => ({ level, track: level.tracks.find((t) => t.segment === segment.id) }))
      .filter((x): x is { level: MaturityLevel; track: LevelTrack } => Boolean(x.track));
  }, [levels, segment]);

  if (!segment) return null;

  const isLevelMet = (level: number) => answers.get(level) === true;
  const achieved = achievedLevel(segment, isLevelMet);
  const step = nextStep(segment, levels, isLevelMet);
  const achievedName = levels.find((l) => l.level === achieved)?.name;

  const answer = (level: number, value: boolean) =>
    setAnswers((prev) => {
      const next = new Map(prev);
      next.set(level, value);
      return next;
    });
  const pickSegment = (id: MaturitySegmentId) => {
    setSegmentId(id);
    setAnswers(new Map());
  };

  return (
    <section
      aria-labelledby="assess-heading"
      className="rounded-lg border border-border bg-surface p-6 shadow-sm sm:p-8"
    >
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
        Self-assessment
      </span>
      <Heading level={2} size="h2" id="assess-heading" className="mt-1">
        Where are you today?
      </Heading>
      <p className="mt-2 max-w-2xl text-muted">
        Pick your organization size and answer the questions. We&rsquo;ll show your level today and
        what to do next.
      </p>

      <div className="mt-5 flex flex-col gap-2">
        <span className="text-sm font-medium">Organization size</span>
        <div role="group" aria-label="Organization size" className="flex flex-wrap gap-2">
          {ordered.map((s) => (
            <Button
              key={s.id}
              variant={s.id === segmentId ? "primary" : "secondary"}
              size="sm"
              onPress={() => pickSegment(s.id)}
            >
              {s.name}
            </Button>
          ))}
        </div>
      </div>

      <ol className="mt-6 flex flex-col divide-y divide-border border-y border-border">
        {questions.map(({ level, track }, i) => {
          const current = answers.get(level.level);
          return (
            <li
              key={level.level}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
            >
              <p className="flex gap-3 text-sm text-ink">
                <span className="font-mono text-xs font-semibold text-faint">{i + 1}</span>
                {track.question}
              </p>
              <div
                role="group"
                aria-label={`Answer for question ${i + 1}`}
                className="flex shrink-0 gap-2"
              >
                <Button
                  variant={current === true ? "primary" : "secondary"}
                  size="sm"
                  onPress={() => answer(level.level, true)}
                >
                  Yes
                </Button>
                <Button
                  variant={current === false ? "primary" : "secondary"}
                  size="sm"
                  onPress={() => answer(level.level, false)}
                >
                  No
                </Button>
              </div>
            </li>
          );
        })}
      </ol>

      <div aria-live="polite" className="mt-6 rounded-md border border-border bg-bg p-5">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          Where you are today
        </span>
        <Heading level={3} size="h3" className="mt-1">
          {achieved === 0 ? "Not yet at Level 1" : `Level ${achieved} — ${achievedName ?? ""}`}
        </Heading>
        {step.kind === "advance" ? (
          <p className="mt-2 text-sm text-muted">
            <span className="font-medium text-ink">
              {step.reachedHigher !== null
                ? `You already show Level ${step.reachedHigher} practices — close the Level ${step.toLevel} gap to consolidate: `
                : `Do next, to reach Level ${step.toLevel}: `}
            </span>
            {step.gate}
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted">
            <span className="font-medium text-ink">
              You&rsquo;re at the realistic ceiling for {segment.name}.{" "}
            </span>
            {step.residualRisk ?? "You can run the full ladder in-house."}
          </p>
        )}
        <div className="mt-3">
          <Button variant="ghost" size="sm" onPress={() => setAnswers(new Map())}>
            Reset
          </Button>
        </div>
      </div>
    </section>
  );
}
