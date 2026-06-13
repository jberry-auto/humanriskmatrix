import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import matter from "gray-matter";
import { z } from "zod";
import { parse as parseYaml } from "yaml";

import {
  FrameworkSchema,
  InsiderCategorySchema,
  MatrixColumnSchema,
  PhaseSchema,
  type ContentBundle,
  type Framework,
  type InsiderCategory,
  type MatrixColumn,
  type Phase,
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

function readColumns(dir: string, errors: string[]): MatrixColumn[] {
  let files: string[];
  try {
    files = readdirSync(dir)
      .filter((f) => f.endsWith(".yaml"))
      .sort();
  } catch (cause) {
    errors.push(`matrix/columns: could not read directory (${(cause as Error).message})`);
    return [];
  }
  const out: MatrixColumn[] = [];
  for (const file of files) {
    let raw: unknown;
    try {
      raw = parseYaml(readFileSync(join(dir, file), "utf8"));
    } catch (cause) {
      errors.push(`columns/${file}: parse error (${(cause as Error).message})`);
      continue;
    }
    const result = MatrixColumnSchema.safeParse(raw);
    if (result.success) out.push(result.data);
    else errors.push(`columns/${file}: ${formatZodError(result.error)}`);
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
  const phaseIds = new Set(bundle.phases.map((p) => p.id));
  const frameworkSlugs = new Set(bundle.frameworks.map((f) => f.slug));
  const insiderSlugs = new Set(bundle.insiderCategories.map((c) => c.slug));

  // All 11 column ids present exactly once.
  const seenColumnIds = new Map<number, number>();
  for (const col of bundle.columns) {
    seenColumnIds.set(col.id, (seenColumnIds.get(col.id) ?? 0) + 1);
  }
  for (let id = 1; id <= 11; id += 1) {
    const count = seenColumnIds.get(id) ?? 0;
    if (count !== 1) errors.push(`columns: column id ${id} appears ${count} time(s) (expected 1)`);
  }

  const seenTechniqueIds = new Set<string>();
  for (const col of bundle.columns) {
    if (!phaseIds.has(col.phaseId)) {
      errors.push(`column ${col.id}: phaseId "${col.phaseId}" not found in phases.yaml`);
    }
    for (const slug of col.mappedModels) {
      if (!frameworkSlugs.has(slug)) {
        errors.push(`column ${col.id}: mappedModels "${slug}" has no matching framework`);
      }
    }
    for (const slug of col.insiderCategories) {
      if (!insiderSlugs.has(slug)) {
        errors.push(
          `column ${col.id}: insiderCategories "${slug}" has no matching insider category`,
        );
      }
    }
    const labels = new Set<string>();
    for (const tech of col.techniques) {
      if (!tech.id.startsWith(`${col.id}-`)) {
        errors.push(`column ${col.id}: technique id "${tech.id}" must start with "${col.id}-"`);
      }
      if (seenTechniqueIds.has(tech.id)) {
        errors.push(`technique id "${tech.id}" is not unique`);
      }
      seenTechniqueIds.add(tech.id);
      if (labels.has(tech.label)) {
        errors.push(`column ${col.id}: duplicate technique label "${tech.label}"`);
      }
      labels.add(tech.label);
    }
  }
}

/** Read, validate, and cross-check all content. Throws ContentValidationError on any problem. */
export function loadContent(contentDir: string = DEFAULT_CONTENT_DIR): ContentBundle {
  const errors: string[] = [];

  const phases: Phase[] = readYamlArray(
    join(contentDir, "matrix", "phases.yaml"),
    PhaseSchema,
    "phases.yaml",
    errors,
  );
  const columns = readColumns(join(contentDir, "matrix", "columns"), errors);
  const frameworks = readFrameworks(join(contentDir, "frameworks"), errors);
  const insiderCategories: InsiderCategory[] = readYamlArray(
    join(contentDir, "insider-categories.yaml"),
    InsiderCategorySchema,
    "insider-categories.yaml",
    errors,
  );

  const bundle: ContentBundle = { phases, columns, frameworks, insiderCategories };
  checkCrossReferences(bundle, errors);

  if (errors.length > 0) throw new ContentValidationError(errors);
  return bundle;
}
