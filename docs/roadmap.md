# Roadmap

The project advances along **two tracks that move independently**:

- **Feature track** — what the site *does* (pages, tools, infrastructure).
- **Content track** — the depth and quality of the *taxonomy* itself.

A phase ships when its **exit criteria** are met. Content can keep deepening within and across phases without blocking feature work, because content is schema-validated and decoupled from the site code.

---

## Feature track

### Phase 1 — Static Matrix + Theory  ·  *current*

The static reference site: content only, no AI, no database.

**Scope**
- Next.js (App Router, TS) scaffold; standalone container; CI/CD; deploy to DigitalOcean.
- Content pipeline: `content/` schemas + loader + `scripts/import-xlsx.ts`; validation as a build gate.
- **Page 1 — Human Risk Matrix:** interactive 11-column × 5-phase grid; column detail with MITRE-tagged techniques.
- **Page 2 — Theory & Frameworks:** foundations prose, substrate-model and insider-category tables, framework cards.
- Home/landing + nav; responsive + accessible.

**Drivers:** `docs/dev-plan/phase-1-matrix-theory.md`, `docs/content-model.md`, `docs/architecture.md`.

**Exit criteria**
- Both pages render entirely from validated `content/`; a malformed content file fails CI/build.
- Site deployed at a public URL (custom domain wiring may follow) with green CI on `main`.
- Lighthouse: accessibility ≥ 95, no critical a11y violations; mobile layout verified.
- No AI/DB code present; no secrets required beyond `DO_API_TOKEN` in GitHub.

### Phase 2 — SLM Threat Modeler

Enter a vertical or company → a generated heatmap over the matrix.

**Scope:** Anthropic (Haiku 4.5) client with timeouts/retries; taxonomy-grounded prompt; zod-validated structured output (per-column risk score + rationale + focus areas); `RiskHeatmap` UI reusing the matrix grid; **Cloudflare Turnstile** on submit; per-IP rate limiting; **global daily token-budget cap**; "model-generated" labeling.

**Drivers:** `docs/dev-plan/phase-2-threat-modeler.md`, `docs/security.md`, `docs/secrets-management.md`.

**Exit criteria:** typed input → validated heatmap; invalid input → 400; AI failure degrades gracefully; abuse controls live and tested; cost cap enforced.

### Phase 3 — SLM Threat Feed

Curated security news, summarized and mapped to the matrix with suggested actions.

**Scope:** curated RSS sources; fetch/parse with timeouts; summarize + map + suggest-actions via Haiku; **DO Managed Postgres** for deduped, durable summaries (dedup by canonical URL); scheduled refresh via a GitHub Action hitting a token-protected endpoint; feed UI with matrix cross-links; prompt-injection containment for untrusted article text.

**Drivers:** `docs/dev-plan/phase-3-threat-feed.md`, `docs/reliability-sre.md`, `docs/deployment-do.md`.

**Exit criteria:** feed renders durable, deduped, mapped summaries; each article summarized once; refresh endpoint protected; Postgres backed up; degrades gracefully when a source or the API is down.

### Post-launch (unordered)

Search across the matrix · stable permalinks/anchors per column & technique · JSON/CSV export of the taxonomy · public read-only API · taxonomy versioning & changelog UI · saved/shareable threat models · per-source feed filtering · i18n.

---

## Content track

The taxonomy is the product; the site is its surface. This track can progress in any phase.

### C0 — Seed (with Phase 1)
Import all of the local working workbook (`human-risk-framework.xlsx`, git-ignored, maintainer-held) into the committed `content/` tree: 5 phases, 11 columns with their techniques, MITRE IDs where coded, the foundations prose, substrate-model tables, and insider-threat categories. **Spot-check** the importer so no technique is dropped or mis-assigned (the Framework tab is dense and a few cells span phases). Only the generated `content/` is committed — not the workbook.

### C1 — Complete coverage
Fill gaps in technique lists; add MITRE IDs where currently `null` and a real technique exists; ensure every column's `mappedModels` and `insiderCategories` are accurate.

### C2 — Framework & theory essays
One concise, sourced essay per substrate model (MICE, RASCLS, Cialdini+Unity, cognitive biases; Reason/Swiss-Cheese, Hollnagel/ETTO, Rasmussen/Drift, Dekker/Just-Culture, Heinrich) and per discipline (Insider Risk, Counter-Intel, Cyber technical theory), each cross-linked to the columns it maps to.

### C3 — Community contributions
Open the content track to outside contributors with clear schemas, examples, and review by content-owners. New techniques, corrected mappings, regional/vertical variants.

### C4 — Versioning
Introduce a taxonomy version + changelog so downstream users can pin to a release; document breaking vs. additive content changes.

---

## Milestones → PRs

Implementation proceeds one milestone per PR via `/plan → /dev → /qa → /review → /checks → /pr`:

| Milestone | Track | Output |
|---|---|---|
| M0 | Feature | Scaffold + CI + empty deploy |
| M1 | Content/Feature | Content schemas, loader, importer, seeded `content/` |
| M2 | Feature | Matrix + Theory pages (Phase 1 exit) |
| M3 | Feature | Threat Modeler (Phase 2 exit) |
| M4 | Feature | Threat Feed + Postgres (Phase 3 exit) |
| M5 | Feature | Hardening: security, SRE, observability pass |

Content milestones C1–C4 run continuously alongside, gated only by content validation and content-owner review.
