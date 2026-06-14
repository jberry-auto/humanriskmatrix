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

const goals: ReadonlyArray<string> = [
  "Give security, insider-risk, and counter-intelligence teams one shared vocabulary for human risk.",
  "Connect every behavior to defensive frameworks and to MITRE ATT&CK so the taxonomy is actionable.",
  "Stay open and community-maintained — improved through review and pull requests.",
  "Help enterprises advance threat-informed defense of the human layer.",
];

const roadmap: ReadonlyArray<{ version: string; label: string; description: string }> = [
  {
    version: "v0.1",
    label: "This version",
    description:
      "Ideation and community feedback — the taxonomy and the interactive matrix, in the open.",
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
    <div className="flex flex-col gap-20">
      {/* Hero — text left, illustration blended on the right */}
      <Section className="grid items-center gap-8 pt-2 md:grid-cols-2 md:gap-12 md:pt-6">
        <div className="flex flex-col items-start gap-5">
          <Eyebrow>Open taxonomy of human risk</Eyebrow>
          <Heading level={1} size="display">
            Human Risk Matrix Project
          </Heading>
          <p className="max-w-xl text-lg text-muted">
            A comprehensive view of human risk — from honest mistakes to witting cooperation with an
            adversary — arranged along a{" "}
            <span className="text-ink">spectrum of malicious intent</span>.
          </p>
          <Link href="/matrix" variant="button" className="mt-1">
            View Matrix
          </Link>
        </div>
        <div aria-hidden="true" className="hero-art" />
      </Section>

      {/* Five degrees of intent */}
      <Section aria-labelledby="degrees-heading" className="items-center gap-6">
        <Heading level={2} id="degrees-heading" size="h3" className="text-center">
          The five degrees of intent
        </Heading>
        <p className="text-center text-muted">
          The 11 categories of behavior are grouped into five degrees of intent, read left to right
          from least to most malicious.
        </p>
        <ol className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {degrees.map((degree) => (
            <li key={degree.id}>
              <Link
                href="/matrix"
                variant="nav"
                aria-label={`Open the Matrix — ${degree.name}`}
                className="group block h-full"
              >
                <Card className="flex h-full flex-col gap-2 p-4 transition-colors group-hover:border-border-strong">
                  <Tag degree={degree.id}>{degree.name}</Tag>
                  <span className="text-xs text-faint">Categories {degree.categories}</span>
                  <p className="text-sm text-muted">{degree.description}</p>
                </Card>
              </Link>
            </li>
          ))}
        </ol>
        <p className="text-sm text-faint">Least malicious intent → most malicious intent</p>
      </Section>

      {/* About + Roadmap — combined */}
      <Section aria-labelledby="about-heading" className="mx-auto w-full max-w-5xl gap-10">
        <Heading level={2} id="about-heading" size="h2" className="text-center">
          About the Human Risk Matrix Project
        </Heading>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="flex flex-col gap-3">
            <Heading level={3} size="h4">
              About the project
            </Heading>
            <p className="text-muted">
              An open, community-maintained reference for understanding human risk impacting
              organizational systems and data confidentiality, availability, integrity, fitness for
              purpose, and processes. It organizes behavior as a spectrum of malicious intent — not
              a timeline — and unifies counterintelligence, cybersecurity, social-engineering
              defense, and safety science into a single map teams can share. Concrete techniques are
              mapped to MITRE ATT&amp;CK where coded, and to the substrate models that explain why
              people act.
            </p>
          </Card>
          <Card className="flex flex-col gap-3">
            <Heading level={3} size="h4">
              Project goals
            </Heading>
            <ul className="flex flex-col gap-2 text-muted">
              {goals.map((goal) => (
                <li key={goal} className="flex gap-2.5">
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-accent"
                  />
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Heading level={3} size="h4" className="text-center">
            Roadmap
          </Heading>
          <div className="relative w-full">
            {/* connector rail (sm+) sits at the dot centers */}
            <span
              aria-hidden="true"
              className="absolute left-0 right-0 top-1.5 hidden h-px bg-border-strong sm:block"
            />
            <ol className="grid gap-8 sm:grid-cols-3">
              {roadmap.map((milestone) => (
                <li key={milestone.version} className="flex flex-col gap-3">
                  <span
                    aria-hidden="true"
                    className="relative size-3 rounded-full border-2 border-accent bg-bg"
                  />
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <span className="font-mono text-sm font-semibold text-accent">
                      {milestone.version}
                    </span>
                    <span className="text-xs uppercase tracking-[0.12em] text-faint">
                      {milestone.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted">{milestone.description}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="text-center">
            <Link href={GITHUB_URL}>Follow along or contribute on GitHub</Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
