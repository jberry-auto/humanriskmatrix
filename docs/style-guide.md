# Style Guide

Three kinds of style live here: **code**, **content**, and **commits/PRs**. The goal is that a reader who didn't write something can understand and extend it without asking.

---

## 1. Code style

The authority for TypeScript is [`docs/engineering-standards/style-guide-typescript.md`](engineering-standards/style-guide-typescript.md); for React/Next.js it is [`style-guide-react-nextjs.md`](engineering-standards/style-guide-react-nextjs.md) (with the general [coding standards](engineering-standards/coding-standards.md)). This section records only the **repo-specific** choices and the rules most likely to come up in review.

### Non-negotiables (from the standards)
- **Strict TypeScript.** `tsconfig.json` uses the strict baseline: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitReturns`, `verbatimModuleSyntax`, `isolatedModules`. No `any` (use `unknown` + narrowing). No `@ts-ignore` (use `@ts-expect-error` with a reason).
- **Named exports only.** No default exports anywhere in `src/` or `components/`.
- **Schema-derived types.** Define the zod schema, derive the type with `z.infer`. Never hand-write a type that duplicates a schema.
- **`safeParse`, not `parse`,** at boundaries; surface a structured error.
- **Result pattern** for expected, recoverable errors; reserve `throw` for programmer errors.
- **Functions:** single responsibility, < 30 lines typical, ≤ 3 levels of nesting, early returns.

### Repo conventions
- **Layering.** `src/lib/**` is pure: no imports from `app/`, `components/`, Next.js, the DB driver, or any I/O client. Dependencies (Anthropic client, fetcher, clock, DB handle) are passed in as arguments. This is enforced in review.
- **File naming.** Source modules `kebab-case.ts`. React components `PascalCase.tsx` with a matching named export (`export function CategoryCard(...)`). Test files `*.test.ts(x)` next to the code they cover.
- **Imports** grouped: node builtins → external → internal → `import type`. Use `import type` for type-only imports.
- **Constants** `SCREAMING_SNAKE_CASE`; const-objects-over-enums (`as const` + derived union).
- **Booleans read as questions** (`isValid`, `hasMitreId`); **functions are verbs** (`loadCategories`, `validateContent`).
- **No secrets, no hardcoded environment values.** Read from `src/config.ts` (zod-validated env). See `docs/secrets-management.md`.
- **Every external call** has an explicit timeout and bounded retry with backoff + jitter (Phases 2–3).

### Styling/UI
The **[design system](design-system.md)** is the source of truth for tokens, typography, color, and the `@/components/ui/*` primitives; the [React & Next.js guide](engineering-standards/style-guide-react-nextjs.md) covers framework rules. The essentials:
- Server Components by default; `'use client'` only on the interactive leaf; secrets never cross the server→client boundary.
- Tailwind CSS utility classes built on the design tokens (incl. the 5 intent-degree colors) defined in the design system; extract a component when a class list repeats or a unit of UI has a name.
- Accessibility is a requirement, not a nice-to-have: semantic HTML, keyboard navigability, labelled controls, sufficient contrast, visible focus, no meaning by color alone. The matrix grid must be navigable and readable on mobile.

---

## 2. Content style

Content is data first. Accuracy and consistency matter more than prose flair.

### Matrix techniques (`content/matrix/categories/NN-*.yaml`)
Each category file lists techniques in priority order. A technique is:

```yaml
- id: 7-spearphishing-attachment       # stable, globally unique: "<categoryId>-<slug(label)>"
  label: "Spearphishing Attachment"    # the human-readable behavior/technique
  mitreId: "T1566.001"                 # real MITRE ATT&CK ID, or null if uncoded
  description: "A targeted email delivers a malicious attachment…"  # required: one-line summary
  detailedDescription: "…"             # required: full prose write-up of the behavior
  attackerBehavior: "…"                # required: how an adversary operates / leverages it
  insiderBehavior: "…"                 # required: how the human acts in the moment
  prevention:                          # required: must cover all four modes
    - { mode: educate,   action: "…" }
    - { mode: evaluate,  action: "…" }
    - { mode: monitor,   action: "…" }
    - { mode: intervene, action: "…" }
```

- **`label`** — concise, specific, sentence-case noun phrase describing the behavior. Match the vocabulary already used in the category. Avoid vendor product names unless the technique is named for one (e.g., "Help-desk SE (Scattered Spider)").
- **`mitreId`** — the canonical ATT&CK technique ID (e.g., `T1566`, `T1566.004`, `T1597.002`). Verify it on attack.mitre.org. Use `null` (not `""`, not `"—"`) when no coded technique applies. **Never invent an ID.**
- **`detailedDescription` / `attackerBehavior` / `insiderBehavior`** — neutral, practitioner-facing prose. Describe adversary technique to help defenders, never as an operational how-to. For accidental categories (1–3), `attackerBehavior` describes how an adversary *leverages* the resulting exposure.
- **`prevention`** — mode-tagged countermeasures; **cover all four modes** (`educate`, `evaluate`, `monitor`, `intervene` — see `docs/content-model.md`). `intervene` scales to the category's intent degree (blame-free re-education at `unintentional` → investigation / law-enforcement handling at `intentional`). Treat technology (UEBA, DLP, HRM platforms, manual investigation) as an enabler of the behavioral response, not the primary control. Stay neutral — no vendor names, no marketing tone.
- One behavior per entry. Don't merge two techniques into one label.
- Order reflects prominence/representativeness within the category.

### Degrees of intent (`content/matrix/intent-degrees.yaml`)
The five degrees of intent are fixed (Unintentional, Unaware, Deceived, Coerced, Intentional) and read left→right as a spectrum of malicious intent, not a timeline. Edits here are rare and require strong justification — degree boundaries are a structural decision of the taxonomy.

### Framework & theory essays (`content/frameworks/*.mdx`, `content/theory/*.mdx`)
Required frontmatter (see `docs/content-model.md` for the exact schema):

```mdx
---
slug: swiss-cheese
title: "Reason — Swiss Cheese Model"
discipline: SafetyScience          # CounterIntel | SafetyScience | Influence | Cyber
origin: "James Reason"
mappedCategories: [1, 2, 3]
summary: "Defenses as layered slices with shifting holes; incidents occur when holes align."
---

Body in MDX…
```

- **Tone:** precise, neutral, practitioner-facing. No hype, no fear-mongering. The audience is security, insider-risk, and counter-intel professionals.
- **Cite sources** for attributed models and any factual claim. Credit original authors.
- **Cross-link** every essay to the matrix categories it maps to.
- Keep essays concise — explain the model and its operational use, then map it. Depth over length.
- **Responsible-use framing:** describe adversary techniques to help defenders, not as an operational how-to.

---

## 3. Commit & PR style

- **Conventional Commits**: `type(scope): summary` — e.g., `feat(matrix): add category detail panel`, `content(category-07): add quishing technique`, `fix(ci): pin actions to SHAs`, `docs(roadmap): clarify phase exits`. Types: `feat`, `fix`, `content`, `docs`, `refactor`, `test`, `chore`, `ci`.
- **Sign off** every commit (`git commit -s`) — DCO is required.
- **One logical change per PR.** Small and reviewable beats large and comprehensive.
- **PR description** states what changed and why, links the issue, and notes any standards deviation with its justification.
- **Green CI + CODEOWNER approval** are required before merge to `main`.
