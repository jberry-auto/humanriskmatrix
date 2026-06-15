# Deployment — DigitalOcean App Platform

The app ships as a single standalone container deployed to **DigitalOcean App Platform**, with images stored in **DigitalOcean Container Registry (DOCR)**. Phase 3 adds a **Managed Postgres** backing service. Deploys are driven by `deploy.yml` (`docs/cicd-github-actions.md`).

**Live app:** DO App Platform app **`human-risk-matrix-proj`** (region `nyc`), one service **`hrm`** on `apps-s-1vcpu-1gb`, fronted by the custom domain **humanriskmatrix.org** with DO-managed TLS. Images live in DOCR repository **`registry.digitalocean.com/human-risk-matrix-proj/hrm`**.

**Deploy model — deploy-on-push.** CI builds the image and pushes `hrm:latest` to DOCR; the service has **image deploy-on-push enabled**, so DigitalOcean detects the new `:latest` digest and redeploys automatically. CI does **not** run `doctl apps update` — that would overwrite the live spec. Infrastructure changes go through `.do/app.yaml` + a one-time manual `doctl apps update` (below).

## Prerequisites (provisioned by the project owner; documented, not executed here)
- DO account with **App Platform**, **Container Registry**, and (Phase 3) **Managed Postgres**.
- DOCR registry/app named **`human-risk-matrix-proj`**.
- GitHub: a **`DOCR_REGISTRY`** repository *variable* set to `human-risk-matrix-proj` (gates the deploy job — see `docs/cicd-github-actions.md`), and a **`DO_API_TOKEN`** secret scoped to the **`prod`** GitHub Environment.
- Domain **humanriskmatrix.org** pointed at the app (DO-managed TLS). *(Live.)*
- (Phase 2) Cloudflare account for Turnstile keys.

## Dockerfile (multi-stage, standalone)

```dockerfile
# syntax=docker/dockerfile:1
# --- deps ---
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- build (npm run build runs validate:content first; see package.json) ---
FROM node:22-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build   # build fails on bad content

# --- run ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "server.js"]
```

- `output: 'standalone'` in `next.config.ts` produces `server.js`. The build runs `validate:content` ahead of `next build` (wired in `package.json`), so malformed content fails the image build.
- Runs as **non-root**; signals forwarded so `SIGTERM` triggers graceful shutdown.
- **Port:** the image defaults to `PORT=3000`, but DO App Platform injects `PORT` to match the service's `http_port` (`8080`) at runtime, and Next's standalone server binds to it. DO also runs its own spec-defined health check rather than the Docker `HEALTHCHECK`.
- **Image is built natively for `linux/amd64`** (App Platform runs amd64). CI builds on an amd64 runner; a local `docker build` on Apple Silicon must use `docker buildx --platform linux/amd64`.
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
  # build artifacts / noise
  node_modules
  .next
  .git
  docs
  tests
  coverage
  ```

  Secrets reach the container **only** at runtime via DO encrypted env vars. **Never** put a secret in a Dockerfile `ENV` or `ARG`, and never reference `ANTHROPIC_API_KEY` (or any secret) at build time — `next build` would inline it into the bundle. The image reads only the committed `content/`.

## `.do/app.yaml` (Phase 1 — live spec)

`.do/app.yaml` mirrors the live app. It is applied **manually** (`doctl apps update <APP_ID> --spec .do/app.yaml`) only when infrastructure changes — routine code deploys flow through deploy-on-push and never touch the spec.

```yaml
name: human-risk-matrix-proj
region: nyc
domains:
  - domain: humanriskmatrix.org
    type: PRIMARY
services:
  - name: hrm
    http_port: 8080
    instance_count: 1
    instance_size_slug: apps-s-1vcpu-1gb
    image:
      registry_type: DOCR
      registry: human-risk-matrix-proj
      repository: hrm
      tag: latest
      deploy_on_push:
        enabled: true
```

> `deploy_on_push.enabled: true` is what makes a pushed `:latest` trigger an automatic redeploy. The current spec keeps envs minimal (NODE_ENV is set in the image); Phase 2/3 add encrypted env vars below.

### Phase 2 additions
Add encrypted env vars to the `hrm` service:
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
  - name: hrm
    envs:
      - { key: DATABASE_URL, scope: RUN_TIME, type: SECRET }   # or bound from the db component
      - { key: FEED_REFRESH_TOKEN, scope: RUN_TIME, type: SECRET }
      - { key: FEED_REVALIDATE_SECONDS, value: "3600" }
```
- Enable **automated backups** + point-in-time restore on the Postgres component.
- Run migrations on deploy (a pre-deploy job or app start hook); forward-only.

## Domain & TLS
- `humanriskmatrix.org` is attached as the primary domain; DO provisions and renews TLS (Let's Encrypt) automatically. *(Live.)*
- If Cloudflare fronts the site (for Turnstile/CDN), set DNS accordingly and keep CSP origins in sync (`docs/security.md`).

## Scaling & cost
- Static pages scale horizontally cheaply; the service runs on `apps-s-1vcpu-1gb` with `instance_count: 1` — increase `instance_count` under load.
- **Abuse-control constraint (Phase 2+):** the per-IP rate limit and the daily token budget are only correct if they share state across instances. **Do not raise `instance_count` above 1 for the app serving `/api/threat-model` until the limiter + budget use a shared atomic store** (DO Managed Redis/Valkey, or Postgres) — otherwise the effective limit and budget multiply by the instance count and reset on every deploy. See `docs/security.md` and `docs/dev-plan/phase-2-threat-modeler.md`.
- AI cost is bounded by the daily token budget (P2) and dedup (P3), not by traffic to static pages.
- Postgres: smallest production-tier node that meets the connection + storage needs; watch connection saturation (`docs/reliability-sre.md`).

## Deploy flow & rollback
1. PR merges to `main` → `deploy.yml` builds the `linux/amd64` image and pushes `hrm:<sha>` + `hrm:latest` to DOCR. It does **not** call `doctl apps update`.
2. DO App Platform detects the new `:latest` digest (deploy-on-push) and performs a health-checked rollout; a failed health check aborts the rollout and keeps the prior revision live.
3. **Rollback:** redeploy a previous immutable `hrm:<sha>` from the DO dashboard (Deployments → roll back), or re-tag that digest as `:latest`.

## Pre-launch deployment checklist
- [x] DOCR repo `human-risk-matrix-proj` created; `DO_API_TOKEN` set in the `prod` GitHub Environment; `DOCR_REGISTRY` repo variable set.
- [x] `.do/app.yaml` applied; service `hrm` healthy; deploy-on-push enabled.
- [x] Domain attached; TLS active. *(Verify security headers on prod — `docs/security.md`.)*
- [ ] Graceful shutdown verified (SIGTERM drains in-flight).
- [ ] (P2) Secret env vars set in DO; site key wired; budget set.
- [ ] (P3) Postgres provisioned; backups on; migrations run; refresh cron configured.
