# Reliability & SRE

How the service stays up, degrades gracefully, and is observable. Baseline applies from Phase 1; external-dependency resilience (AI, RSS, Postgres) arrives with Phases 2–3. Aligns with the Resilience and Observability sections of [`docs/engineering-standards/coding-standards.md`](engineering-standards/coding-standards.md).

## Phase 1 baseline (static site)

### Health & lifecycle
- `app/api/health/route.ts` → `{ status: 'ok' }` for liveness/readiness; wired into the DO app spec health check and the container `HEALTHCHECK` (`docs/deployment-do.md`).
- **Graceful shutdown:** on `SIGTERM`, stop accepting new work, finish in-flight requests within a bounded deadline, then exit. Next.js standalone handles most of this; ensure the container forwards signals (run as PID-aware, no shell wrapper swallowing signals).

### Build-time correctness
- A malformed content file **fails the build** (content validation gate). Bad content can never reach production. This is the single most important reliability control in Phase 1.

### Observability
- **Structured logging** (JSON) via a single logger (e.g., `pino`); no `console.log`/`print` for real logs.
- **Correlation id** per request (generate or propagate `x-request-id`); include it in every log line.
- Log level configurable via env; never log secrets or PII.

## Phase 2–3 additions (external calls)

### Timeouts, retries, idempotency (every external call)
- **Explicit timeout** on every Anthropic call, RSS fetch, and DB query — never the default.
- **Bounded retries** (3–5) with **exponential backoff + jitter**; never a tight loop, never infinite.
- **Idempotency:** the feed refresh is idempotent (dedup by canonical URL → safe to re-run). The modeler is stateless.

### Graceful degradation
- **Anthropic down/over budget:** Threat Modeler returns a friendly 503/"try later"; Threat Feed keeps serving the last persisted summaries (it does not block on the model).
- **An RSS source down:** that source is skipped for the run; others proceed; the run still succeeds.
- **Postgres down:** feed page serves cached/last-good where possible; health check reflects readiness; refresh fails loudly and is retried on the next schedule.

### Postgres operations (Phase 3)
- Connection **pooling** with a sane max (the App Platform instance count × pool size must stay under the DB connection limit).
- **Migrations** run on deploy, forward-only, reviewed.
- **Backups:** enable DO Managed Postgres automated backups + point-in-time restore; document the restore procedure and test it once.

### Metrics & alerting
- Emit per-external-call metrics: count, duration, outcome (success/failure/timeout), tokens (AI). 
- Track: error rate per endpoint, p95 latency, daily token spend vs. budget, feed-refresh success + new-item count, DB connection saturation.
- Alert on: deploy health-check failures, sustained 5xx, token budget exhaustion, feed-refresh failures N times in a row, DB connection saturation, backup failures.

## SLOs (initial targets — revisit post-launch)
| Surface | Objective |
|---|---|
| Static pages (Matrix/Theory) | 99.9% availability; p95 TTFB < 300ms |
| Threat Modeler API | 99% success (excl. user/abuse 4xx); p95 < 8s; graceful 503 otherwise |
| Threat Feed page | 99.9% availability (serves last-good even if refresh fails) |
| Feed refresh job | ≥ 95% scheduled runs succeed |

"Down" means: static pages — non-2xx home/matrix; modeler — 5xx or timeout on valid+authorized input; feed — page can't render last-good items.

## Capacity & cost
- Start with the smallest viable DO instance; scale instance count horizontally if needed (static pages scale trivially).
- AI cost is bounded by the daily token budget (Phase 2) and by dedup (Phase 3). Watch token-spend metrics after launch and adjust the budget.

## Runbook stubs (fill in at each phase)
- Deploy failed health check → roll back to previous DOCR image tag.
- Token budget exhausted → expected degradation; raise budget if legitimate demand.
- Feed refresh failing → check source availability + Anthropic status + DB; re-trigger the action; data is safe (idempotent).
- DB incident → restore from backup per the documented procedure.
