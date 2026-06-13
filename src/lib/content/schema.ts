import { z } from "zod";

// --- Phase ---
export const PhaseIdSchema = z.enum([
  "internal",
  "approach",
  "deception",
  "imposition",
  "alignment",
]);
export type PhaseId = z.infer<typeof PhaseIdSchema>;

export const PhaseSchema = z.object({
  id: PhaseIdSchema,
  name: z.string().min(1),
  order: z.number().int().min(1).max(5),
  columnRange: z.tuple([z.number().int(), z.number().int()]),
  adversaryRole: z.string().min(1),
  awareness: z.string().min(1),
});
export type Phase = z.infer<typeof PhaseSchema>;

// --- Technique ---
// MITRE ATT&CK technique id (e.g. T1566 or T1566.004), or null when uncoded.
const MitreIdSchema = z.string().regex(/^T\d{4}(\.\d{3})?$/);

export const TechniqueSchema = z.object({
  // Stable, globally unique id: "<columnId>-<slug(label)>", e.g. "7-spearphishing-attachment".
  id: z.string().regex(/^\d{1,2}-[a-z0-9-]+$/),
  label: z.string().min(1),
  mitreId: MitreIdSchema.nullable(),
  description: z.string().min(1),
});
export type Technique = z.infer<typeof TechniqueSchema>;

// --- Matrix column ---
export const MatrixColumnSchema = z.object({
  id: z.number().int().min(1).max(11),
  name: z.string().min(1),
  phaseId: PhaseIdSchema,
  techniques: z.array(TechniqueSchema).min(1),
  mappedModels: z.array(z.string()).default([]), // framework slugs
  insiderCategories: z.array(z.string()).default([]), // insider-category slugs
});
export type MatrixColumn = z.infer<typeof MatrixColumnSchema>;

// --- Framework (substrate model) ---
export const DisciplineSchema = z.enum(["CounterIntel", "SafetyScience", "Influence", "Cyber"]);
export type Discipline = z.infer<typeof DisciplineSchema>;

export const FrameworkSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  discipline: DisciplineSchema,
  origin: z.string().optional(),
  mappedColumns: z.array(z.number().int().min(1).max(11)).min(1),
  summary: z.string().min(1),
});
export type Framework = z.infer<typeof FrameworkSchema>;

// --- Insider-threat category ---
export const InsiderCategorySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  primaryColumns: z.array(z.number().int().min(1).max(11)).min(1),
  responseMechanism: z.string().min(1),
  note: z.string().optional(),
});
export type InsiderCategory = z.infer<typeof InsiderCategorySchema>;

// --- The validated content bundle ---
export interface ContentBundle {
  readonly phases: readonly Phase[];
  readonly columns: readonly MatrixColumn[];
  readonly frameworks: readonly Framework[];
  readonly insiderCategories: readonly InsiderCategory[];
}
