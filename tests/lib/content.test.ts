import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { ContentValidationError, loadContent } from "@/lib/content/load";

describe("loadContent — real content/", () => {
  const bundle = loadContent();

  it("loads the full taxonomy", () => {
    expect(bundle.degrees).toHaveLength(5);
    expect(bundle.categories).toHaveLength(11);
    const techniques = bundle.categories.reduce((n, c) => n + c.techniques.length, 0);
    expect(techniques).toBe(160);
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
    expect(ids.size).toBe(160);
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

describe("loadContent — invalid content", () => {
  it("throws ContentValidationError on a malformed category", () => {
    const dir = mkdtempSync(join(tmpdir(), "hrm-content-"));
    mkdirSync(join(dir, "matrix", "categories"), { recursive: true });
    mkdirSync(join(dir, "frameworks"), { recursive: true });
    writeFileSync(join(dir, "matrix", "intent-degrees.yaml"), "[]");
    writeFileSync(join(dir, "insider-categories.yaml"), "[]");
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
});
