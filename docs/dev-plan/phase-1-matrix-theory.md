# Phase 1 — Static Matrix + Theory (build-ready spec)

**Goal:** the static reference site — two content-driven pages (Matrix, Theory), no AI, no database. This spec is detailed enough to implement end-to-end without re-deriving architecture. Read alongside `docs/architecture.md`, `docs/content-model.md`, `docs/repo-structure.md`, and `docs/style-guide.md`.

**Out of scope:** Anthropic, Postgres, Turnstile, rate limiting, the Threat Modeler and Feed pages. Do not add those dependencies in Phase 1.

---

## Status

- **M0 — Scaffold + CI + deploy:** ✅ done (live at humanriskmatrix.org).
- **M1 — Content pipeline + seed:** ✅ done (186 techniques across 11 categories, each with an authored description; 9 frameworks; 7 insider categories; `validate:content` is a build gate).
- **M2 — Pages:** **Matrix ✅ built** (as an ATT&CK-style interactive grid — see below); **Theory page ⏳ remaining** (its framework/theory content is already seeded).

The component design below reflects the **original plan**; the Matrix shipped with an evolved, MITRE ATT&CK–style layout (one wide grid, detail side-sheet, multi-select heatmap). The "as built" subsection records the actual components.

## Milestones

### M0 — Scaffold + CI + empty deploy
- `create-next-app` (TypeScript, App Router, ESLint, Tailwind, `src/` dir, import alias `@/*`).
- Apply the strict `tsconfig.json` baseline from the TS style guide (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, etc.).
- `next.config.ts`: `output: 'standalone'`; security headers (see `docs/security.md`).
- Add Prettier, ESLint (with `no-restricted-imports` encoding the layering rule for `src/lib`), Vitest, and `@next/mdx` (or `next-mdx-remote`).
- `package.json` scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `validate:content`.
- `Dockerfile` (multi-stage, `node:22-alpine`, standalone, non-root, `HEALTHCHECK`), `.dockerignore`.
- `.do/app.yaml` (single web service, health check) and `.github/workflows/ci.yml` + `deploy.yml` per `docs/cicd-github-actions.md`.
- `app/api/health/route.ts` returning `{ status: 'ok' }`.
- **Exit:** CI green; container builds; deploys to DO showing a placeholder home page.

### M1 — Content pipeline + content
- Implement `src/lib/content/schema.ts` and `src/lib/content/load.ts` exactly per `docs/content-model.md` (schemas, `z.infer` types, cross-reference invariants, fail-loud).
- Author the `content/` tree directly: intent degrees, the 11 category files (each a ranked technique list with MITRE IDs where coded), framework MDX, and insider-category data, all conforming to the schemas.
- `npm run validate:content` passes; wire it into `next build` and CI.
- Tests: valid fixtures parse; malformed fixtures fail with a precise error; cross-reference invariants caught.
- **Exit:** `content/` authored and validated; build fails on injected bad content.

### M2 — Matrix + Theory pages (Phase 1 exit)
- Build the two pages + components below; nav + landing; responsive + accessible.
- **Exit:** see Acceptance criteria.

---

## Page 1 — Human Risk Matrix (`app/matrix/page.tsx`)

A **server component** that loads validated content and renders the matrix. No client-side data fetching.

**Layout**
- Header: title, one-line definition, a `DegreeLegend` showing the 5 degrees of intent left→right (Unintentional → Unaware → Deceived → Coerced → Complicit) with their adversary role / awareness.
- `MatrixGrid`: 11 categories grouped under their 5 degree bands, ordered 1→11. Each category shows its number, name, and its techniques. On wide screens, a horizontal 5-degree band over 11 categories; on mobile, degrees stack vertically with categories inside.
- Selecting a category (or each category's "detail") reveals/links a `CategoryCard` with: the full ordered technique list, each technique's MITRE ID linked to `https://attack.mitre.org/techniques/<ID>/` (sub-techniques use `Txxxx/00y`), and the category's mapped models + insider categories (cross-linked to `/theory`).

**Components**
- `components/DegreeLegend.tsx` — props: `degrees: IntentDegree[]`. Pure presentational.
- `components/MatrixGrid.tsx` — props: `categoriesByDegree: { degree: IntentDegree; categories: MatrixCategory[] }[]`. Renders the banded grid; category → `CategoryCard` trigger.
- `components/CategoryCard.tsx` — props: `category: MatrixCategory`, plus resolved framework/insider names for cross-links. Renders technique list with MITRE links.
- `components/MitreLink.tsx` — props: `mitreId: string`. Builds the canonical attack.mitre.org URL; renders nothing special when `null`.

**Data**
- `src/lib/matrix/group.ts`: `groupCategoriesByDegree(categories, degrees)` → ordered bands. Pure, unit-tested.
- `src/lib/matrix/mitre.ts`: `mitreUrl(id: string): string`. Pure, unit-tested (handles `T1566` and `T1566.004`).

**Interactivity:** prefer a progressive-enhancement approach — category detail as an accessible `<details>`/disclosure or a route segment (`/matrix/[category]`) so it works without JS. If a modal is used, it must be keyboard-accessible and focus-trapped. Keep client JS minimal.

### As built

The shipped Matrix follows the **MITRE ATT&CK viewer** model rather than per-category cards: one wide grid with all 11 categories side-by-side under their 5 degree-of-intent bands (horizontal scroll, with edge fades + chevron affordance), collapsible degrees, and an environmental heatmap built by marking techniques with a green/yellow/red highlight. The heatmap is **shareable** via a URL hash that encodes the marked techniques.

- `app/matrix/page.tsx` — static Server Component; `loadContent()` → passes serializable data to `MatrixView`.
- `src/components/matrix/MatrixView.tsx` (client) — the wide grid (`repeat(11, minmax(11rem,1fr))`), collapsible degree bands; each technique row has a **highlight dot** (click cycles none→green→yellow→red→none) and a **label button** that opens the detail drawer. Owns the active-technique state and seeds the selection from a `#h=` share hash on mount. Wrapped in the `HorizontalScroll` UI primitive.
- `src/components/matrix/TechniqueDetailDrawer.tsx` (client) — the `SideSheet` detail pull-out: description + MITRE link, the per-technique detail (Overview, How an adversary operates, How the insider acts), Countermeasures grouped by the four modes (educate/evaluate/monitor/intervene), then secondary category/intent context + mapped models/insider categories, and a None/Green/Yellow/Red highlight control.
- `src/components/matrix/HeatmapSummary.tsx` (client) — per-color and per-degree counts, Focus toggle, Share (copies the link + sets the URL hash), Clear.
- `src/components/matrix/use-heatmap.ts` (client) — `useSyncExternalStore` module store of a `Map<techniqueId, color>`, persisted to `localStorage` (`hrm.heatmap.v2`); `cycle`/`setColor`/`clear`/`loadShared`.
- `src/lib/matrix/share.ts` — pure share codec: packs the selection to/from a compact, URL-safe string (2 bits per technique over a canonical id order, version byte + length guard). Unit-tested.
- `src/components/matrix/degree-style.ts` / `highlight-style.ts` — static per-degree and per-highlight Tailwind classes.
- Pure helpers `src/lib/matrix/group.ts` + `mitre.ts` are unit-tested, as planned.

The `DegreeLegend` / `MatrixGrid` / `CategoryCard` / `MitreLink` components above were **not** built as separate files; their roles are absorbed into `MatrixView` + `TechniqueDetailDrawer` + `mitre.ts`.

## Page 2 — Theory & Frameworks (`app/theory/page.tsx`)

A server component rendering the foundations and the cross-disciplinary frameworks.

**Sections**
1. **Foundations** — MDX from `content/theory/*.mdx` (why a unified taxonomy; the framework structure; the substrate concept).
2. **Substrate models** — `FrameworkCard`s grouped by discipline (CounterIntel, SafetyScience, Influence, Cyber), each from a `content/frameworks/*.mdx` frontmatter: title, origin, summary, and chips linking its `mappedCategories` back to `/matrix`.
3. **Insider-threat categories** — a table from `content/insider-categories.yaml`: category, primary behavior categories (linked), response mechanism, note.

**Components**
- `components/FrameworkCard.tsx` — props: `framework: Framework`. Renders metadata + category cross-links; the MDX body is rendered on a detail view or inline.
- `components/CategoryChips.tsx` — props: `categoryIds: number[]`. Renders linked category chips, reused on both pages.

**MDX:** configure `@next/mdx` (or `next-mdx-remote`) to render `content/**/*.mdx` with frontmatter parsed and validated against `FrameworkSchema` at build time (a bad frontmatter fails the build).

## Shared shell

- `app/layout.tsx` — top nav (Home · Matrix · Theory; Threat Modeler/Feed appear in later phases), footer (links to GitHub, license, responsible-use note), skip-to-content link, base typography.
- `app/page.tsx` — landing (as built): a centered hero, an "About the Human Risk Matrix Project" block (description + project goals), the five degrees of intent as cards that link into the Matrix, and a left-to-right roadmap timeline (v0.1 → v1.0).

## Styling & accessibility

- Tailwind; a small color scale mapping the 5 degrees of intent (used by the legend, grid bands, and chips) defined once and reused.
- Semantic HTML (`<table>`/`<section>`/`<nav>`), labelled controls, visible focus, keyboard navigation through categories and disclosures, contrast ≥ WCAG AA.
- Mobile-first; the dense matrix must remain legible and navigable on a phone.

## Tests (Vitest) — see `docs/testing-qa.md`
- `src/lib/content/load.ts`: valid fixture parses; each cross-reference invariant has a failing-case test; malformed YAML/frontmatter fails with a precise message.
- `src/lib/matrix/group.ts` and `mitre.ts`: pure unit tests incl. sub-technique URL.
- Component tests for `MatrixGrid`/`CategoryCard` rendering from fixture data (incl. a `null` MITRE id rendering no broken link).
- A test that the seeded real `content/` validates (guards against a bad future content PR breaking the build).

## Acceptance criteria (Phase 1 exit)
- Matrix and Theory render entirely from validated `content/`; nothing hardcoded that belongs in content.
- Injecting a malformed content file fails `npm run validate:content` and `next build`.
- Every coded technique links to the correct attack.mitre.org URL; uncoded techniques render cleanly with no dead link.
- Cross-links work both ways (category → mapped models/insider categories on Theory; framework/insider → categories on Matrix).
- Keyboard-only navigation works; Lighthouse accessibility ≥ 95; mobile layout verified.
- No Anthropic/Postgres/Turnstile code or env vars present.
- CI green on `main`; container builds; deployed to a public DO URL.
