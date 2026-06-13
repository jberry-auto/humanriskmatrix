import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Link } from "@/components/ui/Link";
import { Section } from "@/components/ui/Section";
import { Tag, type Phase } from "@/components/ui/Tag";

const phases: ReadonlyArray<{ id: Phase; name: string; columns: string }> = [
  { id: "internal", name: "Internal", columns: "1–3" },
  { id: "approach", name: "Approach", columns: "4–6" },
  { id: "deception", name: "Deception", columns: "7–8" },
  { id: "imposition", name: "Imposition", columns: "9–10" },
  { id: "alignment", name: "Alignment", columns: "11" },
];

const GITHUB_URL = "https://github.com/jberry-auto/humanriskmatrix";

export default function Home() {
  return (
    <div className="flex flex-col gap-16">
      <Section className="gap-5">
        <Eyebrow>In development · Phase 1</Eyebrow>
        <Heading level={1} size="display">
          Human Risk Matrix
        </Heading>
        <p className="max-w-2xl text-lg text-muted">
          An open taxonomy of human behavior that produces business impact — from honest mistakes to
          witting cooperation with an adversary. It unifies counterintelligence, cybersecurity,
          social-engineering defense, and safety science across{" "}
          <span className="text-ink">11 columns</span> grouped into{" "}
          <span className="text-ink">5 phases</span>.
        </p>
        <div className="pt-1">
          <Link href={GITHUB_URL}>View the source on GitHub</Link>
        </div>
      </Section>

      <Section aria-labelledby="phases-heading" className="gap-6">
        <Heading level={2} id="phases-heading" size="h3">
          The five phases
        </Heading>
        <ol className="grid gap-3 sm:grid-cols-5">
          {phases.map((phase) => (
            <li key={phase.id}>
              <Card className="flex h-full flex-col gap-3 p-4">
                <Tag phase={phase.id}>{phase.name}</Tag>
                <span className="text-sm text-muted">Columns {phase.columns}</span>
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      <Section className="gap-3">
        <Heading level={2} size="h3">
          Status
        </Heading>
        <Card className="flex max-w-2xl flex-col gap-3">
          <p className="text-muted">
            The Matrix and Theory &amp; Frameworks pages are in progress; both render from
            version-controlled, schema-validated content. The Threat Modeler and Threat Feed follow
            in later phases.
          </p>
          <Link href={GITHUB_URL}>Roadmap</Link>
        </Card>
      </Section>
    </div>
  );
}
