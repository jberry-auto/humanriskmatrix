# Phase 2 — SLM Threat Modeler (outline)

**Status: outline.** Locked decisions are captured here; expand to a build-ready spec (like `phase-1-matrix-theory.md`) at the start of Phase 2. Read with `docs/security.md`, `docs/secrets-management.md`, and `docs/architecture.md`.

**Goal:** a user enters a **vertical or company name** and receives a generated **heatmap over the 11 matrix columns** — which human-risk areas to prioritize — with per-column rationale and a short list of focus areas. This is the artifact the workbook's empty *Heat-Map* tab anticipated.

## Locked decisions
- Model: **Claude Haiku 4.5** (`claude-haiku-4-5-20251001`) via the Anthropic SDK.
- **Structured output** validated with zod (no free-text parsing).
- Abuse/cost controls: per-IP **rate limiting** + **Cloudflare Turnstile** on the form + a **global daily token-budget cap**.
- Stateless — no persistence of user inputs or results in Phase 2.
- Secrets via DO encrypted env vars: `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `TURNSTILE_SECRET`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (public), `DAILY_TOKEN_BUDGET`, `RATE_LIMIT_*`.

## Shape

```
app/threat-modeler/page.tsx        # form (target input + Turnstile widget) + RiskHeatmap result
app/api/threat-model/route.ts      # POST: validate → Turnstile → rate-limit → budget → call lib → return
src/lib/ai/anthropic.ts            # client factory: injected key, explicit timeout, bounded retries (backoff+jitter)
src/lib/ai/threat-model.ts         # buildThreatModel({ target, client, taxonomy }) — PURE core, client injected
src/lib/ai/schema.ts               # ThreatModelResultSchema (zod)
components/RiskHeatmap.tsx          # reuses the matrix grid, colored by per-column score
```

## Result schema (draft)

```ts
const ColumnRiskSchema = z.object({
  columnId: z.number().int().min(1).max(11),
  score: z.number().int().min(0).max(3),       // 0 none … 3 high priority
  rationale: z.string().min(1).max(400),
});
const ThreatModelResultSchema = z.object({
  target: z.string(),
  summary: z.string().max(600),
  columns: z.array(ColumnRiskSchema).length(11),
  focusAreas: z.array(z.string()).max(5),
});
```

## Prompt design (principles)
- Ground the model in the taxonomy: provide the 11 columns + phases + representative techniques from `content/` as context (built from the same loader, not duplicated).
- Ask for a calibrated per-column score with a concise rationale tied to the target's likely exposure; force the structured schema via tool/JSON output.
- The target string is **untrusted input** — treat it as data, never as instructions (prompt-injection containment per `docs/security.md`).
- Keep output bounded (token cap) and label everything as model-generated.

## Resilience & cost
- Explicit request timeout; bounded retries with exponential backoff + jitter; graceful 503 + friendly UI message when Anthropic is unavailable.
- **Rate limit + token budget use a shared, atomic store, never in-memory.** In-memory counters multiply by `instance_count`, reset on deploy, and race — defeating the cost cap. Use DO Managed Redis/Valkey (or Postgres) with atomic increment + TTL. If no shared store is provisioned for Phase 2, **pin `instance_count: 1`** and document the deploy-reset caveat. See `docs/security.md`.
- Enforce the daily token budget **before** calling (conservative max-token estimate), then **true-up against the response `usage`** afterward; when exhausted, return a clear "try again tomorrow" state.
- Derive the client IP for rate-limiting from the trusted proxy header only (not a raw client-supplied `X-Forwarded-For`).
- Return **generic** error responses; never echo Anthropic SDK errors/stack traces to the client. Log each call's duration, token usage, and outcome server-side (never the API key); correlation id per request.

## Secret boundary (Next.js)
- The Anthropic client and `ANTHROPIC_API_KEY` exist **only** in the route handler / server modules. Never import `src/config.ts` (or anything holding a secret) into a `'use client'` component, and never pass server config/secrets as props from a Server Component to a Client Component — both serialize into the browser bundle. Guard `src/config.ts` with the `server-only` package so an accidental client import fails the build. Only `NEXT_PUBLIC_TURNSTILE_SITE_KEY` reaches the browser.

## UI
- `RiskHeatmap` recolors the Phase 1 `MatrixGrid` by score; shows rationale on column focus; prominent "AI-generated suggestion, not authoritative" disclaimer; empty/error/rate-limited states.

## Acceptance criteria (Phase 2 exit)
- Typed input → zod-validated 11-column heatmap + rationale + focus areas.
- Invalid input → 400; missing/failed Turnstile → rejected; over rate limit or budget → handled state.
- Anthropic failure degrades gracefully; no secret ever logged.
- Tests with a mocked Anthropic client cover prompt grounding, valid parse, malformed-response handling, and the abuse-control paths.
