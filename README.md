# Human Risk Matrix

**[humanriskmatrix.org](https://humanriskmatrix.org)** — a community-maintained, source-available reference and toolset providing a comprehensive view of human risk impacting organizational systems and data confidentiality, availability, integrity, fitness for purpose, and processes — from honest mistakes to witting cooperation with an adversary. Free for noncommercial use; commercial use requires authorization (see [License](#license)).

It unifies the vocabularies of four disciplines usually kept apart — **counterintelligence** (cultivation, MICE, RASCLS), **cybersecurity** (phishing, AitM, credential abuse), **social-engineering defense** (pretexting, influence, deepfakes), and **safety science** (Swiss Cheese, ETTO, drift to danger, just culture) — into a single, ordered taxonomy that security, insider-risk, and counter-intel teams can share.

## The four pages

| # | Page | What it does | Phase |
|---|------|--------------|-------|
| 1 | **Human Risk Matrix** | The 11-category taxonomy across a spectrum of malicious intent, with concrete techniques tagged to MITRE ATT&CK. | 1 |
| 2 | **Theory & Frameworks** | The foundations — why a unified taxonomy, the substrate models, insider-threat categories, cross-disciplinary essays. | 1 |
| 3 | **Threat Modeler** | Enter a vertical or company → a generated heatmap of which matrix risks to prioritize. | 2 |
| 4 | **Threat Feed** | Curated security news, summarized and mapped to the matrix with suggested team actions. | 3 |

## The matrix at a glance

Eleven categories of human behavior, ordered along a **spectrum of malicious intent** — by **how much harmful intent drives the behavior** (not by any sequence of events) — grouped into five degrees of intent:

```
least malicious intent  ────────────────────────────────────────────────────▶  most malicious intent

UNINTENTIONAL              UNAWARE                   DECEIVED         COERCED                 COMPLICIT
(no adversary)             (observed / cultivated)   (deceived)       (pressured / forced)    (witting)
1 Accidental Disclosure    4 Reconnaissance          7 Deceptive      9 Forced Compliance     11 Coercion &
2 Hygiene & Config Drift   5 Access Development         Delivery       10 Physical Intrusion      Recruitment
3 Workarounds &            6 Elicitation             8 Impersonation
  Self-Exposure
```

## Project status & roadmap

This repository is in **Phase 1** (static Matrix + Theory). The **interactive Matrix page is live** at [humanriskmatrix.org/matrix](https://humanriskmatrix.org/matrix) — the full 160-technique taxonomy with a technique detail side-sheet and a personal environmental heatmap; the **Theory & Frameworks page is next**. The build is phased — see **[docs/roadmap.md](docs/roadmap.md)** for the dual-track (content + feature) roadmap and exit criteria per phase.

## Tech stack

Next.js (TypeScript, App Router) · content-as-code (schema-validated YAML + MDX) · Claude Haiku for the AI tools (Phases 2–3) · containerized on DigitalOcean App Platform.

## Quickstart

```bash
git clone https://github.com/jberry-auto/humanriskmatrix.git
cd humanriskmatrix
npm install
npm run dev          # → http://localhost:3000
```

Scripts: `npm run build` · `npm run start` · `npm run lint` · `npm run typecheck` · `npm run test` · `npm run validate:content`.

> Phase 1 is in progress: the scaffold, CI/CD, content pipeline, design system, and the interactive Matrix page are live; the Theory & Frameworks page is next. Build details: [docs/dev-plan/phase-1-matrix-theory.md](docs/dev-plan/phase-1-matrix-theory.md).

## Documentation

Start here, in order:

- **[docs/repo-structure.md](docs/repo-structure.md)** — where everything lives.
- **[docs/roadmap.md](docs/roadmap.md)** — phased content + feature roadmap.
- **[docs/architecture.md](docs/architecture.md)** — how the app is structured.
- **[docs/content-model.md](docs/content-model.md)** — the content schemas and how to edit content.
- **[docs/design-system.md](docs/design-system.md)** — design tokens, theming, and UI primitives.
- **[docs/dev-plan/](docs/dev-plan/)** — per-phase build specs.
- **[docs/style-guide.md](docs/style-guide.md)** + **[docs/engineering-standards/](docs/engineering-standards/)** — code, content, and language rules (the standards of record).
- Cross-cutting: [security](docs/security.md) · [reliability](docs/reliability-sre.md) · [secrets](docs/secrets-management.md) · [CI/CD](docs/cicd-github-actions.md) · [deployment](docs/deployment-do.md) · [testing](docs/testing-qa.md).

## Contributing

Content contributions — new techniques, framework essays, corrections — are reviewed on the same footing as code. Read [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/style-guide.md](docs/style-guide.md) first.

## License

This project is **source-available and noncommercial**:

- **Code** — [PolyForm Noncommercial License 1.0.0](LICENSE).
- **Taxonomy content** (`content/`) — [CC BY-NC 4.0](content/LICENSE).

Noncommercial use (personal, research, education, nonprofit, government) is free. **Commercial use requires written authorization** — contact **jacob@autopwn.sh**.

## Acknowledgements

The taxonomy stands on the work of James Reason, Erik Hollnagel, Jens Rasmussen, Sidney Dekker, Robert Cialdini, Randy Burkett, and the broader counterintelligence and safety-science communities.
