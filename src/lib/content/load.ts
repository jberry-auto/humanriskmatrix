import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import matter from "gray-matter";
import { z } from "zod";
import { parse as parseYaml } from "yaml";

import {
  COUNTERMEASURE_MODES,
  FrameworkSchema,
  InsiderCategorySchema,
  IntentDegreeSchema,
  MatrixCategorySchema,
  MaturityLevelSchema,
  MaturitySegmentSchema,
  type ContentBundle,
  type Framework,
  type InsiderCategory,
  type IntentDegree,
  type MatrixCategory,
  type MaturityLevel,
  type MaturitySegment,
} from "./schema";

const DEFAULT_CONTENT_DIR = join(process.cwd(), "content");

export class ContentValidationError extends Error {
  readonly issues: readonly string[];
  constructor(issues: readonly string[]) {
    super(`Invalid content (${issues.length} issue(s)):\n - ${issues.join("\n - ")}`);
    this.name = "ContentValidationError";
    this.issues = issues;
  }
}

function formatZodError(error: z.ZodError): string {
  return error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("; ");
}

function validateEach<T>(
  items: unknown[],
  schema: z.ZodType<T>,
  source: string,
  errors: string[],
): T[] {
  const out: T[] = [];
  items.forEach((item, index) => {
    const result = schema.safeParse(item);
    if (result.success) out.push(result.data);
    else errors.push(`${source}[${index}]: ${formatZodError(result.error)}`);
  });
  return out;
}

function readYamlArray<T>(
  file: string,
  schema: z.ZodType<T>,
  source: string,
  errors: string[],
): T[] {
  let raw: unknown;
  try {
    raw = parseYaml(readFileSync(file, "utf8"));
  } catch (cause) {
    errors.push(`${source}: could not read/parse (${(cause as Error).message})`);
    return [];
  }
  if (!Array.isArray(raw)) {
    errors.push(`${source}: expected a top-level YAML array`);
    return [];
  }
  return validateEach(raw, schema, source, errors);
}

function readCategories(dir: string, errors: string[]): MatrixCategory[] {
  let files: string[];
  try {
    files = readdirSync(dir)
      .filter((f) => f.endsWith(".yaml"))
      .sort();
  } catch (cause) {
    errors.push(`matrix/categories: could not read directory (${(cause as Error).message})`);
    return [];
  }
  const out: MatrixCategory[] = [];
  for (const file of files) {
    let raw: unknown;
    try {
      raw = parseYaml(readFileSync(join(dir, file), "utf8"));
    } catch (cause) {
      errors.push(`categories/${file}: parse error (${(cause as Error).message})`);
      continue;
    }
    const result = MatrixCategorySchema.safeParse(raw);
    if (result.success) out.push(result.data);
    else errors.push(`categories/${file}: ${formatZodError(result.error)}`);
  }
  return out;
}

function readFrameworks(dir: string, errors: string[]): Framework[] {
  let files: string[];
  try {
    files = readdirSync(dir)
      .filter((f) => f.endsWith(".mdx"))
      .sort();
  } catch (cause) {
    errors.push(`frameworks: could not read directory (${(cause as Error).message})`);
    return [];
  }
  const out: Framework[] = [];
  for (const file of files) {
    const { data } = matter(readFileSync(join(dir, file), "utf8"));
    const result = FrameworkSchema.safeParse(data);
    if (result.success) out.push(result.data);
    else errors.push(`frameworks/${file}: ${formatZodError(result.error)}`);
  }
  return out;
}

function checkCrossReferences(bundle: ContentBundle, errors: string[]): void {
  const degreeIds = new Set(bundle.degrees.map((d) => d.id));
  const frameworkSlugs = new Set(bundle.frameworks.map((f) => f.slug));
  const insiderSlugs = new Set(bundle.insiderCategories.map((c) => c.slug));

  // All 12 category ids present exactly once.
  const seenCategoryIds = new Map<number, number>();
  for (const cat of bundle.categories) {
    seenCategoryIds.set(cat.id, (seenCategoryIds.get(cat.id) ?? 0) + 1);
  }
  for (let id = 1; id <= 12; id += 1) {
    const count = seenCategoryIds.get(id) ?? 0;
    if (count !== 1)
      errors.push(`categories: category id ${id} appears ${count} time(s) (expected 1)`);
  }

  const seenTechniqueIds = new Set<string>();
  for (const cat of bundle.categories) {
    if (!degreeIds.has(cat.degreeId)) {
      errors.push(
        `category ${cat.id}: degreeId "${cat.degreeId}" not found in intent-degrees.yaml`,
      );
    }
    for (const slug of cat.mappedModels) {
      if (!frameworkSlugs.has(slug)) {
        errors.push(`category ${cat.id}: mappedModels "${slug}" has no matching framework`);
      }
    }
    for (const slug of cat.insiderCategories) {
      if (!insiderSlugs.has(slug)) {
        errors.push(
          `category ${cat.id}: insiderCategories "${slug}" has no matching insider category`,
        );
      }
    }
    const labels = new Set<string>();
    for (const tech of cat.techniques) {
      if (!tech.id.startsWith(`${cat.id}-`)) {
        errors.push(`category ${cat.id}: technique id "${tech.id}" must start with "${cat.id}-"`);
      }
      if (seenTechniqueIds.has(tech.id)) {
        errors.push(`technique id "${tech.id}" is not unique`);
      }
      seenTechniqueIds.add(tech.id);
      if (labels.has(tech.label)) {
        errors.push(`category ${cat.id}: duplicate technique label "${tech.label}"`);
      }
      labels.add(tech.label);
      const modes = new Set(tech.prevention.map((c) => c.mode));
      const missing = COUNTERMEASURE_MODES.filter((mode) => !modes.has(mode));
      if (missing.length > 0) {
        errors.push(`technique "${tech.id}": prevention is missing mode(s): ${missing.join(", ")}`);
      }
    }
  }

  checkMaturityReferences(bundle, degreeIds, errors);
}

function checkMaturityReferences(
  bundle: ContentBundle,
  degreeIds: ReadonlySet<string>,
  errors: string[],
): void {
  const { maturityLevels, maturitySegments } = bundle;
  const segmentById = new Map(maturitySegments.map((s) => [s.id, s]));
  const validModes = new Set<string>(COUNTERMEASURE_MODES);
  const topLevel = maturityLevels.length;

  // Levels present once each, contiguous from 1.
  const seenLevels = new Map<number, number>();
  for (const lvl of maturityLevels) {
    seenLevels.set(lvl.level, (seenLevels.get(lvl.level) ?? 0) + 1);
  }
  for (let n = 1; n <= topLevel; n += 1) {
    const count = seenLevels.get(n) ?? 0;
    if (count !== 1) {
      errors.push(`maturity model: level ${n} appears ${count} time(s) (expected 1)`);
    }
  }

  // Per segment: residualRisk required below the top; a track present at exactly levels 1..cap.
  for (const segment of maturitySegments) {
    if (segment.cap < topLevel && segment.residualRisk === null) {
      errors.push(
        `maturity segment "${segment.id}": residualRisk is required when cap (${segment.cap}) is below the top level (${topLevel})`,
      );
    }
    const levelsWithTrack = new Set(
      maturityLevels
        .filter((lvl) => lvl.tracks.some((t) => t.segment === segment.id))
        .map((lvl) => lvl.level),
    );
    for (let n = 1; n <= segment.cap; n += 1) {
      if (!levelsWithTrack.has(n)) {
        errors.push(
          `maturity segment "${segment.id}": missing a track at level ${n} (cap ${segment.cap})`,
        );
      }
    }
  }

  // Per level: degrees resolve; modes valid; each track's segment resolves and level <= its cap.
  for (const lvl of maturityLevels) {
    for (const d of lvl.degrees) {
      if (!degreeIds.has(d)) {
        errors.push(`maturity level ${lvl.level}: degree "${d}" not found in intent-degrees.yaml`);
      }
    }
    for (const m of lvl.modes) {
      if (!validModes.has(m)) {
        errors.push(`maturity level ${lvl.level}: unknown countermeasure mode "${m}"`);
      }
    }
    for (const track of lvl.tracks) {
      const segment = segmentById.get(track.segment);
      if (!segment) {
        errors.push(
          `maturity level ${lvl.level}: track segment "${track.segment}" not found in maturity-segments.yaml`,
        );
      } else if (lvl.level > segment.cap) {
        errors.push(
          `maturity level ${lvl.level}: segment "${track.segment}" has a track above its cap (${segment.cap})`,
        );
      }
    }
  }
}

/** Read, validate, and cross-check all content. Throws ContentValidationError on any problem. */
export function loadContent(contentDir: string = DEFAULT_CONTENT_DIR): ContentBundle {
  const errors: string[] = [];

  const degrees: IntentDegree[] = readYamlArray(
    join(contentDir, "matrix", "intent-degrees.yaml"),
    IntentDegreeSchema,
    "intent-degrees.yaml",
    errors,
  );
  const categories = readCategories(join(contentDir, "matrix", "categories"), errors);
  const frameworks = readFrameworks(join(contentDir, "frameworks"), errors);
  const insiderCategories: InsiderCategory[] = readYamlArray(
    join(contentDir, "insider-categories.yaml"),
    InsiderCategorySchema,
    "insider-categories.yaml",
    errors,
  );
  const maturitySegments: MaturitySegment[] = readYamlArray(
    join(contentDir, "maturity-segments.yaml"),
    MaturitySegmentSchema,
    "maturity-segments.yaml",
    errors,
  );
  const maturityLevels: MaturityLevel[] = readYamlArray(
    join(contentDir, "maturity-model.yaml"),
    MaturityLevelSchema,
    "maturity-model.yaml",
    errors,
  );

  const bundle: ContentBundle = {
    degrees,
    categories,
    frameworks,
    insiderCategories,
    maturitySegments,
    maturityLevels,
  };
  checkCrossReferences(bundle, errors);

  if (errors.length > 0) throw new ContentValidationError(errors);
  return bundle;
}
