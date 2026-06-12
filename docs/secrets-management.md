# Secrets Management

**Principle:** secrets never live in the repo. The **runtime source of truth is DigitalOcean App Platform encrypted environment variables**. GitHub Actions holds only what it needs to *deploy* (`DO_API_TOKEN`). All config is read and validated once at startup in `src/config.ts` (zod, fail-fast).

## Where secrets live

| Location | Holds | Notes |
|---|---|---|
| **DO App Platform → app-level env vars (encrypted)** | all runtime secrets (`ANTHROPIC_API_KEY`, `DATABASE_URL`, `FEED_REFRESH_TOKEN`, `TURNSTILE_SECRET`) | source of truth for the running container; set as `type: SECRET` in `.do/app.yaml` (value injected in the DO dashboard/API, never committed) |
| **GitHub Actions secrets** | `DO_API_TOKEN`, and `FEED_REFRESH_TOKEN` (so the scheduled action can call the protected endpoint) | least-privilege; used only by workflows |
| **Local dev** | a git-ignored `.env` created from `.env.example` | developer's own keys; never committed |
| **The repo** | **nothing** — only `.env.example` with empty/placeholder values | enforced by gitleaks + push protection |

## Environment variable inventory (by phase)

### Phase 1
| Var | Where | Purpose |
|---|---|---|
| `DO_API_TOKEN` | GitHub Actions secret | deploy to DO (build/push/deploy) |
| `LOG_LEVEL` | DO env (non-secret) | logging verbosity |
| `NODE_ENV` | DO env (non-secret) | standard |

No application secrets are required to run Phase 1 — the static site has none.

### Phase 2 (adds)
| Var | Type | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | secret | Anthropic SDK auth |
| `ANTHROPIC_MODEL` | non-secret | model id, default `claude-haiku-4-5-20251001` |
| `TURNSTILE_SECRET` | secret | server-side Turnstile verification |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | non-secret (public) | browser widget; the `NEXT_PUBLIC_` prefix is required for Next.js to expose it client-side; safe to expose |
| `DAILY_TOKEN_BUDGET` | non-secret | global daily token cap |
| `RATE_LIMIT_WINDOW_SEC`, `RATE_LIMIT_MAX` | non-secret | per-IP limiter config |

### Phase 3 (adds)
| Var | Type | Purpose |
|---|---|---|
| `DATABASE_URL` | secret | Postgres connection (TLS) |
| `FEED_REFRESH_TOKEN` | secret | protects `/api/feed/refresh`; also a GitHub Actions secret for the cron |
| `FEED_REVALIDATE_SECONDS` | non-secret | feed ISR revalidation |

## `src/config.ts` — validated loading

All env access goes through one module that validates with zod and **fails fast** if a required var is missing or malformed. Required vars are phase-gated (Phase 1 needs none app-side). Example shape:

```ts
const ConfigSchema = z.object({
  logLevel: z.enum(['debug','info','warn','error']).default('info'),
  // Phase 2+ (required only when those features are enabled):
  anthropicApiKey: z.string().min(1).optional(),
  anthropicModel: z.string().default('claude-haiku-4-5-20251001'),
  dailyTokenBudget: z.coerce.number().int().positive().optional(),
  // Phase 3+:
  databaseUrl: z.string().url().optional(),
  feedRefreshToken: z.string().min(32).optional(),
});
export const config = ConfigSchema.parse(loadFromEnv());
```

The client must never receive secrets. Only `NEXT_PUBLIC_*` vars (e.g., `TURNSTILE_SITE_KEY` exposed as `NEXT_PUBLIC_TURNSTILE_SITE_KEY`) are bundled for the browser; nothing secret is `NEXT_PUBLIC_`.

## `.env.example` (committed, no values)

```dotenv
# Phase 1
LOG_LEVEL=info

# Phase 2
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-haiku-4-5-20251001
TURNSTILE_SECRET=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
DAILY_TOKEN_BUDGET=1000000
RATE_LIMIT_WINDOW_SEC=60
RATE_LIMIT_MAX=5

# Phase 3
DATABASE_URL=
FEED_REFRESH_TOKEN=
FEED_REVALIDATE_SECONDS=3600
```

## Rotation
- Rotate `ANTHROPIC_API_KEY` and `FEED_REFRESH_TOKEN` on a schedule and immediately on any suspected exposure: update the DO encrypted env var (and the GitHub Actions copy of `FEED_REFRESH_TOKEN`), redeploy.
- `DO_API_TOKEN`: scope to the minimum needed; rotate periodically.
- `DATABASE_URL`: rotate the DB password via DO; update the env var; redeploy.

## Rules (enforced in review + CI)
- Never commit a real secret. gitleaks + GitHub push protection block accidental commits.
- Never log a secret or PII (`docs/security.md`).
- Never put a secret in a `NEXT_PUBLIC_*` var or any client-shipped code.
- Every new secret is added to this inventory, `.env.example`, and `src/config.ts` in the same PR.
