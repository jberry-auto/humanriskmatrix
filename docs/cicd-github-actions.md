# CI/CD — GitHub Actions

This is a **public repo accepting community PRs**, so CI is the gate that protects quality and `main`. Strict PR governance + strong CI runs from day one (Phase 1); deploy is automatic on merge via DOCR deploy-on-push; the feed cron arrives in Phase 3.

Two workflows are live: **`ci.yml`** (quality gates on every PR and on `main`) and **`deploy.yml`** (build + push image to DOCR on merge to `main`).

## Branch protection & governance (`main`)

Configure on the GitHub repo (document, since it's not code):
- **No direct pushes**; all changes via PR. No force-push, no branch deletion.
- **Required status checks** (must pass before merge): the `ci.yml` jobs — `quality` (typecheck · lint · format:check · validate:content · test · build), `docker build`, `codeql`, `gitleaks`, and `dependency-review` (PRs only).
- **Required review:** ≥ 1 CODEOWNER approval; stale approvals dismissed on new commits.
- **Conversation resolution required**; **linear history**.
- **DCO** check (sign-off required) — see `CONTRIBUTING.md`.
- Restrict who can change `.github/`, `.do/`, `Dockerfile` to infra-owners (via CODEOWNERS).

Repo-level: enable **secret scanning + push protection**, **Dependabot** (deps + actions), and CodeQL default setup or the workflow below.

## Global workflow rules
- Actions are currently pinned to **major tags** and kept current by Dependabot; **pin to full commit SHAs before enabling required status checks / branch protection**.
- **Least-privilege `permissions:`** per workflow/job (default `contents: read`; `codeql` adds `security-events: write`).
- Use `concurrency` to cancel superseded runs.
- Cache npm + Next build cache.
- `actions/checkout` with `persist-credentials: false`.

## `ci.yml` — runs on every PR and on `main`

Five jobs run in parallel. The `quality` job chains all the npm gates on one runner (shared `npm ci` + cache); the rest are independent.

| Job | Does | Phase |
|---|---|---|
| `quality` | `npm ci` → `typecheck` → `lint` → `format:check` → `validate:content` → `test` → `build` | 1 |
| `docker-build` | `docker build` the production image (no push) to prove it builds | 1 |
| `codeql` | GitHub CodeQL analysis (JS/TS); `security-events: write` | 1 |
| `gitleaks` | secret scan over full history (`fetch-depth: 0`) | 1 |
| `dependency-review` | `actions/dependency-review-action`, **PRs only** (blocks known-vuln deps) | 1 |

`validate:content` runs inside `quality` (and again inside `build`, which prepends it), so malformed `content/**` fails CI before it can reach an image.

```yaml
name: ci
on:
  pull_request:
  push: { branches: [main] }
permissions:
  contents: read
concurrency: { group: ci-${{ github.ref }}, cancel-in-progress: true }
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
        with: { persist-credentials: false }
      - uses: actions/setup-node@v6
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run format:check
      - run: npm run validate:content
      - run: npm run test
      - run: npm run build
  # docker-build, codeql, gitleaks, dependency-review run as separate jobs
  # with their own permissions (codeql: security-events: write).
```

## `deploy.yml` — on merge to `main`

Builds the `linux/amd64` image and pushes `hrm:<sha>` + `hrm:latest` to **DigitalOcean Container Registry (DOCR)**. It does **not** call `doctl apps update`: the App Platform service has **deploy-on-push enabled**, so pushing `:latest` is what triggers the redeploy. Running `apps update` from CI would overwrite the live spec.

**Why a preflight gate.** The deploy job runs in the **`prod`** GitHub Environment, and `DO_API_TOKEN` is scoped to that environment — so it is invisible to any job outside it. The `preflight` job therefore gates on the repository **variable** `DOCR_REGISTRY` (readable everywhere): if it's unset, deploy is skipped (neutral, not failed), which keeps the workflow green before DO is configured and on forks.

```yaml
name: deploy
on:
  push: { branches: [main] }
  workflow_dispatch:
permissions:
  contents: read
concurrency: { group: deploy-main, cancel-in-progress: false }
jobs:
  preflight:
    runs-on: ubuntu-latest
    outputs:
      configured: ${{ steps.check.outputs.configured }}
    steps:
      - id: check
        env: { DOCR_REGISTRY: ${{ vars.DOCR_REGISTRY }} }
        run: |
          if [ -n "$DOCR_REGISTRY" ]; then echo "configured=true" >> "$GITHUB_OUTPUT";
          else echo "configured=false" >> "$GITHUB_OUTPUT"; fi
  deploy:
    needs: preflight
    if: needs.preflight.outputs.configured == 'true'
    runs-on: ubuntu-latest
    environment: prod                       # holds the DO_API_TOKEN secret
    steps:
      - uses: actions/checkout@v6
        with: { persist-credentials: false }
      - uses: digitalocean/action-doctl@v2
        with: { token: ${{ secrets.DO_API_TOKEN }} }
      - run: doctl registry login --expiry-seconds 1200
      - name: Build & push image
        env: { REGISTRY: registry.digitalocean.com/${{ vars.DOCR_REGISTRY }}/hrm }
        run: |
          docker build -t "$REGISTRY:${{ github.sha }}" -t "$REGISTRY:latest" .
          docker push "$REGISTRY:${{ github.sha }}"
          docker push "$REGISTRY:latest"
```

- Image tagged with both the commit SHA (immutable, enables rollback) and `latest`.
- **Required config:** `DOCR_REGISTRY` repo *variable* = `human-risk-matrix-proj`; `DO_API_TOKEN` *secret* in the `prod` Environment. See `docs/secrets-management.md`.
- **Rollback:** redeploy a previous SHA from the DO dashboard (see `docs/deployment-do.md`).

## `feed-refresh.yml` — Phase 3, scheduled

```yaml
name: feed-refresh
on:
  schedule: [{ cron: '0 * * * *' }]   # hourly; tune in Phase 3
  workflow_dispatch:
permissions:
  contents: read
jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -fsS -X POST https://humanriskmatrix.org/api/feed/refresh \
            -H "authorization: Bearer ${{ secrets.FEED_REFRESH_TOKEN }}"
```

The endpoint is idempotent and token-protected (`docs/security.md`); a missed/failed run is harmless and retried next schedule.

## PR template & issue templates
- `.github/pull_request_template.md`: summary, linked issue, type (content/code), checklist (tests added, content validated, docs updated, standards followed, DCO signed).
- `.github/ISSUE_TEMPLATE/`: content proposal, bug report, feature request.

## Phasing
- **Phase 1:** `ci.yml` (all jobs) + `deploy.yml` live; governance configured.
- **Phase 2:** add modeler tests + any Turnstile/secret wiring to CI env; no new workflow.
- **Phase 3:** add `feed-refresh.yml`; deploy spec gains the Postgres component.
