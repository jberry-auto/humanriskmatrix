# Content Model

This is the contract between the **taxonomy** and the **site**. The **canonical, committed source is the `content/` tree** (schema-validated YAML + MDX). The schemas below are the single source of truth; types are derived from them with `z.infer`. **Invalid content fails the build.**

> The `content/` tree was originally seeded from a **local working workbook** (`human-risk-framework.xlsx`) that is **git-ignored and not committed** (it carries author metadata and draft cell-comments — see the security audit). The workbook is a one-time bootstrap aid held by maintainers, not the source of truth.

## Terminology

The matrix is **11 categories of behavior** arranged along a **spectrum of malicious intent**. The 11 categories are grouped into **5 degrees of intent**. Read **left to right**, the spectrum runs from accidental, non-malicious behavior (that can still cause a breach or data loss) to witting cooperation with an adversary. Position reflects **how much malicious intent drives the behavior — it is not a timeline or a sequence of events.** (The terms "phases" and "columns" are deprecated: "phase" wrongly implied temporal progression.)

---

## The source workbook (local-only seed)

The original `human-risk-framework.xlsx` (git-ignored; held locally by maintainers) has three tabs:

- **Concepts** → foundations prose + substrate-model tables + insider-threat categories → `content/theory/` and `content/frameworks/`.
- **Framework** → the matrix: 11 categories across 5 degrees of intent, each a ranked list of techniques with MITRE ATT&CK IDs where coded → `content/matrix/`.
- **Heat-Map** → intentionally empty. It is the artifact the Phase 2 Threat Modeler generates per industry; it is **not** imported.

## The taxonomy, fixed facts

### Degrees of intent (5)

Ordered left → right by increasing malicious intent (not by time).

| order | id | name | categories | adversaryRole | awareness |
|---|---|---|---|---|---|
| 1 | `unintentional` | Unintentional | 1–3 | None | Low to none; no harmful intent — slip, habit, convenience |
| 2 | `unaware` | Unaware | 4–6 | Passive observation / relationship-building | None to low; unaware of being targeted |
| 3 | `deceived` | Deceived | 7–8 | Active deception | Detected on reflection or never; believes the action is correct |
| 4 | `coerced` | Coerced | 9–10 | Active pressure or physical action | Immediate/imminent; acts under force or confusion |
| 5 | `complicit` | Complicit | 11 | Active sponsor | Full awareness; aligned with adversary |

### Categories (11)

| id | name | degree |
|---|---|---|
| 1 | Accidental Disclosure | unintentional |
| 2 | Hygiene & Config Drift | unintentional |
| 3 | Workarounds & Self-Exposure | unintentional |
| 4 | Reconnaissance | unaware |
| 5 | Access Development | unaware |
| 6 | Elicitation | unaware |
| 7 | Deceptive Delivery | deceived |
| 8 | Impersonation | deceived |
| 9 | Forced Compliance | coerced |
| 10 | Physical Intrusion | coerced |
| 11 | Coercion & Recruitment | complicit |

Each category holds an **ordered list of techniques** (id + label + optional MITRE ID + authored description). The Framework tab is the source; e.g. category 1 ranges from "Misdirected email (autocomplete)" to "Confidential data pasted into public LLM"; category 7 (Deceptive Delivery) is the densest, running from "Spearphishing Attachment (T1566.001)" through BEC variants and "ClickFix / FakeCaptcha (T1204.004)"; category 11 runs "Witting recruitment (MICE)" → "Sextortion" → … → "Ransomware extortion (post-SE)".

### Substrate models (Concepts tab)

Two families, mapped to categories. These become `content/frameworks/*.mdx`:

- **Adversarial intent (categories 4–11):** MICE (11; 5,7) · RASCLS (6; 5,7) · Cialdini+Unity (5,6,8) · Cognitive biases (4–11).
- **Error & drift (categories 1–3):** Reason/Swiss-Cheese · Hollnagel/ETTO (2,3) · Rasmussen/Drift-to-Danger (2,3) · Dekker/Just-Culture (1,2,3) · Heinrich Pyramid (1,2,3).

### Insider-threat categories (Concepts tab)

A separate classification from the 11 behavior categories. Negligent (1,2,3) · Compromised-credentials (2→7,8) · Unwitting-exploited (4–9) · Departing-employee (3↔11) · Third-party/vendor (5,8) · Witting-recruited (11) · Collusive (11). Each has a response mechanism and a note.

---

## Schemas (`src/lib/content/schema.ts`)

zod is the source of truth; export `z.infer` types alongside each schema.

```ts
import { z } from 'zod';

// --- Intent degree ---
export const IntentDegreeIdSchema = z.enum([
  'unintentional', 'unaware', 'deceived', 'coerced', 'complicit',
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
// MITRE ATT&CK technique id, e.g. T1566 or T1566.004, or null when uncoded.
const MitreIdSchema = z.string().regex(/^T\d{4}(\.\d{3})?$/);

// Countermeasures are framed by four modes; every technique must cover all four
// (loader-enforced). intervene scales with the category's intent degree.
export const COUNTERMEASURE_MODES = ['educate', 'evaluate', 'monitor', 'intervene'] as const;
export const CountermeasureModeSchema = z.enum(COUNTERMEASURE_MODES);
export const CountermeasureSchema = z.object({
  mode: CountermeasureModeSchema,
  action: z.string().min(1),
});

export const TechniqueSchema = z.object({
  id: z.string().regex(/^\d{1,2}-[a-z0-9-]+$/), // stable, globally unique: "<categoryId>-<slug(label)>"
  label: z.string().min(1),
  mitreId: MitreIdSchema.nullable(),
  description: z.string().min(1),                // authored one-line summary (matrix cell + drawer lead)
  detailedDescription: z.string().min(1),        // full prose write-up of the behavior
  attackerBehavior: z.string().min(1),           // how an adversary operates / leverages it
  insiderBehavior: z.string().min(1),            // how the human / insider acts in the moment
  prevention: z.array(CountermeasureSchema).min(1), // must cover all four modes (loader-enforced)
});
export type Technique = z.infer<typeof TechniqueSchema>;

// --- MatrixCategory ---
export const MatrixCategorySchema = z.object({
  id: z.number().int().min(1).max(11),
  name: z.string().min(1),
  degreeId: IntentDegreeIdSchema,
  techniques: z.array(TechniqueSchema).min(1),
  mappedModels: z.array(z.string()).default([]),      // framework slugs
  insiderCategories: z.array(z.string()).default([]), // insider-category slugs
});
export type MatrixCategory = z.infer<typeof MatrixCategorySchema>;

// --- Framework (MDX frontmatter) ---
export const DisciplineSchema = z.enum([
  'CounterIntel', 'SafetyScience', 'Influence', 'Cyber',
]);
export const FrameworkSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  discipline: DisciplineSchema,
  origin: z.string().optional(),         // attributed author/source
  mappedCategories: z.array(z.number().int().min(1).max(11)).min(1),
  summary: z.string().min(1),
  // body is the MDX content, compiled separately
});
export type Framework = z.infer<typeof FrameworkSchema>;

// --- InsiderCategory ---
export const InsiderCategorySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  primaryCategories: z.array(z.number().int().min(1).max(11)).min(1),
  responseMechanism: z.string().min(1),
  note: z.string().optional(),
});
export type InsiderCategory = z.infer<typeof InsiderCategorySchema>;
```

### Cross-reference invariants (enforced by the loader)
Beyond per-record validation, `load.ts` checks the **whole set**:
- Every `category.degreeId` exists in `intent-degrees.yaml`, and category ids 1–11 are all present exactly once.
- Every slug in `category.mappedModels` resolves to a `content/frameworks/*` file; every slug in `insiderCategories` resolves to a defined insider category.
- Every `framework.mappedCategories` / `insiderCategory.primaryCategories` id is in 1–11.
- No duplicate technique `label` within a category; every technique `id` is globally unique and prefixed with its `<categoryId>-`.
- Every technique's `prevention` covers **all four** countermeasure modes (`educate`, `evaluate`, `monitor`, `intervene`).
A failure throws with the offending file + field, and the **build fails**.

### Countermeasure modes
`prevention` entries are tagged with one of four modes, and the detail drawer groups them under these headings:
- **educate** — build awareness through short, consumable messaging/training for the specific behavior.
- **evaluate** — test resilience via simulation (phishing/scenario) and controlled integrity probes; not purely technical.
- **monitor** — collect behavioral signals to detect the behavior (e.g. UEBA, DLP, access/audit telemetry).
- **intervene** — respond, **scaled to the category's intent degree**: at `unintentional`, blame-free in-the-moment re-education; escalating through containment, protective/supportive response, up to manual investigation and law-enforcement / counter-intelligence handling at `complicit`.

---

## File layout

```
content/
  matrix/
    intent-degrees.yaml               # array of IntentDegree
    categories/
      01-accidental-disclosure.yaml   # one MatrixCategory per file
      02-hygiene-config-drift.yaml
      …
      11-coercion-recruitment.yaml
  frameworks/
    mice.mdx  rascls.mdx  cialdini-unity.mdx  cognitive-biases.mdx
    swiss-cheese.mdx  etto.mdx  drift-to-danger.mdx  just-culture.mdx  heinrich-pyramid.mdx
  theory/
    why-this-taxonomy.mdx  framework-structure.mdx  substrate.mdx  insider-categories.mdx
  insider-categories.yaml             # array of InsiderCategory (tabular data)
```

### Example category file

```yaml
# content/matrix/categories/07-deceptive-delivery.yaml
id: 7
name: Deceptive Delivery
degreeId: deceived
mappedModels: [cialdini-unity, cognitive-biases]
insiderCategories: [unwitting-exploited, compromised-credentials]
techniques:
  - id: 7-spearphishing-attachment
    label: "Spearphishing Attachment"
    mitreId: "T1566.001"
    description: "A targeted email delivers a malicious attachment crafted to compromise the recipient when opened."
    detailedDescription: >-
      Full prose write-up of the behavior and the human dynamic it exploits.
    attackerBehavior: >-
      How an adversary operates the technique.
    insiderBehavior: >-
      How the recipient acts, and why it feels like normal work.
    prevention:
      - mode: educate
        action: "Train recipients to verify unexpected attachments out-of-band."
      - mode: evaluate
        action: "Run spearphishing simulations against high-exposure roles."
      - mode: monitor
        action: "Ingest mail-gateway and endpoint signals for suspicious attachments."
      - mode: intervene
        action: "Contain (reset/quarantine) and coach the user; treat them as a victim."
  # … remaining techniques from the Framework tab, in order, each with the full field set
```

### Example framework file

Framework MDX currently carries the frontmatter below plus a **short summary body** — the full essays land with the Theory & Frameworks page (a later milestone). The matrix detail drawer reads only the `title`/`summary`.

```mdx
---
slug: swiss-cheese
title: "Reason — Swiss Cheese Model"
discipline: SafetyScience
origin: "James Reason"
mappedCategories: [1, 2, 3]
summary: "Defenses as layered slices with shifting holes; incidents occur when holes align."
---

Defenses as layered slices with shifting holes; incidents occur when holes align…
```

---

## The importer (`scripts/import-xlsx.ts`)

A committed, repeatable Node script (run via `tsx`) that converts the **local, git-ignored** working workbook into `content/`. It is a **maintainer tool for the initial seed / occasional re-seed**, run locally by someone who has the workbook — it is **not part of CI or the production build** (the build only ever reads the committed `content/`). Day-to-day, contributors edit the YAML/MDX directly.

**Behavior**
1. Parse `human-risk-framework.xlsx` (use `xlsx` or `exceljs`).
2. **Framework tab → categories:** read the header row and the 11 category headers; walk each category top-to-bottom collecting non-empty cells; split each cell on the `… / (MITRE)` convention into `{ label, mitreId }` (map `—`/empty → `null`); generate a stable `id`; emit `content/matrix/categories/NN-*.yaml` preserving order.
3. **Concepts tab → theory + tables:** extract the prose blocks into `content/theory/*.mdx`; extract the substrate-model and insider-category tables into structured records (`frameworks/*.mdx` frontmatter + `insider-categories.yaml`).
4. Emit `intent-degrees.yaml` from the degree table.
5. The emitted authored fields (`description`, `detailedDescription`, `attackerBehavior`, `insiderBehavior`) are empty and `prevention` is `[]` — author each afterward (the strict schema requires non-empty values and all four countermeasure modes, so content only validates once authored).

**Fidelity guard (required):** the Framework tab is dense and a few cells span degrees. The importer must:
- preserve every non-empty technique cell (count techniques in and out; log the totals per category),
- never silently merge or drop cells,
- print a per-category technique-count summary so a human can **spot-check** before committing.

---

## Validation as a build gate

- `npm run validate:content` runs `load.ts` over `content/**` and exits non-zero on any schema or cross-reference failure.
- `next build` imports the same loader, so a bad content file **fails the production build** — malformed content can never ship.
- CI runs `validate:content` on every PR (see `docs/cicd-github-actions.md`). This is the guardrail that lets us accept community content PRs safely.

## Contributor editing workflow (recap)

Edit the YAML/MDX in `content/` directly → run `npm run validate:content` → open a PR → content-owners review for accuracy (especially MITRE IDs and attributions) → CI validates → merge. See `CONTRIBUTING.md` and `docs/style-guide.md`.
