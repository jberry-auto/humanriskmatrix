import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Link } from "@/components/ui/Link";
import { Section } from "@/components/ui/Section";

const roadmap: ReadonlyArray<{
  version: string;
  label: string;
  goal: string;
  detail: string;
}> = [
  {
    version: "v0.1",
    label: "This version",
    goal: "A shared vocabulary for human risk",
    detail: "Open taxonomy and interactive matrix, mapped to MITRE ATT&CK.",
  },
  {
    version: "v0.5",
    label: "Target",
    goal: "Threat-informed defense of the human layer",
    detail: "Site features that put the matrix to work for enterprises.",
  },
  {
    version: "v1.0",
    label: "Planned",
    goal: "Open and community-maintained",
    detail: "Community feedback incorporated; taxonomy stabilized.",
  },
];

const GITHUB_URL = "https://github.com/jberry-auto/humanriskmatrix";

export default function Home() {
  return (
    <div className="flex flex-col gap-24">
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

      {/* Roadmap — each milestone carries the goal it delivers */}
      <Section aria-label="Roadmap" className="items-center gap-10">
        <Heading level={2} size="kicker">
          Roadmap
        </Heading>

        <div className="relative w-full max-w-4xl">
          {/* connector rail (sm+) sits behind the centered nodes */}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-1.5 hidden h-px bg-border sm:block"
          />
          <ol className="grid gap-10 sm:grid-cols-3">
            {roadmap.map((milestone) => (
              <li key={milestone.version} className="flex flex-col items-center gap-3 text-center">
                <span
                  aria-hidden="true"
                  className="relative size-3 rounded-full border-2 border-accent bg-bg"
                />
                <div>
                  <span className="font-mono text-sm font-semibold text-accent">
                    {milestone.version}
                  </span>
                  <span className="ml-2 text-[0.7rem] uppercase tracking-[0.14em] text-faint">
                    {milestone.label}
                  </span>
                </div>
                <p className="max-w-[26ch] text-pretty font-serif text-lg font-semibold text-ink">
                  {milestone.goal}
                </p>
                <p className="max-w-[28ch] text-sm text-muted">{milestone.detail}</p>
              </li>
            ))}
          </ol>
        </div>

        <Link href={GITHUB_URL}>Follow along or contribute on GitHub</Link>
      </Section>
    </div>
  );
}
