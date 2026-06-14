import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Link } from "@/components/ui/Link";
import { Section } from "@/components/ui/Section";

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
          <p className="max-w-2xl text-lg text-muted">
            An open taxonomy providing a comprehensive view of human risk impacting organizational
            systems and data confidentiality, availability, integrity, fitness for purpose, and
            processes — from honest mistakes to witting cooperation with an adversary, arranged
            along a <span className="text-ink">spectrum of malicious intent</span>.
          </p>
          <Link href="/matrix" variant="button" className="mt-1">
            View Matrix
          </Link>
        </div>
        <div aria-hidden="true" className="hero-art" />
      </Section>

      {/* About + Roadmap — combined */}
      <Section aria-label="About the Human Risk Matrix Project" className="w-full gap-12">
        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          <div className="flex flex-col gap-4">
            <Heading level={2} size="h3" className="border-b border-border pb-2">
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
          </div>
          <div className="flex flex-col gap-4">
            <Heading level={2} size="h3" className="border-b border-border pb-2">
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
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <Heading level={2} size="h3" className="text-center">
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
