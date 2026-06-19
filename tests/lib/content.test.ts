import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { ContentValidationError, loadContent } from "@/lib/content/load";

describe("loadContent — real content/", () => {
  const bundle = loadContent();

  it("loads the full taxonomy", () => {
    expect(bundle.degrees).toHaveLength(5);
    expect(bundle.categories).toHaveLength(12);
    const techniques = bundle.categories.reduce((n, c) => n + c.techniques.length, 0);
    expect(techniques).toBe(186);
  });

  it("has a globally unique id and a non-empty description for every technique", () => {
    const ids = new Set<string>();
    for (const cat of bundle.categories) {
      for (const t of cat.techniques) {
        expect(ids.has(t.id), `duplicate id ${t.id}`).toBe(false);
        ids.add(t.id);
        expect(t.description.length).toBeGreaterThan(0);
      }
    }
    expect(ids.size).toBe(186);
  });

  it("has the four authored detail fields on every technique", () => {
    for (const cat of bundle.categories) {
      for (const t of cat.techniques) {
        expect(t.detailedDescription.length, `${t.id} detailedDescription`).toBeGreaterThan(0);
        expect(t.attackerBehavior.length, `${t.id} attackerBehavior`).toBeGreaterThan(0);
        expect(t.insiderBehavior.length, `${t.id} insiderBehavior`).toBeGreaterThan(0);
        expect(t.prevention.length, `${t.id} prevention`).toBeGreaterThan(0);
      }
    }
  });

  it("covers all four countermeasure modes on every technique", () => {
    for (const cat of bundle.categories) {
      for (const t of cat.techniques) {
        const modes = new Set(t.prevention.map((c) => c.mode));
        for (const mode of ["educate", "evaluate", "monitor", "intervene"] as const) {
          expect(modes.has(mode), `${t.id} missing ${mode}`).toBe(true);
        }
      }
    }
  });

  it("resolves every mapped framework and insider slug", () => {
    const frameworks = new Set(bundle.frameworks.map((f) => f.slug));
    const insiders = new Set(bundle.insiderCategories.map((c) => c.slug));
    for (const cat of bundle.categories) {
      for (const slug of cat.mappedModels) expect(frameworks.has(slug)).toBe(true);
      for (const slug of cat.insiderCategories) expect(insiders.has(slug)).toBe(true);
    }
  });
});

describe("maturity model", () => {
  const bundle = loadContent();

  it("has contiguous, uniquely-numbered levels from 1", () => {
    const levels = bundle.maturityLevels;
    expect(levels.length).toBeGreaterThanOrEqual(5);
    const nums = levels.map((l) => l.level).sort((a, b) => a - b);
    expect(nums).toEqual(levels.map((_, i) => i + 1));
  });

  it("has three segments with caps 3 / 4 / 5", () => {
    const caps = Object.fromEntries(bundle.maturitySegments.map((s) => [s.id, s.cap]));
    expect(caps).toEqual({ small: 3, "mid-size": 4, enterprise: 5 });
  });

  it("gives each segment a track at exactly levels 1..cap", () => {
    for (const segment of bundle.maturitySegments) {
      const withTrack = bundle.maturityLevels
        .filter((l) => l.tracks.some((t) => t.segment === segment.id))
        .map((l) => l.level)
        .sort((a, b) => a - b);
      expect(withTrack, segment.id).toEqual(Array.from({ length: segment.cap }, (_, i) => i + 1));
    }
  });

  it("resolves degrees, uses valid modes, and gates every non-top level", () => {
    const degreeIds = new Set(bundle.degrees.map((d) => d.id));
    const modes = new Set(["educate", "evaluate", "monitor", "intervene"]);
    const top = Math.max(...bundle.maturityLevels.map((l) => l.level));
    for (const level of bundle.maturityLevels) {
      for (const d of level.degrees) expect(degreeIds.has(d), `${level.level}:${d}`).toBe(true);
      for (const m of level.modes) expect(modes.has(m)).toBe(true);
      expect(level.counterIntel.length).toBeGreaterThan(0);
      if (level.level < top) expect(level.gate, `level ${level.level}`).not.toBeNull();
    }
  });

  it("addresses the intentional degree at the malicious-pattern level", () => {
    const level = bundle.maturityLevels.find((l) => l.name.includes("Malicious-Pattern"));
    expect(level?.degrees).toContain("intentional");
  });
});

describe("loadContent — invalid content", () => {
  it("throws ContentValidationError on a malformed category", () => {
    const dir = mkdtempSync(join(tmpdir(), "hrm-content-"));
    mkdirSync(join(dir, "matrix", "categories"), { recursive: true });
    mkdirSync(join(dir, "frameworks"), { recursive: true });
    writeFileSync(join(dir, "matrix", "intent-degrees.yaml"), "[]");
    writeFileSync(join(dir, "insider-categories.yaml"), "[]");
    writeFileSync(join(dir, "maturity-segments.yaml"), "[]");
    writeFileSync(join(dir, "maturity-model.yaml"), "[]");
    // A category whose technique is missing the required description.
    writeFileSync(
      join(dir, "matrix", "categories", "01-x.yaml"),
      "id: 1\nname: X\ndegreeId: unintentional\ntechniques:\n  - id: 1-a\n    label: A\n    mitreId: null\n",
    );
    expect(() => loadContent(dir)).toThrow(ContentValidationError);
  });

  it("rejects a technique whose prevention is missing a countermeasure mode", () => {
    const dir = mkdtempSync(join(tmpdir(), "hrm-content-"));
    mkdirSync(join(dir, "matrix", "categories"), { recursive: true });
    mkdirSync(join(dir, "frameworks"), { recursive: true });
    writeFileSync(join(dir, "matrix", "intent-degrees.yaml"), "[]");
    writeFileSync(join(dir, "insider-categories.yaml"), "[]");
    writeFileSync(join(dir, "maturity-segments.yaml"), "[]");
    writeFileSync(join(dir, "maturity-model.yaml"), "[]");
    // A technique valid in every way except: prevention omits the `intervene` mode.
    const category = [
      "id: 1",
      "name: X",
      "degreeId: unintentional",
      "techniques:",
      "  - id: 1-a",
      "    label: A",
      "    mitreId: null",
      "    description: d",
      "    detailedDescription: d",
      "    attackerBehavior: d",
      "    insiderBehavior: d",
      "    prevention:",
      "      - { mode: educate, action: a }",
      "      - { mode: evaluate, action: a }",
      "      - { mode: monitor, action: a }",
      "",
    ].join("\n");
    writeFileSync(join(dir, "matrix", "categories", "01-x.yaml"), category);

    try {
      loadContent(dir);
      expect.fail("expected loadContent to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(ContentValidationError);
      const { issues } = error as ContentValidationError;
      expect(issues.some((issue) => issue.includes("missing mode(s): intervene"))).toBe(true);
    }
  });

  it("rejects a maturity track above its segment's cap", () => {
    const dir = mkdtempSync(join(tmpdir(), "hrm-content-"));
    mkdirSync(join(dir, "matrix", "categories"), { recursive: true });
    mkdirSync(join(dir, "frameworks"), { recursive: true });
    writeFileSync(join(dir, "matrix", "intent-degrees.yaml"), "[]");
    writeFileSync(join(dir, "insider-categories.yaml"), "[]");
    // Segment "small" caps at level 1, but level 2 below carries a "small" track.
    writeFileSync(
      join(dir, "maturity-segments.yaml"),
      "- { id: small, name: S, description: d, cap: 1, residualRisk: r }\n",
    );
    const level = (n: number): string =>
      [
        `- level: ${n}`,
        `  name: L${n}`,
        `  posture: p`,
        `  description: d`,
        `  signals: s`,
        `  modes: [educate]`,
        `  degrees: [unintentional]`,
        `  counterIntel: c`,
        `  limitation: l`,
        `  gate: ${n === 2 ? "null" : "g"}`,
        `  tracks:`,
        `    - { segment: small, approach: a, practices: [p1], assessmentCriteria: [c1] }`,
      ].join("\n");
    writeFileSync(join(dir, "maturity-model.yaml"), `${level(1)}\n${level(2)}\n`);

    try {
      loadContent(dir);
      expect.fail("expected loadContent to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(ContentValidationError);
      const { issues } = error as ContentValidationError;
      expect(issues.some((issue) => issue.includes("has a track above its cap"))).toBe(true);
    }
  });
});
