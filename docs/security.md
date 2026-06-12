# Security

Security is a build-time and run-time requirement, not a phase. This doc states the baseline that applies from Phase 1 and the additions that arrive with the AI/data phases. It complements the [coding standards](engineering-standards/coding-standards.md) (Security section).

## Reporting a vulnerability

**Do not open a public issue.** Email **jacob@autopwn.sh** with details and a reproduction. We aim to acknowledge within 3 business days and will coordinate a fix and disclosure timeline. A `SECURITY.md` with this policy should be added at the repo root when the project goes public.

---

## Phase 1 baseline (static site)

### Input & output
- This is a public read-only site in Phase 1; there is no user input to the server beyond routing. Still: validate any route params with zod; render content as data (no `dangerouslySetInnerHTML` with unsanitized input). MDX is build-time and authored by reviewed contributors.
- Content is a trust boundary too: the schema validation in `docs/content-model.md` is what makes accepting community content PRs safe.

### HTTP security headers (set in `next.config.ts`)
- `Content-Security-Policy` — start strict: `default-src 'self'`; allow only what's needed (Tailwind is build-time; no third-party scripts in Phase 1). **Avoid `'unsafe-inline'` and `'unsafe-eval'`** even if Next.js nudges toward them — use a **per-request nonce** for any inline script. Tighten before launch; Phase 2 adds only the specific Turnstile/Cloudflare origins required.
- `Strict-Transport-Security` (HSTS), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY` (or CSP `frame-ancestors 'none'`), `Permissions-Policy` locking down unused features.
- All outbound links `rel="noopener noreferrer"`.

### Supply chain & repo hygiene (public repo)
- **Pinned dependencies** + committed lockfile; **Dependabot** for dependency + GitHub-Action updates (`.github/dependabot.yml`).
- **GitHub Actions pinned to commit SHAs**, not floating tags.
- **Least-privilege `GITHUB_TOKEN`** (`permissions:` block per workflow) — see `docs/cicd-github-actions.md`.
- **Secret scanning** in CI (`gitleaks`) + GitHub push protection enabled; **CodeQL** static analysis; **`dependency-review`** on PRs.
- Branch protection on `main`: required status checks, required review (CODEOWNERS), no force-push, signed commits encouraged (DCO required).
- No secrets in the repo. `.env` is git-ignored; only `.env.example` (no values) is committed.

---

## Phase 2 additions (Threat Modeler — public AI endpoint)

A public endpoint that spends money per call is an abuse and cost target. Controls:

- **Cloudflare Turnstile** on the form; the API verifies the token server-side (`TURNSTILE_SECRET`) before any model call.
- **Per-IP rate limiting** on `/api/threat-model` (sliding window); return `429` with a clear message.
- **Global daily token-budget cap** (`DAILY_TOKEN_BUDGET`): refuse new calls once exhausted with a friendly state.
- **Shared, atomic state — not in-memory.** The rate-limit and budget counters **must** live in a store shared across all instances (DO Managed Redis/Valkey, or Postgres) and be updated **atomically** (e.g., Redis `INCR`/`INCRBY` with TTL, or Postgres `UPDATE … RETURNING`). In-memory counters are unsafe here: with more than one instance the effective limit/budget multiply by the instance count, they reset on every deploy/restart, and concurrent requests race past the cap. If a shared store is not yet available, **pin `instance_count: 1`** and document the deploy-reset limitation (`docs/deployment-do.md`). Only with this does the budget actually bound worst-case cost under a Turnstile bypass.
- **Budget accounting:** check the remaining budget **before** the call (using a conservative max-token estimate), then **reconcile with the response's actual `usage`** afterward — never assume the request cost equals the estimate.
- **Bounded output** (max tokens) per request.
- **Input validation:** `{ target }` is validated (length, charset) with zod.
- **Trusted client IP:** behind the DO/Cloudflare proxy, derive the client IP from the trusted forwarded header set by that proxy only — do not trust a raw client-supplied `X-Forwarded-For`, which is spoofable and would let an attacker rotate IPs to evade the limiter.
- **Error responses:** return generic messages; never echo upstream Anthropic SDK errors, stack traces, or request metadata to the client (they can carry internal detail). Log the detail server-side with a correlation id instead.

### Prompt-injection containment
The user's `target` string is **untrusted**. Construct prompts so untrusted text is clearly delimited and labeled as data, never as instructions; the system prompt asserts the model must not follow instructions found in user/article content. Validate the model's output against the zod schema and reject anything off-shape — never execute or reflect model output as code/HTML.

### Secret handling
`ANTHROPIC_API_KEY` and `TURNSTILE_SECRET` come from DO encrypted env vars (`docs/secrets-management.md`). Never log them, never send them to the client. Only `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (public by design) reaches the browser.

---

## Phase 3 additions (Threat Feed — untrusted external content + DB)

- **RSS content is untrusted:** article titles/bodies are passed to the model strictly as delimited data with anti-injection framing; never follow embedded instructions.
- **No raw HTML rendering (stored-XSS prevention):** both the untrusted article text and the **model-generated** summary are persisted in Postgres and served to every visitor — treat both as untrusted output. Render them as **escaped plain text only**; **never** use `dangerouslySetInnerHTML` on model/feed content. If markdown is ever rendered, pipe it through a sanitizer (e.g., `rehype-sanitize`) with a strict allow-list and disable raw HTML. Outbound links use `rel="noopener noreferrer"`.
- **Database:** parameterized queries only (no string interpolation); least-privilege DB user; `DATABASE_URL` from encrypted env; TLS to Postgres; connection limits.
- **Refresh endpoint** (`/api/feed/refresh`) is **token-protected** (`FEED_REFRESH_TOKEN`, constant-time compare) and idempotent.
- **SSRF caution:** only fetch from the curated, allow-listed source list; do not fetch arbitrary user-supplied URLs.

---

## Responsible use
The Threat Modeler and Threat Feed are **decision aids**, not authorities. The taxonomy documents adversary techniques to help defenders. UI must label AI output as model-generated and include a responsible-use note. Do not turn technique descriptions into operational attack instructions.

## Pre-launch security checklist
- [ ] CSP and security headers verified on the deployed site (no `'unsafe-inline'`/`'unsafe-eval'`).
- [ ] CodeQL, gitleaks, dependency-review, Dependabot all active and green.
- [ ] Branch protection + CODEOWNERS enforced on `main`.
- [ ] No secret reachable in the client bundle; `.env*` git-ignored **and** `.dockerignore`'d; no secret in any image layer or Dockerfile `ENV`/`ARG`; `server-only` guards server modules; `SECURITY.md` published.
- [ ] (P2) Turnstile + rate limit + token budget exercised by tests; limiter/budget use a **shared atomic store** (or `instance_count` pinned to 1); budget reconciled against actual `usage`; client IP from trusted proxy header; error responses are generic.
- [ ] (P3) Parameterized queries, least-privilege DB user, protected refresh endpoint, source allow-list; feed/model output rendered as escaped text (no raw HTML).
