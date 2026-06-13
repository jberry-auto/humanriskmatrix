# Contributing to Human Risk Matrix

This is a public, community-maintained project. Content contributions are reviewed on the same footing as code — a corrected MITRE mapping, a new technique, or a clearer framework essay are all welcome.

By participating you agree to our [Code of Conduct](CODE_OF_CONDUCT.md).

## Two kinds of contribution

| | **Content** | **Code** |
|---|---|---|
| Examples | new/edited matrix techniques, framework essays, theory corrections, MITRE mappings | site features, bug fixes, tooling, CI |
| Lives in | `content/**` | `src/**`, `components/**`, `scripts/**`, `.github/**` |
| Reviewed by | content owners (see [CODEOWNERS](CODEOWNERS)) | code owners |
| Must pass | content schema validation | full CI (typecheck, lint, test, scans) |

When in doubt about *how to write* a contribution, read **[docs/style-guide.md](docs/style-guide.md)**.

## Before you start

- For anything non-trivial, **open an issue first** to align on the change. Large content additions and new features should be discussed before a PR.
- Check the **[roadmap](docs/roadmap.md)** — your idea may already be planned, and the current phase tells you what's in scope.

## Contribution workflow

1. **Fork** the repo and create a topic branch from `main`:
   - content: `content/<short-description>` (e.g., `content/add-quishing-technique`)
   - code: `feat/<short-description>` or `fix/<short-description>`
2. **Make your change.** Keep it focused — one logical change per PR.
3. **Run the checks locally** before pushing (see below).
4. **Sign your commits** with the Developer Certificate of Origin (DCO): commit with `git commit -s`. This adds a `Signed-off-by:` line certifying you have the right to submit the work.
5. **Open a Pull Request** against `main`. Fill out the PR template. Link the issue it closes.
6. **CI must pass and a CODEOWNER must approve.** `main` is protected — no direct pushes, required status checks, required review.

## Editing content

Content is **version-controlled and schema-validated**. The canonical source is the committed **`content/`** tree; you edit those files **directly**. (`content/` was initially seeded from a local working spreadsheet via `scripts/import-xlsx.ts`; that spreadsheet is git-ignored and not part of the repo — the importer is a maintainer-only bootstrap tool, not something contributors run.)

- **Add/edit a matrix technique:** edit the relevant `content/matrix/columns/NN-*.yaml`. Each technique is `{ label, mitreId }` — use the real MITRE ATT&CK technique ID (e.g., `T1566.001`) or `null` if uncoded. See [docs/content-model.md](docs/content-model.md) and [docs/style-guide.md](docs/style-guide.md).
- **Add/edit a framework or theory essay:** edit/add an MDX file under `content/frameworks/` or `content/theory/` with the required frontmatter.
- **Validation:** `npm run validate:content` must pass. CI runs the same check and **a malformed content file fails the build** — this is intentional. The error message tells you which field is wrong.
- **Cite sources** for claims, especially MITRE mappings and attributed models.

## Running checks locally

```bash
npm install
npm run typecheck        # tsc --noEmit
npm run lint             # eslint + prettier check
npm run test             # vitest
npm run validate:content # zod validation of content/**
npm run build            # next build (also fails on bad content)
```

(Scripts are defined once Phase 1 code lands; see [docs/dev-plan/phase-1-matrix-theory.md](docs/dev-plan/phase-1-matrix-theory.md).)

## Review expectations

- Be responsive to review feedback; reviewers will be respectful of your time.
- Content claims must be accurate and, where attributed, correctly sourced.
- Code must follow [docs/style-guide.md](docs/style-guide.md) and the engineering standards. Reviewers will check for: input validation, error handling, types, no hardcoded values, tests, and the layering rule.
- The AI tools are decision aids, not authorities — contributions must preserve clear "model-generated" labeling and responsible-use framing.

## Reporting security issues

**Do not open a public issue for security vulnerabilities.** See [docs/security.md](docs/security.md) for the private disclosure process.

## Licensing of contributions

This project is source-available and noncommercial. By contributing you agree that your **code** is licensed under the [PolyForm Noncommercial License 1.0.0](LICENSE) and your **content** under [CC BY-NC 4.0](content/LICENSE), and that the maintainers may also offer the project (including your contribution) under separate **commercial** licenses. If you cannot agree to those terms, please do not submit a contribution.
