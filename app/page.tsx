import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Link } from "@/components/ui/Link";
import { Section } from "@/components/ui/Section";
import { Tag, type Degree } from "@/components/ui/Tag";

const degrees: ReadonlyArray<{ id: Degree; name: string; categories: string }> = [
  { id: "internal", name: "Internal", categories: "1–3" },
  { id: "approach", name: "Approach", categories: "4–6" },
  { id: "deception", name: "Deception", categories: "7–8" },
  { id: "imposition", name: "Imposition", categories: "9–10" },
  { id: "alignment", name: "Alignment", categories: "11" },
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
        <p className="max-w-4xl text-lg text-muted">
          An open taxonomy providing a comprehensive view of human risk impacting organizational
          systems and data confidentiality, availability, integrity, fitness for purpose, and
          processes — from honest mistakes to witting cooperation with an adversary. It unifies
          counterintelligence, cybersecurity, social-engineering defense, and safety science across{" "}
          <span className="text-ink">11 categories of behavior</span>, arranged along a{" "}
          <span className="text-ink">spectrum of malicious intent</span>.
        </p>
        <p className="max-w-4xl text-muted">
          The matrix is read left to right, not as a sequence of events: the left is accidental,
          non-malicious behavior that can still lead to a breach or data loss; the right is fully
          witting cooperation with an adversary. Position reflects how much malicious intent drives
          the behavior — nothing about a timeline.
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1">
          <Link href="/matrix" variant="nav" className="font-medium text-accent">
            Open the Matrix
          </Link>
          <Link href={GITHUB_URL}>View the source on GitHub</Link>
        </div>
      </Section>

      <Section aria-labelledby="degrees-heading" className="gap-6">
        <Heading level={2} id="degrees-heading" size="h3">
          The spectrum of intent
        </Heading>
        <p className="max-w-3xl text-muted">
          The 11 categories are grouped into five degrees of intent, from least to most malicious.
        </p>
        <ol className="grid gap-3 sm:grid-cols-5">
          {degrees.map((degree) => (
            <li key={degree.id}>
              <Card className="flex h-full flex-col gap-3 p-4">
                <Tag degree={degree.id}>{degree.name}</Tag>
                <span className="text-sm text-muted">Categories {degree.categories}</span>
              </Card>
            </li>
          ))}
        </ol>
        <p className="text-sm text-faint">Least malicious intent → most malicious intent</p>
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
