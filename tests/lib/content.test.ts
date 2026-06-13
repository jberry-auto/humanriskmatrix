import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { ContentValidationError, loadContent } from "@/lib/content/load";

describe("loadContent — real content/", () => {
  const bundle = loadContent();

  it("loads the full taxonomy", () => {
    expect(bundle.phases).toHaveLength(5);
    expect(bundle.columns).toHaveLength(11);
    const techniques = bundle.columns.reduce((n, c) => n + c.techniques.length, 0);
    expect(techniques).toBe(160);
  });

  it("has a globally unique id and a non-empty description for every technique", () => {
    const ids = new Set<string>();
    for (const col of bundle.columns) {
      for (const t of col.techniques) {
        expect(ids.has(t.id), `duplicate id ${t.id}`).toBe(false);
        ids.add(t.id);
        expect(t.description.length).toBeGreaterThan(0);
      }
    }
    expect(ids.size).toBe(160);
  });

  it("resolves every mapped framework and insider slug", () => {
    const frameworks = new Set(bundle.frameworks.map((f) => f.slug));
    const insiders = new Set(bundle.insiderCategories.map((c) => c.slug));
    for (const col of bundle.columns) {
      for (const slug of col.mappedModels) expect(frameworks.has(slug)).toBe(true);
      for (const slug of col.insiderCategories) expect(insiders.has(slug)).toBe(true);
    }
  });
});

describe("loadContent — invalid content", () => {
  it("throws ContentValidationError on a malformed column", () => {
    const dir = mkdtempSync(join(tmpdir(), "hrm-content-"));
    mkdirSync(join(dir, "matrix", "columns"), { recursive: true });
    mkdirSync(join(dir, "frameworks"), { recursive: true });
    writeFileSync(join(dir, "matrix", "phases.yaml"), "[]");
    writeFileSync(join(dir, "insider-categories.yaml"), "[]");
    // A column whose technique is missing the required description.
    writeFileSync(
      join(dir, "matrix", "columns", "01-x.yaml"),
      "id: 1\nname: X\nphaseId: internal\ntechniques:\n  - id: 1-a\n    label: A\n    mitreId: null\n",
    );
    expect(() => loadContent(dir)).toThrow(ContentValidationError);
  });
});
