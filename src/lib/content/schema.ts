import { z } from "zod";

// --- Intent degree ---
// The five groupings along the spectrum of malicious intent (accidental/non-malicious
// on the left → witting/malicious on the right). These are positions on a spectrum,
// not a temporal progression. The id values are stable; the labels carry the meaning.
export const IntentDegreeIdSchema = z.enum([
  "internal",
  "approach",
  "deception",
  "imposition",
  "alignment",
]);
export type IntentDegreeId = z.infer<typeof IntentDegreeIdSchema>;

export const IntentDegreeSchema = z.object({
  id: IntentDegreeIdSchema,
  name: z.string().min(1),
  order: z.number().int().min(1).max(5),
  categoryRange: z.tuple([z.number().int(), z.number().int()]),
  adversaryRole: z.string().min(1),
  awareness: z.string().min(1),
});
export type IntentDegree = z.infer<typeof IntentDegreeSchema>;

// --- Technique ---
// MITRE ATT&CK technique id (e.g. T1566 or T1566.004), or null when uncoded.
const MitreIdSchema = z.string().regex(/^T\d{4}(\.\d{3})?$/);

export const TechniqueSchema = z.object({
  // Stable, globally unique id: "<categoryId>-<slug(label)>", e.g. "7-spearphishing-attachment".
  id: z.string().regex(/^\d{1,2}-[a-z0-9-]+$/),
  label: z.string().min(1),
  mitreId: MitreIdSchema.nullable(),
  description: z.string().min(1),
});
export type Technique = z.infer<typeof TechniqueSchema>;

// --- Matrix category ---
// One of the 11 categories of behavior. `degreeId` places it on the intent spectrum.
export const MatrixCategorySchema = z.object({
  id: z.number().int().min(1).max(11),
  name: z.string().min(1),
  degreeId: IntentDegreeIdSchema,
  techniques: z.array(TechniqueSchema).min(1),
  mappedModels: z.array(z.string()).default([]), // framework slugs
  insiderCategories: z.array(z.string()).default([]), // insider-category slugs
});
export type MatrixCategory = z.infer<typeof MatrixCategorySchema>;

// --- Framework (substrate model) ---
export const DisciplineSchema = z.enum(["CounterIntel", "SafetyScience", "Influence", "Cyber"]);
export type Discipline = z.infer<typeof DisciplineSchema>;

export const FrameworkSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  discipline: DisciplineSchema,
  origin: z.string().optional(),
  mappedCategories: z.array(z.number().int().min(1).max(11)).min(1),
  summary: z.string().min(1),
});
export type Framework = z.infer<typeof FrameworkSchema>;

// --- Insider-threat category ---
export const InsiderCategorySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  primaryCategories: z.array(z.number().int().min(1).max(11)).min(1),
  responseMechanism: z.string().min(1),
  note: z.string().optional(),
});
export type InsiderCategory = z.infer<typeof InsiderCategorySchema>;

// --- The validated content bundle ---
export interface ContentBundle {
  readonly degrees: readonly IntentDegree[];
  readonly categories: readonly MatrixCategory[];
  readonly frameworks: readonly Framework[];
  readonly insiderCategories: readonly InsiderCategory[];
}
