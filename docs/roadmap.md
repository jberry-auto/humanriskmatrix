# Roadmap

The project advances along **two tracks that move independently**:

- **Feature track** — what the site *does* (pages, tools, infrastructure).
- **Content track** — the depth and quality of the *taxonomy* itself.

A phase ships when its **exit criteria** are met. Content can keep deepening within and across phases without blocking feature work, because content is schema-validated and decoupled from the site code.

---

## Feature track

### Phase 1 — Static Matrix + Theory  ·  *current (Matrix live; Theory page remaining)*

The static reference site: content only, no AI, no database.

**Scope**
- ✅ Next.js (App Router, TS) scaffold; standalone container; CI/CD; deployed to DigitalOcean at humanriskmatrix.org.
- ✅ Content pipeline: `content/` schemas + loader; validation as a build gate.
- ✅ **Page 1 — Human Risk Matrix:** interactive ATT&CK-style grid of 12 categories across the 5 degrees of intent; click a technique for a detail side-sheet (overview, how an adversary operates, how the insider acts, countermeasures, MITRE link); mark techniques with a green/yellow/red **environmental heatmap** that persists to localStorage and is shareable by URL.
- ⏳ **Page 2 — Theory & Frameworks:** foundations prose, substrate-model and insider-category tables, framework cards. *(Next milestone; framework/theory content is already seeded.)*
- ✅ **Page 3 — Human Risk Maturity Model:** a threat-informed capability ladder (5 levels, counter-intelligence woven through) with size-based caps (Small→L3, Mid-size→L4, Enterprise→L5) and an interactive self-assessment. Content-driven from `content/maturity-model.yaml` + `content/maturity-segments.yaml`.
- ✅ Home/landing + nav; responsive + accessible; light/dark theme.

**Drivers:** `docs/dev-plan/phase-1-matrix-theory.md`, `docs/content-model.md`, `docs/architecture.md`.

**Exit criteria**
- Both pages render entirely from validated `content/`; a malformed content file fails CI/build. *(Matrix ✅; Theory page pending.)*
- ✅ Site deployed at the public domain humanriskmatrix.org with green CI on `main`.
- Lighthouse: accessibility ≥ 95, no critical a11y violations; mobile layout verified.
- ✅ No AI/DB code present; no secrets required beyond `DO_API_TOKEN` (in the `prod` GitHub Environment) + the `DOCR_REGISTRY` variable.

### Phase 2 — SLM Threat Modeler

Enter a vertical or company → a generated heatmap over the matrix.

**Scope:** Anthropic (Haiku 4.5) client with timeouts/retries; taxonomy-grounded prompt; zod-validated structured output (per-category risk score + rationale + focus areas); `RiskHeatmap` UI reusing the matrix grid; **Cloudflare Turnstile** on submit; per-IP rate limiting; **global daily token-budget cap**; "model-generated" labeling.

**Drivers:** `docs/dev-plan/phase-2-threat-modeler.md`, `docs/security.md`, `docs/secrets-management.md`.

**Exit criteria:** typed input → validated heatmap; invalid input → 400; AI failure degrades gracefully; abuse controls live and tested; cost cap enforced.

### Phase 3 — SLM Threat Feed

Curated security news, summarized and mapped to the matrix with suggested actions.

**Scope:** curated RSS sources; fetch/parse with timeouts; summarize + map + suggest-actions via Haiku; **DO Managed Postgres** for deduped, durable summaries (dedup by canonical URL); scheduled refresh via a GitHub Action hitting a token-protected endpoint; feed UI with matrix cross-links; prompt-injection containment for untrusted article text.

**Drivers:** `docs/dev-plan/phase-3-threat-feed.md`, `docs/reliability-sre.md`, `docs/deployment-do.md`.

**Exit criteria:** feed renders durable, deduped, mapped summaries; each article summarized once; refresh endpoint protected; Postgres backed up; degrades gracefully when a source or the API is down.

### Post-launch (unordered)

Search across the matrix · stable permalinks/anchors per category & technique · JSON/CSV export of the taxonomy · public read-only API · taxonomy versioning & changelog UI · saved/shareable threat models · per-source feed filtering · i18n.

---

## Content track

The taxonomy is the product; the site is its surface. This track can progress in any phase.

### C0 — Foundation (with Phase 1)  ·  ✅ done
The committed `content/` tree: 5 degrees of intent, 12 categories with **186 techniques**, MITRE IDs where coded, 9 framework records, and 7 insider-threat categories. Each technique carries a full write-up — overview, how an adversary operates, how the insider acts, and mode-tagged countermeasures (educate / evaluate / monitor / intervene). *(Long-form framework/theory essays remain — see C2.)*

### C1 — Complete coverage
Fill gaps in technique lists; add MITRE IDs where currently `null` and a real technique exists; ensure every category's `mappedModels` and `insiderCategories` are accurate.

### C2 — Framework & theory essays
One concise, sourced essay per substrate model (MICE, RASCLS, Cialdini+Unity, cognitive biases; Reason/Swiss-Cheese, Hollnagel/ETTO, Rasmussen/Drift, Dekker/Just-Culture, Heinrich) and per discipline (Insider Risk, Counter-Intel, Cyber technical theory), each cross-linked to the categories it maps to.

### C3 — Community contributions
Open the content track to outside contributors with clear schemas, examples, and review by content-owners. New techniques, corrected mappings, regional/vertical variants.

### C4 — Versioning
Introduce a taxonomy version + changelog so downstream users can pin to a release; document breaking vs. additive content changes.

---

## Milestones → PRs

Implementation proceeds one milestone per PR via `/plan → /dev → /qa → /review → /checks → /pr`:

| Milestone | Track | Output | Status |
|---|---|---|---|
| M0 | Feature | Scaffold + CI + deploy pipeline | ✅ done |
| M1 | Content/Feature | Content schemas, loader, authored `content/` | ✅ done |
| M2 | Feature | Matrix + Theory pages (Phase 1 exit) | Matrix ✅; Theory ⏳ |
| M3 | Feature | Threat Modeler (Phase 2 exit) | planned |
| M4 | Feature | Threat Feed + Postgres (Phase 3 exit) | planned |
| M5 | Feature | Hardening: security, SRE, observability pass | planned |

Content milestones C1–C4 run continuously alongside, gated only by content validation and content-owner review.
