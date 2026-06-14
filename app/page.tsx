import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Link } from "@/components/ui/Link";
import { Section } from "@/components/ui/Section";

const goals: ReadonlyArray<string> = [
  "A shared vocabulary for human risk across teams",
  "Every behavior mapped to MITRE ATT&CK",
  "Open and community-maintained",
  "Built for threat-informed defense of the human layer",
];

const roadmap: ReadonlyArray<{ version: string; label: string; description: string }> = [
  {
    version: "v0.1",
    label: "This version",
    description: "Taxonomy and interactive matrix, in the open.",
  },
  {
    version: "v0.5",
    label: "Target",
    description: "Site features for enterprise threat-informed defense.",
  },
  {
    version: "v1.0",
    label: "Planned",
    description: "Community feedback incorporated; taxonomy stabilized.",
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

      {/* About + Roadmap — editorial, centered */}
      <Section aria-label="About the Human Risk Matrix Project" className="items-center gap-16">
        {/* About */}
        <div className="flex max-w-2xl flex-col items-center gap-4 text-center">
          <Heading level={2} size="kicker">
            About
          </Heading>
          <p className="text-pretty text-muted">
            An open, community-maintained reference that unifies four disciplines usually kept apart
            — counterintelligence, cybersecurity, social-engineering defense, and safety science —
            into one shared map. It treats behavior as a spectrum of malicious intent rather than a
            timeline, and ties each technique to MITRE ATT&amp;CK and to the substrate models that
            explain why people act.
          </p>
        </div>

        {/* Goals */}
        <div className="flex flex-col items-center gap-4 text-center">
          <Heading level={2} size="kicker">
            Goals
          </Heading>
          <ul className="flex flex-col gap-2 text-left text-muted">
            {goals.map((goal) => (
              <li key={goal} className="flex gap-3">
                <span aria-hidden="true" className="text-faint">
                  —
                </span>
                <span>{goal}</span>
              </li>
            ))}
          </ul>
        </div>

        <hr className="w-full max-w-2xl border-border" />

        {/* Roadmap */}
        <div className="flex w-full max-w-3xl flex-col items-center gap-8">
          <Heading level={2} size="kicker">
            Roadmap
          </Heading>
          <div className="relative w-full">
            {/* connector rail (sm+) sits behind the centered nodes */}
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-1.5 hidden h-px bg-border sm:block"
            />
            <ol className="grid gap-10 sm:grid-cols-3">
              {roadmap.map((milestone) => (
                <li
                  key={milestone.version}
                  className="flex flex-col items-center gap-3 text-center"
                >
                  <span
                    aria-hidden="true"
                    className="relative size-3 rounded-full border-2 border-accent bg-bg"
                  />
                  <div>
                    <div className="font-mono text-sm font-semibold text-accent">
                      {milestone.version}
                    </div>
                    <div className="mt-1 text-[0.7rem] uppercase tracking-[0.14em] text-faint">
                      {milestone.label}
                    </div>
                  </div>
                  <p className="max-w-[24ch] text-sm text-muted">{milestone.description}</p>
                </li>
              ))}
            </ol>
          </div>
          <Link href={GITHUB_URL}>Follow along or contribute on GitHub</Link>
        </div>
      </Section>
    </div>
  );
}
