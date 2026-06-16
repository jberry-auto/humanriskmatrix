# Repository Structure

This is a public, community-maintained monorepo: taxonomy **content**, application **code**, and **docs** live together so a change to the model and a change to the site can travel in one reviewable PR. This document is the map — read it before adding a file so things land in the right place.

## Top-level layout

```
humanriskmatrix/
├── README.md                     # Project overview + entry point to docs
├── CLAUDE.md                     # Rules for Claude Code sessions
├── CONTRIBUTING.md               # How to contribute (content + code)
├── CODE_OF_CONDUCT.md
├── CODEOWNERS                    # Required reviewers per path
├── LICENSE                       # PolyForm Noncommercial 1.0.0 (code)
├── .gitignore  .editorconfig
├── .env.example                  # Documented env vars (no real values) — added with Phase 1 code
│
├── content/                      # Taxonomy content (CC BY-NC 4.0) — see content/LICENSE
│   ├── LICENSE
│   ├── matrix/
│   │   ├── intent-degrees.yaml   # The 5 degrees of intent (id, name, order, adversary role, awareness)
│   │   └── categories/
│   │       ├── 01-accidental-disclosure.yaml
│   │       ├── 02-hygiene-config-drift.yaml
│   │       ├── …                 # one file per category, 01..11
│   │       └── 11-coercion-recruitment.yaml
│   ├── frameworks/               # Cross-disciplinary model essays (MDX + frontmatter)
│   │   ├── mice.mdx  rascls.mdx  swiss-cheese.mdx   etto.mdx  …
│   ├── theory/                   # Long-form foundations (MDX)
│   │   ├── why-this-taxonomy.mdx
│   │   ├── framework-structure.mdx
│   │   ├── substrate.mdx
│   │   └── insider-categories.mdx
│   └── insider-categories.yaml   # Insider-threat categories (tabular data)
│
├── docs/                         # Specs & guides (this dev-plan set)
│   ├── repo-structure.md  roadmap.md  style-guide.md
│   ├── architecture.md  content-model.md  design-system.md
│   ├── security.md  reliability-sre.md  secrets-management.md
│   ├── cicd-github-actions.md  deployment-do.md  testing-qa.md
│   ├── engineering-standards/    # Vendored authoritative code/style rules
│   │   ├── README.md  coding-standards.md  engineering-principles.md
│   │   ├── style-guide-typescript.md  style-guide-javascript.md
│   │   └── style-guide-react-nextjs.md
│   └── dev-plan/
│       ├── phase-1-matrix-theory.md     # build-ready
│       ├── phase-2-threat-modeler.md    # outline
│       └── phase-3-threat-feed.md       # outline
│
├── scripts/
│   └── validate-content.ts      # tsx runner for the content loader (npm run validate:content)
│
├── src/                          # Application code (alias @/* → ./src/*)
│   ├── config.ts                 # zod-validated env loading (server-only)
│   ├── lib/                      # PURE business logic — dependencies injected, no infra imports
│   │   ├── cn.ts                 # className join helper (pure)
│   │   ├── health.ts             # health-check payload (pure)
│   │   ├── content/              # schema.ts (zod), load.ts (read+validate)
│   │   ├── matrix/               # group.ts, mitre.ts, share.ts — category/degree/heatmap helpers (pure)
│   │   ├── ai/                   # Phase 2: threat-model logic (client injected)
│   │   └── feed/                 # Phase 3: RSS fetch/parse/pipeline (pure core)
│   └── components/
│       ├── ui/                   # Design-system primitives (docs/design-system.md):
│       │                         #   Button, Card, Checkbox, Container, Dialog, Disclosure,
│       │                         #   Eyebrow, Heading, HorizontalScroll, Link, Prose, Section,
│       │                         #   SideSheet, Tabs, Tag, TextField, ThemeToggle
│       └── matrix/               # Matrix feature: MatrixView, TechniqueDetailDrawer, HeatmapSummary,
│                                 #   use-heatmap, degree-style, highlight-style
│
├── app/                          # Next.js App Router (pages, layouts, API routes)
│   ├── providers.tsx             # 'use client' — React Aria RouterProvider
│   ├── layout.tsx  page.tsx  not-found.tsx  globals.css
│   ├── styleguide/page.tsx       # design-system reference (noindex)
│   ├── matrix/page.tsx           # the Matrix (static Server Component) — BUILT
│   ├── theory/page.tsx           # Theory & Frameworks — next milestone (not yet)
│   ├── threat-modeler/page.tsx   # Phase 2
│   ├── threat-feed/page.tsx      # Phase 3
│   └── api/health/route.ts       # health check (Phase 2+ adds more routes)
│
├── tests/                       # Vitest tests + setup (mirrors src/ layout)
│   ├── setup.ts                  # matchMedia + in-memory localStorage stubs
│   ├── lib/  matrix/  ui/        # unit + component tests
│   └── page.test.tsx  health.test.ts
│
├── .github/
│   ├── workflows/                # ci.yml, deploy.yml, feed-refresh.yml
│   ├── ISSUE_TEMPLATE/
│   ├── pull_request_template.md
│   └── dependabot.yml
│
├── .do/
│   └── app.yaml                  # DigitalOcean App Platform spec
│
├── Dockerfile  .dockerignore
├── next.config.ts  tsconfig.json
├── package.json  package-lock.json
└── eslint/prettier config
```

> **Status:** Phase 1 is built — the full `content/` tree, the content pipeline (`src/lib/content`), the design system (`src/components/ui`), and the interactive Matrix page (`src/components/matrix`, `app/matrix`) are live. Files marked "Phase 2/3" (threat modeler, threat feed, `src/lib/ai`, `src/lib/feed`) and the Theory page do not exist yet — the tree shows them so contributors know where new files go.

## Where does my change go?

| I want to… | Put it in… | Reviewed by |
|---|---|---|
| Add/fix a matrix technique or its MITRE ID | `content/matrix/categories/NN-*.yaml` | content-owners |
| Add/fix an intent-degree definition | `content/matrix/intent-degrees.yaml` | content-owners |
| Write a framework/model essay | `content/frameworks/<slug>.mdx` | content-owners |
| Write/edit foundational theory prose | `content/theory/<slug>.mdx` | content-owners |
| Add pure business logic | `src/lib/<domain>/` | maintainers |
| Add a page or route | `app/` | maintainers |
| Add a UI component | `src/components/` (`ui/` for design-system primitives) | maintainers |
| Change CI/CD, deploy, or container | `.github/`, `.do/`, `Dockerfile` | infra-owners |
| Update a spec/guide | `docs/` | maintainers |

## Naming conventions

- **Files:** `kebab-case` for source files (`category-card.tsx` or `CategoryCard.tsx` for components — pick one per the style guide and stay consistent), `kebab-case.mdx` for content, `NN-slug.yaml` for ordered matrix categories.
- **Matrix category files** are zero-padded and ordered: `01-…` through `11-…`, slug derived from the category name.
- **No default exports** in `src/` or `components/` — named exports only (see `docs/style-guide.md`).

## The layering boundary (enforced by review)

`src/lib/**` is the pure core. It must not import from `app/`, `components/`, the Next.js runtime, the database driver, or any network/file client. Infrastructure (pages, route handlers, DB, Anthropic SDK) depends **inward** on `src/lib`. This keeps the business logic trivially testable and is checked in code review. See `docs/architecture.md`.
