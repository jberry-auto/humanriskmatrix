# Architecture

## Overview

A single **Next.js (TypeScript, App Router)** application, built **static-first** and extended with two AI tools in later phases. It ships as one `output: 'standalone'` container on **DigitalOcean App Platform**. There is one deployable unit; Phase 3 adds a managed Postgres database as a backing service.

The guiding principle is a **clean dependency boundary**: pure business logic in `src/lib/**`, infrastructure (Next.js, Anthropic SDK, Postgres, RSS) on the outside depending **inward**. This keeps logic trivially testable and lets the static Phase 1 grow into the AI/data phases without rework.

## Layering (the core rule)

```
            ┌─────────────────────────────────────────────┐
            │  Infrastructure / Framework (outer)          │
            │  app/ (pages, route handlers, layouts)       │
            │  components/ (React UI)                       │
            │  Anthropic SDK · Postgres driver · rss-parser │
            └───────────────┬─────────────────────────────┘
                            │ depends inward (imports)
                            ▼
            ┌─────────────────────────────────────────────┐
            │  Business logic (inner) — src/lib/**          │
            │  PURE. dependencies injected as arguments.    │
            │  content/ · matrix/ · ai/ (core) · feed/(core)│
            │  no imports from app/, components/, next, db  │
            └─────────────────────────────────────────────┘
```

- `src/lib/**` contains pure functions and types. It **never** imports Next.js, React, the Postgres client, the Anthropic client class, `node:fs` for runtime data, or `rss-parser`. Anything with I/O is passed in (an interface), so tests inject fakes.
- Pages and route handlers are thin: they read validated input, call `src/lib`, and render/return. They own the I/O (constructing the Anthropic client, opening DB connections, reading env via `src/config.ts`) and inject it into the pure core.
- Reviewers reject PRs that violate this boundary. An ESLint `no-restricted-imports` rule encodes it (`eslint.config.mjs`): files under `src/lib/**` may not import `react`, `react-dom`, `server-only`, `next`/`next/*`, `@/app/*`, `@/components/*`, or `pg`.

### Server/client secret boundary (Next.js)
Distinct from the layering rule above, and just as important for preventing key leakage:

- **Secrets are server-only.** `src/config.ts` (and anything holding `ANTHROPIC_API_KEY`, `DATABASE_URL`, `TURNSTILE_SECRET`, `FEED_REFRESH_TOKEN`) must never be imported into a `'use client'` module — App Router bundles client modules and their transitive imports into the browser payload.
- **Never serialize secrets across the boundary.** Props passed from a Server Component to a Client Component are serialized into the page sent to the browser. Never pass `config`, an API client, or any secret-bearing value as a prop; pass only the already-computed, non-sensitive result (e.g., the validated heatmap).
- **Enforce it mechanically.** Add the [`server-only`](https://www.npmjs.com/package/server-only) package as the first import of `src/config.ts` and other server modules, so a client import is a **build error**, not a silent leak. Only `NEXT_PUBLIC_*` values (e.g., the Turnstile site key) may reach the browser.

## Directory map (target)

See `docs/repo-structure.md` for the full tree. Code-relevant parts:

```
src/
  config.ts            # zod-validated env loading; fail-fast on missing required vars
  lib/
    content/
      schema.ts        # zod schemas + z.infer types (IntentDegree, Technique, MatrixCategory, Framework, InsiderCategory)
      load.ts          # read + safeParse content/**; pure given a file map (fs injected)
    matrix/
      group.ts         # pure helper: group categories by intent degree
      mitre.ts         # pure helper: build attack.mitre.org technique URLs
      share.ts         # pure helper: encode/decode the heatmap to a shareable URL string
    ai/                # Phase 2 — pure: buildThreatModel(input, deps), prompt builders, output schema
    feed/              # Phase 3 — pure: pipeline(articles, deps), mapping, dedup key
app/
  providers.tsx        # 'use client' — React Aria RouterProvider wired to Next routing
  layout.tsx page.tsx not-found.tsx globals.css
  styleguide/page.tsx  # design-system reference (noindex)
  matrix/page.tsx      # server component; reads loaded content
  theory/page.tsx
  threat-modeler/page.tsx   # Phase 2
  threat-feed/page.tsx      # Phase 3
  api/
    threat-model/route.ts   # Phase 2
    feed/refresh/route.ts   # Phase 3 (token-protected)
    health/route.ts         # liveness/readiness
src/components/
  ui/                  # Design system primitives (docs/design-system.md): Button, Link, Card, Tag, Dialog, Tabs, Disclosure, TextField, SideSheet, Checkbox, HorizontalScroll …
  matrix/              # Matrix feature (client): MatrixView, TechniqueDetailDrawer, HeatmapSummary, use-heatmap, degree-style, highlight-style
  # later: FrameworkCard (Theory), RiskHeatmap (P2), FeedCard (P3)
```

## Data flow per page

### Matrix (Phase 1, static + client interactivity)
Build time: `src/lib/content/load.ts` reads and validates the committed `content/`; `src/lib/matrix/group.ts` groups categories by intent degree. The static `app/matrix/page.tsx` server component passes plain serializable data to the client `MatrixView`, which renders the ATT&CK-style grid and opens the `TechniqueDetailDrawer` (a `SideSheet`) on click. The **environmental heatmap** — each technique marked none / green / yellow / red — lives in `use-heatmap` (a `useSyncExternalStore` module store persisted to `localStorage`, key `hrm.heatmap.v2`) and is shareable via a URL hash encoded by the pure `src/lib/matrix/share.ts`. **Page is static** — no request-time work, no secrets, selection state lives only in the browser. Invalid content fails the build.

### Theory (Phase 1, static)
Same loader. MDX in `content/theory/` and `content/frameworks/` is rendered (via `@next/mdx` or `next-mdx-remote`); framework metadata drives `FrameworkCard`s and cross-links to `/matrix`. Static.

### Threat Modeler (Phase 2, request-time AI)
`app/threat-modeler/page.tsx` posts to `app/api/threat-model/route.ts`. The route: validates `{ target }` with zod → checks Turnstile → checks rate limit + daily token budget → constructs the Anthropic client (timeout/retries) and injects it into `src/lib/ai/buildThreatModel`, which builds a taxonomy-grounded prompt, requests structured output, and returns a zod-validated heatmap. The page renders `RiskHeatmap`. Stateless; no persistence.

### Threat Feed (Phase 3, scheduled AI + Postgres)
A scheduled GitHub Action POSTs the token-protected `app/api/feed/refresh/route.ts`. Refresh: fetch curated RSS (timeouts) → for each new article (dedup by canonical URL against Postgres) → summarize + map + suggest actions via Haiku → persist. `app/threat-feed/page.tsx` reads persisted, deduped summaries from Postgres and renders `FeedCard`s with matrix cross-links. Untrusted article text is treated as data, never as instructions (see `docs/security.md`).

## Tech choices & rationale

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js App Router (TS) | One codebase for static content + API routes for AI tools; server components keep content rendering cheap; standalone output containerizes cleanly. |
| Content | In-repo YAML + MDX, zod-validated | PR-friendly, diff-able, no runtime DB for the taxonomy; validation is a build gate. |
| Validation | zod | Single source of truth for schema + type; `safeParse` at every boundary. |
| Styling | Tailwind CSS | Fast, consistent, easy for contributors; component extraction when a pattern repeats. |
| AI | Anthropic SDK, Claude Haiku 4.5 | Fast/cheap "small" model; structured output; no GPU infra. |
| Feed parsing | `rss-parser` | Mature, simple; wrapped behind an injected interface. |
| Persistence (P3) | DO Managed Postgres | Durable dedup/history that survives the ephemeral container; managed backups. |
| Hosting | DO App Platform + DOCR | Container deploy, managed TLS, managed Postgres, simple ops. |

## Configuration & environments

All environment-specific values come from env vars, loaded and validated once in `src/config.ts` (fail-fast). Secrets are injected at runtime by DO App Platform (encrypted env vars). Nothing environment-specific is hardcoded. Inventory and handling: `docs/secrets-management.md`.

## Observability & resilience (summary)

Structured logging with correlation IDs; every external call is timed and its outcome logged; explicit timeouts + bounded retries (backoff + jitter) on AI/RSS/DB; graceful degradation when a dependency is down; `/api/health` for liveness/readiness. Details in `docs/reliability-sre.md`.

## How phases extend this architecture

Phase 1 exercises only `content/`, `src/lib/content`, `src/lib/matrix`, the two static pages, and `/api/health`. Phase 2 adds `src/lib/ai` + the modeler route/page + `src/config` AI vars + abuse controls. Phase 3 adds `src/lib/feed` + Postgres + the refresh route + the scheduled action. No phase rewrites the core; each adds an injected dependency and a thin infra edge.
