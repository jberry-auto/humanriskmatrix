"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
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
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set());

  const segment = ordered.find((s) => s.id === segmentId) ?? ordered[0];

  const segmentLevels = useMemo(() => {
    if (!segment) return [];
    return levels
      .filter((l) => l.level <= segment.cap)
      .sort((a, b) => a.level - b.level)
      .map((level) => ({ level, track: level.tracks.find((t) => t.segment === segment.id) }))
      .filter((x): x is { level: MaturityLevel; track: LevelTrack } => Boolean(x.track));
  }, [levels, segment]);

  if (!segment) return null;

  const isLevelMet = (level: number): boolean => {
    const entry = segmentLevels.find((x) => x.level.level === level);
    if (!entry) return false;
    return entry.track.assessmentCriteria.every((_, i) => checked.has(`${level}:${i}`));
  };
  const achieved = achievedLevel(segment, isLevelMet);
  const step = nextStep(segment, levels, achieved);
  const achievedName = levels.find((l) => l.level === achieved)?.name;

  const toggle = (key: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const pickSegment = (id: MaturitySegmentId) => {
    setSegmentId(id);
    setChecked(new Set());
  };

  return (
    <section aria-labelledby="assess-heading" className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Heading level={2} size="h2" id="assess-heading">
          Where are you?
        </Heading>
        <p className="max-w-2xl text-muted">
          Pick your organization type, then check the capabilities you have in place. Your level is
          the highest rung where you meet every capability below it.
        </p>
      </div>

      <div role="group" aria-label="Organization type" className="flex flex-wrap gap-2">
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
      <p className="max-w-2xl text-sm text-muted">{segment.description}</p>

      <div className="flex flex-col gap-4">
        {segmentLevels.map(({ level, track }) => (
          <fieldset
            key={level.level}
            className="flex flex-col gap-2 rounded-md border border-border p-4"
          >
            <legend className="px-1 text-sm font-semibold">
              Level {level.level} — {level.name}
            </legend>
            {track.assessmentCriteria.map((criterion, i) => (
              <Checkbox
                key={criterion}
                isSelected={checked.has(`${level.level}:${i}`)}
                onChange={() => toggle(`${level.level}:${i}`)}
              >
                {criterion}
              </Checkbox>
            ))}
          </fieldset>
        ))}
      </div>

      <Card aria-live="polite" className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          Your result
        </span>
        <Heading level={3} size="h3">
          {achieved === 0 ? "Not yet at Level 1" : `Level ${achieved} — ${achievedName ?? ""}`}
        </Heading>
        {step.kind === "advance" ? (
          <p className="text-sm text-muted">
            <span className="font-medium text-ink">Next — reach Level {step.toLevel}: </span>
            {step.gate}
          </p>
        ) : (
          <p className="text-sm text-muted">
            <span className="font-medium text-ink">
              You&rsquo;re at the realistic ceiling for {segment.name}.{" "}
            </span>
            {step.residualRisk ?? "You can operate the full ladder in-house."}
          </p>
        )}
        <div className="pt-1">
          <Button variant="ghost" size="sm" onPress={() => setChecked(new Set())}>
            Reset
          </Button>
        </div>
      </Card>
    </section>
  );
}
