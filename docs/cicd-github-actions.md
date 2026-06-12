# CI/CD — GitHub Actions

This is a **public repo accepting community PRs**, so CI is the gate that protects quality and `main`. Strict PR governance + strong CI runs from day one (Phase 1); deploy automates on merge; the feed cron arrives in Phase 3.

## Branch protection & governance (`main`)

Configure on the GitHub repo (document, since it's not code):
- **No direct pushes**; all changes via PR. No force-push, no branch deletion.
- **Required status checks** (must pass before merge): `typecheck`, `lint`, `test`, `validate-content`, `codeql`, `dependency-review`, `gitleaks`, `docker-build`.
- **Required review:** ≥ 1 CODEOWNER approval; stale approvals dismissed on new commits.
- **Conversation resolution required**; **linear history**.
- **DCO** check (sign-off required) — see `CONTRIBUTING.md`.
- Restrict who can change `.github/`, `.do/`, `Dockerfile` to infra-owners (via CODEOWNERS).

Repo-level: enable **secret scanning + push protection**, **Dependabot** (deps + actions), and CodeQL default setup or the workflow below.

## Global workflow rules
- **Pin every action to a commit SHA** (not `@v4`).
- **Least-privilege `permissions:`** per workflow/job (default `contents: read`; add only what a job needs).
- Use `concurrency` to cancel superseded runs.
- Cache npm + Next build cache.
- `actions/checkout` with `persist-credentials: false` where possible.

## `ci.yml` — runs on every PR and on `main`

Jobs (parallel where possible):

| Job | Does | Phase |
|---|---|---|
| `typecheck` | `npm ci` → `npm run typecheck` (`tsc --noEmit`) | 1 |
| `lint` | ESLint (incl. layering `no-restricted-imports`) + Prettier check | 1 |
| `test` | `npm run test` (Vitest) with coverage | 1 |
| `validate-content` | `npm run validate:content` (zod over `content/**`) | 1 |
| `codeql` | GitHub CodeQL analysis (JS/TS) | 1 |
| `dependency-review` | `actions/dependency-review-action` on PRs (block known-vuln deps) | 1 |
| `gitleaks` | secret scan of the diff/history | 1 |
| `docker-build` | `docker build` the production image (no push) to prove it builds | 1 |

Sketch (illustrative — pin SHAs, fill matrix):

```yaml
name: ci
on:
  pull_request:
  push: { branches: [main] }
permissions:
  contents: read
concurrency: { group: ci-${{ github.ref }}, cancel-in-progress: true }
jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@<sha>
      - uses: actions/setup-node@<sha>
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run validate:content
      - run: npm run test -- --coverage
      - run: docker build -t hrm:ci .
  # codeql, dependency-review, gitleaks as separate jobs/workflows with their own permissions
```

## `deploy.yml` — on merge to `main`

Builds the image, pushes to **DigitalOcean Container Registry (DOCR)**, and deploys the App Platform app. Uses `DO_API_TOKEN` (GitHub Actions secret).

```yaml
name: deploy
on:
  push: { branches: [main] }
permissions:
  contents: read
concurrency: { group: deploy-main, cancel-in-progress: false }
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production        # optional manual approval gate
    steps:
      - uses: actions/checkout@<sha>
      - uses: digitalocean/action-doctl@<sha>
        with: { token: ${{ secrets.DO_API_TOKEN }} }
      - run: doctl registry login
      - run: docker build -t registry.digitalocean.com/<registry>/hrm:${{ github.sha }} -t registry.digitalocean.com/<registry>/hrm:latest .
      - run: docker push registry.digitalocean.com/<registry>/hrm:${{ github.sha }}
      - run: docker push registry.digitalocean.com/<registry>/hrm:latest
      - run: doctl apps update <APP_ID> --spec .do/app.yaml   # or trigger a deployment
```

- Image tagged with both the commit SHA (immutable, enables rollback) and `latest`.
- **Rollback:** redeploy a previous SHA tag (see `docs/reliability-sre.md`).
- Use a GitHub **environment** (`production`) with an optional required reviewer for the deploy step (the "full GitOps" rigor).

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
