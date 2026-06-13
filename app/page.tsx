import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Link } from "@/components/ui/Link";
import { Section } from "@/components/ui/Section";
import { Tag, type Degree } from "@/components/ui/Tag";

const degrees: ReadonlyArray<{
  id: Degree;
  name: string;
  categories: string;
  description: string;
}> = [
  {
    id: "unintentional",
    name: "Unintentional",
    categories: "1–3",
    description: "Honest mistakes, habit, and convenience — no adversary, no malicious intent.",
  },
  {
    id: "unaware",
    name: "Unaware",
    categories: "4–6",
    description: "Being observed or cultivated by an adversary, without knowing you're a target.",
  },
  {
    id: "deceived",
    name: "Deceived",
    categories: "7–8",
    description: "Acting on a lie you believe is true.",
  },
  {
    id: "coerced",
    name: "Coerced",
    categories: "9–10",
    description: "Acting under pressure, force, or confusion.",
  },
  {
    id: "complicit",
    name: "Complicit",
    categories: "11",
    description: "Knowingly aligned with an adversary.",
  },
];

const theory: ReadonlyArray<string> = [
  "Unifies four disciplines usually kept apart — counterintelligence, cybersecurity, social-engineering defense, and safety science — into one shared vocabulary.",
  "Organizes behavior as a spectrum of malicious intent, not a timeline: accidental error and witting collusion sit on a single continuum.",
  "Maps concrete techniques to MITRE ATT&CK where coded, so it connects to the tooling teams already use.",
  "Draws on established substrate models (MICE, RASCLS, Cialdini, Swiss Cheese, ETTO, drift-to-danger, just culture) to explain why people act.",
];

const roadmap: ReadonlyArray<{ version: string; label: string; description: string }> = [
  {
    version: "v0.1",
    label: "This version",
    description:
      "Ideation and community feedback — publish the taxonomy and the interactive matrix, and gather input from practitioners across disciplines.",
  },
  {
    version: "v0.5",
    label: "Target",
    description:
      "Additional site features that help enterprises put the matrix to work for threat-informed defense.",
  },
  {
    version: "v1.0",
    label: "Planned",
    description:
      "Community feedback incorporated, with the taxonomy stabilized for broad reference use.",
  },
];

const GITHUB_URL = "https://github.com/jberry-auto/humanriskmatrix";

export default function Home() {
  return (
    <div className="flex flex-col gap-16">
      <Section className="gap-5">
        <Eyebrow>v0.1 · In development</Eyebrow>
        <Heading level={1} size="display">
          Human Risk Matrix
        </Heading>
        <p className="max-w-4xl text-lg text-muted">
          An open taxonomy providing a comprehensive view of human risk impacting organizational
          systems and data confidentiality, availability, integrity, fitness for purpose, and
          processes — from honest mistakes to witting cooperation with an adversary, arranged along
          a <span className="text-ink">spectrum of malicious intent</span>.
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1">
          <Link href="/matrix" variant="nav" className="font-medium text-accent">
            Open the Matrix
          </Link>
          <Link href={GITHUB_URL}>View the source on GitHub</Link>
        </div>
      </Section>

      <Section aria-labelledby="about-heading" className="gap-6">
        <Heading level={2} id="about-heading" size="h3">
          About the Human Risk Matrix
        </Heading>
        <p className="max-w-3xl text-muted">
          The Human Risk Matrix is an open, community-maintained reference for understanding human
          risk end to end. Its goal is to give security, insider-risk, and counter-intelligence
          teams a shared vocabulary and a single map of the behaviors that put organizations at risk
          — so accidental and adversarial harm can be reasoned about together.
        </p>
        <ul className="flex max-w-3xl flex-col gap-2 text-muted">
          {theory.map((point) => (
            <li key={point} className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
              <span>{point}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3 pt-2">
          <p className="text-sm text-muted">
            The 11 categories of behavior are grouped into five degrees of intent, read left to
            right from least to most malicious:
          </p>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {degrees.map((degree) => (
              <li key={degree.id}>
                <Card className="flex h-full flex-col gap-2 p-4">
                  <Tag degree={degree.id}>{degree.name}</Tag>
                  <span className="text-xs text-faint">Categories {degree.categories}</span>
                  <p className="text-sm text-muted">{degree.description}</p>
                </Card>
              </li>
            ))}
          </ol>
          <p className="text-sm text-faint">Least malicious intent → most malicious intent</p>
        </div>
      </Section>

      <Section aria-labelledby="roadmap-heading" className="gap-6">
        <Heading level={2} id="roadmap-heading" size="h3">
          Human Risk Matrix roadmap
        </Heading>
        <ol className="relative flex max-w-3xl flex-col gap-8 border-l border-border pl-6">
          {roadmap.map((milestone) => (
            <li key={milestone.version} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-[1.6875rem] top-1 size-3 rounded-full border-2 border-accent bg-bg"
              />
              <div className="flex flex-wrap items-baseline gap-x-3">
                <span className="font-mono text-sm font-semibold text-accent">
                  {milestone.version}
                </span>
                <span className="text-xs uppercase tracking-[0.12em] text-faint">
                  {milestone.label}
                </span>
              </div>
              <p className="mt-1 text-muted">{milestone.description}</p>
            </li>
          ))}
        </ol>
        <Link href={GITHUB_URL}>Follow along or contribute on GitHub</Link>
      </Section>
    </div>
  );
}
