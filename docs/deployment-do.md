# Deployment — DigitalOcean App Platform

The app ships as a single standalone container deployed to **DigitalOcean App Platform**, with images stored in **DigitalOcean Container Registry (DOCR)**. Phase 3 adds a **Managed Postgres** backing service. Deploys are driven by `deploy.yml` (`docs/cicd-github-actions.md`).

## Prerequisites (provisioned by the project owner; documented, not executed here)
- DO account with **App Platform**, **Container Registry**, and (Phase 3) **Managed Postgres**.
- `DO_API_TOKEN` stored as a GitHub Actions secret.
- Domain **humanriskmatrix.org** ready to point at the app (DO-managed TLS).
- (Phase 2) Cloudflare account for Turnstile keys.

## Dockerfile (multi-stage, standalone)

```dockerfile
# --- deps ---
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- build ---
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run validate:content && npm run build   # build fails on bad content

# --- run ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "server.js"]
```

- `output: 'standalone'` in `next.config.ts` produces `server.js`.
- Runs as **non-root**; signals forwarded so `SIGTERM` triggers graceful shutdown.
- **No secrets in the image.** The build stage uses `COPY . .`, and Docker builds from the **filesystem, not git** — so a local `.env` (which exists only because it's git-ignored) would otherwise be copied into a build-stage layer and pushed to DOCR. The `.dockerignore` therefore **must** exclude every secret-bearing path:

  ```dockerignore
  # secrets & local-only — MUST be excluded so they never enter an image layer
  .env
  .env.*
  *.pem
  *.key
  *.p12
  *.pfx
  secrets.*
  .npmrc
  human-risk-framework.xlsx
  # build artifacts / noise
  node_modules
  .next
  .git
  docs
  tests
  coverage
  ```

  Secrets reach the container **only** at runtime via DO encrypted env vars. **Never** put a secret in a Dockerfile `ENV` or `ARG`, and never reference `ANTHROPIC_API_KEY` (or any secret) at build time — `next build` would inline it into the bundle. The image reads only the committed `content/`, never the workbook.

## `.do/app.yaml` (Phase 1)

```yaml
name: humanriskmatrix
region: nyc
services:
  - name: web
    image:
      registry_type: DOCR
      repository: hrm
      tag: latest
    http_port: 3000
    instance_size_slug: basic-xxs      # start small; scale as needed
    instance_count: 1
    health_check:
      http_path: /api/health
      initial_delay_seconds: 10
      period_seconds: 30
    envs:
      - { key: NODE_ENV, value: production }
      - { key: LOG_LEVEL, value: info }
domains:
  - domain: humanriskmatrix.org
    type: PRIMARY
```

### Phase 2 additions
Add encrypted env vars to the `web` service:
```yaml
      - { key: ANTHROPIC_API_KEY, scope: RUN_TIME, type: SECRET }
      - { key: ANTHROPIC_MODEL, value: claude-haiku-4-5-20251001 }
      - { key: TURNSTILE_SECRET, scope: RUN_TIME, type: SECRET }
      - { key: NEXT_PUBLIC_TURNSTILE_SITE_KEY, value: <site-key> }
      - { key: DAILY_TOKEN_BUDGET, value: "1000000" }
```
(Secret *values* are set in the DO dashboard/API, never committed.)

### Phase 3 additions
```yaml
databases:
  - name: hrm-db
    engine: PG
    production: true
    # DO injects DATABASE_URL into the app automatically
services:
  - name: web
    envs:
      - { key: DATABASE_URL, scope: RUN_TIME, type: SECRET }   # or bound from the db component
      - { key: FEED_REFRESH_TOKEN, scope: RUN_TIME, type: SECRET }
      - { key: FEED_REVALIDATE_SECONDS, value: "3600" }
```
- Enable **automated backups** + point-in-time restore on the Postgres component.
- Run migrations on deploy (a pre-deploy job or app start hook); forward-only.

## Domain & TLS
- Add `humanriskmatrix.org` as the primary domain; DO provisions and renews TLS (Let's Encrypt) automatically.
- If Cloudflare fronts the site (for Turnstile/CDN), set DNS accordingly and keep CSP origins in sync (`docs/security.md`).

## Scaling & cost
- Static pages scale horizontally cheaply; start at `basic-xxs`, increase `instance_count` under load.
- **Abuse-control constraint (Phase 2+):** the per-IP rate limit and the daily token budget are only correct if they share state across instances. **Do not raise `instance_count` above 1 for the app serving `/api/threat-model` until the limiter + budget use a shared atomic store** (DO Managed Redis/Valkey, or Postgres) — otherwise the effective limit and budget multiply by the instance count and reset on every deploy. See `docs/security.md` and `docs/dev-plan/phase-2-threat-modeler.md`.
- AI cost is bounded by the daily token budget (P2) and dedup (P3), not by traffic to static pages.
- Postgres: smallest production-tier node that meets the connection + storage needs; watch connection saturation (`docs/reliability-sre.md`).

## Deploy flow & rollback
1. Merge to `main` → `deploy.yml` builds, pushes `hrm:<sha>` + `hrm:latest` to DOCR, updates the app.
2. App Platform performs a health-checked rollout; a failed health check aborts the rollout.
3. **Rollback:** redeploy a previous immutable `hrm:<sha>` tag.

## Pre-launch deployment checklist
- [ ] DOCR repo created; `DO_API_TOKEN` set in GitHub.
- [ ] `.do/app.yaml` applied; health check passing.
- [ ] Domain attached; TLS active; security headers verified on prod.
- [ ] Graceful shutdown verified (SIGTERM drains in-flight).
- [ ] (P2) Secret env vars set in DO; site key wired; budget set.
- [ ] (P3) Postgres provisioned; backups on; migrations run; refresh cron configured.
