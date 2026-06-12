# CLAUDE.md — Rules for Claude Code in this repository

This file is loaded into every Claude Code session for this project. It is **project-specific** and sits on top of the repo's vendored engineering standards in [`docs/engineering-standards/`](docs/engineering-standards/). Where this file is silent, those standards and the language style guides apply.

## What this project is

**humanriskmatrix.org** — a public, community-maintained reference site + two AI tools for the Human Risk Matrix taxonomy. Next.js (TypeScript, App Router), containerized on DigitalOcean App Platform. Built in phases; see `docs/roadmap.md`.

The canonical, committed source of the taxonomy content is the **`content/`** tree (schema-validated YAML + MDX). It was initially seeded from a **local working workbook** (`human-risk-framework.xlsx`, tabs *Concepts* / *Framework* / *Heat-Map*) that is **git-ignored and never committed** — it carries author metadata and draft comments and is only a bootstrap aid. Treat `content/` as the source of truth; edits go there directly.

## Read before you build

Always read the relevant spec **before** writing code. Do not re-derive architecture from scratch.

| If you're working on… | Read first |
|---|---|
| Anything | `docs/architecture.md`, `docs/repo-structure.md`, this file |
| Content / schemas / the importer | `docs/content-model.md`, `docs/style-guide.md` |
| Any React component / page / route handler | `docs/engineering-standards/style-guide-react-nextjs.md` |
| The Matrix or Theory pages | `docs/dev-plan/phase-1-matrix-theory.md` |
| The Threat Modeler | `docs/dev-plan/phase-2-threat-modeler.md`, `docs/security.md` |
| The Threat Feed | `docs/dev-plan/phase-3-threat-feed.md`, `docs/reliability-sre.md` |
| CI/CD, deploy, secrets | `docs/cicd-github-actions.md`, `docs/deployment-do.md`, `docs/secrets-management.md` |
| Tests | `docs/testing-qa.md` |

Anything that touches Claude/Anthropic models, pricing, or the SDK: consult the `claude-api` reference — do not answer from memory. The model id is `claude-haiku-4-5-20251001`; do not change it without updating `docs/secrets-management.md` and `docs/dev-plan/phase-2-threat-modeler.md`.

## Hard rules

1. **Layering.** Business logic lives in `src/lib/**` and is **pure**: dependencies (Anthropic client, fetchers, clock, DB) are passed in as arguments. `src/lib` must not import from Next.js, the database driver, or any infrastructure. App Router pages/routes and infra depend inward on `src/lib`, never the reverse.
2. **Validate at the boundary.** All external input — request bodies, RSS payloads, LLM responses, content files, env vars — is validated with **zod** at the edge. Derive TypeScript types from schemas (`z.infer`); never duplicate.
3. **Content is a build gate.** Invalid content must fail `next build` / CI. Do not add code paths that silently skip malformed content.
4. **No secrets in the repo, ever.** Secrets come from env vars injected at runtime (DigitalOcean encrypted env vars). Never log secrets, tokens, or PII. See `docs/secrets-management.md`.
4b. **Secrets are server-only.** Never import `src/config.ts` or any secret-bearing module into a `'use client'` component, and never pass secrets/`config`/clients as props from a Server to a Client Component (both serialize to the browser). Guard server modules with the `server-only` package. Never bake a secret into the Docker image (no `ENV`/`ARG` secrets; `.dockerignore` excludes `.env*`). Only `NEXT_PUBLIC_*` reaches the browser.
5. **Explicit resilience on every external call.** Timeouts, bounded retries with exponential backoff + jitter, graceful degradation. No infinite waits, no tight retry loops.
6. **Named exports only. Strict TypeScript.** Follow [`docs/engineering-standards/style-guide-typescript.md`](docs/engineering-standards/style-guide-typescript.md), [`style-guide-react-nextjs.md`](docs/engineering-standards/style-guide-react-nextjs.md) for components/pages, and [`docs/style-guide.md`](docs/style-guide.md).
7. **Tests in the same change.** Every behavior has a test that fails when the behavior regresses. No vacuous tests.
8. **Stay within the current phase.** Do not pull Phase 2/3 dependencies (Anthropic SDK, Postgres) into a Phase 1 change.

## Workflow

Use the standard process: `/plan → /dev → /qa → /review → /checks → /pr`. One milestone per PR (`docs/roadmap.md` defines milestones). Keep PRs small and reviewable — this is a public repo with required reviews and CODEOWNERS.

## When unsure

Choose the simpler option: fewer abstractions, fewer files, less indirection. If a rule here conflicts with an explicit user instruction, follow the user and flag the deviation.
