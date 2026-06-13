# Testing & QA

Tests ship in the **same change** as the code they cover. **Every test must fail when the behavior it covers changes** — if you can delete a line of production code and all tests still pass, a test is missing. Pure business logic in `src/lib/**` is the easy, high-value target; push side effects to the edges so they're testable with injected fakes.

Tooling: **Vitest** (unit/component), `@testing-library/react` for components, `expectTypeOf` for type-level checks.

## What to test, by layer

### Content (Phase 1 — highest priority)
- `src/lib/content/load.ts`:
  - a valid content fixture parses into the expected typed structure;
  - **each cross-reference invariant has a failing-case test** (missing category id, dup category id, unknown `mappedModels` slug, out-of-range `mappedCategories`, dup technique label, category→unknown degree);
  - malformed YAML / bad MDX frontmatter fails with a precise, file-attributed error.
- A test that the **real seeded `content/`** validates — this guards `main` against a future content PR that breaks the build.
- Importer (`scripts/import-xlsx.ts`): given a small fixture workbook, technique counts in == out per category; the `… / (MITRE)` split parses ids and maps `—`/empty → `null`; nothing dropped/merged.

### Matrix helpers (Phase 1)
- `src/lib/matrix/group.ts`: grouping order and completeness (11 categories, 5 degrees of intent).
- `src/lib/matrix/mitre.ts`: `mitreUrl` for a base technique (`T1566`) and a sub-technique (`T1566.004`); `null` yields no link.

### Components (Phase 1)
- `MatrixView` renders the grid from fixture content; toggling a technique checkbox updates the heatmap selection and per-degree counts, persists to `localStorage`, and rehydrates on reload; Clear empties it. (`tests/matrix/matrix-view.test.tsx`.)
- `TechniqueDetailDrawer`: clicking a technique opens the side-sheet with its description, MITRE link, and category/intent context; Esc closes; a `null` MITRE id renders text with no broken link.
- `FrameworkCard` renders frontmatter + category chips. *(With the Theory page.)*
- Accessibility smoke: rows reachable by accessible name; checkbox `aria-checked` exposed; keyboard focusability of disclosures + drawer.

### Config
- `src/config.ts`: missing a required (phase-enabled) var fails fast; defaults apply; `NEXT_PUBLIC_*` never carries a secret (lint/test guard).

### AI services (Phase 2)
- `src/lib/ai/threat-model.ts` with a **mocked Anthropic client**:
  - the prompt includes the taxonomy grounding (categories/degrees);
  - a well-formed structured response parses into an 11-category heatmap;
  - a malformed/off-schema response is rejected cleanly (no throw leaking to the user);
  - the untrusted `target` is delimited as data (anti-injection framing present).
- `app/api/threat-model/route.ts`: input validation (400), Turnstile-missing rejection, rate-limit (429), budget-exhausted path. Use fakes for the limiter/budget/clock.
- **Abuse-control correctness:** the limiter/budget go through the shared-store interface (inject a fake) — assert the budget is checked **before** the model call and **reconciled** against the response `usage` after; assert an over-budget request never calls the model. Assert the client IP is derived from the trusted proxy header, not a raw client-supplied `X-Forwarded-For`.
- **No leakage on error:** when the Anthropic client throws, the route returns a **generic** message (no upstream error text / stack / metadata in the response body).

### Feed (Phase 3)
- `fetch-feed.ts` with fixture RSS (valid + malformed entries) behind an injected fetcher; a failing source doesn't fail the batch.
- `canonical.ts`: canonicalization + dedup (same article, varied URLs → one key).
- `pipeline.ts`: an already-seen article is not re-summarized (dedup); mapping output validates against `FeedItemSummarySchema`; per-run metrics produced.
- `app/api/feed/refresh/route.ts`: unauthenticated → 401/403; idempotent re-run.
- **Stored-XSS guard:** a `FeedCard` rendering a summary/title containing `<script>` / `<img onerror=…>` emits **escaped, inert** markup (no `dangerouslySetInnerHTML`); markdown rendering, if any, strips raw HTML.

### Type-level
- `expectTypeOf<z.infer<typeof MatrixCategorySchema>>()...` to lock schema→type alignment for the core schemas.

## Conventions
- Test files `*.test.ts(x)` next to the code. Typed factory helpers (`makeCategory`, `makeDegree`, `makeArticle`) for fixtures.
- No network, no real Anthropic, no real DB in unit tests — inject fakes. (A tiny number of integration tests against a disposable Postgres may run in CI for Phase 3, clearly separated.)
- Deterministic: inject the clock/ids; no reliance on wall-clock or randomness in assertions.

## Coverage & gates
- CI runs `typecheck`, `lint`, `test`, `validate:content` on every PR (`docs/cicd-github-actions.md`); all required.
- Target meaningful coverage on `src/lib/**` (the pure core) — aim high there; don't chase coverage on thin infra glue.
- A green `validate:content` + `next build` proves no malformed content can ship.

## Manual QA before a phase exit
- Phase 1: keyboard-only walkthrough of both pages; mobile layout; Lighthouse a11y ≥ 95; verify every MITRE link resolves on attack.mitre.org for a sample; confirm cross-links both directions.
- Phase 2: exercise the modeler with a few verticals; confirm disclaimer, rate-limit, budget, and graceful AI-failure states.
- Phase 3: confirm dedup across a refresh, last-good serving when the model is forced to fail, and protected refresh endpoint.
