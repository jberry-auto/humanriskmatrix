import type { Metadata } from "next";

import { MaturityAssessment } from "@/components/maturity/MaturityAssessment";
import { MaturityLadder } from "@/components/maturity/MaturityLadder";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Link } from "@/components/ui/Link";
import { Section } from "@/components/ui/Section";
import { loadContent } from "@/lib/content/load";

export const metadata: Metadata = {
  title: "Maturity Model",
  description:
    "The Human Risk Maturity Model — five levels of threat-informed human-risk defense, from compliance-driven awareness to adaptive counter-intelligence, woven through with counter-intelligence and broken out by organization size.",
};

export default function MaturityModelPage() {
  const { maturitySegments, maturityLevels } = loadContent();

  return (
    <div className="flex flex-col gap-12">
      <Section>
        <Eyebrow>Threat-informed defense of the human layer</Eyebrow>
        <Heading level={1} size="display">
          Human Risk Maturity Model
        </Heading>
        <p className="max-w-2xl text-muted">
          The <Link href="/matrix">Human Risk Matrix</Link> tells you which human behaviors create
          risk. This model tells you how a program matures against them — applying{" "}
          <strong className="font-medium text-ink">threat-informed defense</strong>: using the
          matrix as the knowledge base to prioritize and measure your defenses, across five levels.
        </p>
        <p className="max-w-2xl text-muted">
          Maturity is a shift in posture that tracks rightward across the matrix&rsquo;s spectrum of
          intent — from compliance-driven awareness to operational counter-intelligence.
          Counter-intelligence is woven through every level and is the destination, and the four
          countermeasure modes (educate, evaluate, monitor, intervene) switch on as you climb.
          Because not every organization can build a dedicated insider-threat or CI team, each level
          breaks out by size, and each segment tops out at a realistic cap:
        </p>
        <ul className="flex flex-col gap-1 text-sm text-muted sm:flex-row sm:flex-wrap sm:gap-x-6">
          {maturitySegments.map((segment) => (
            <li key={segment.id}>
              <span className="font-medium text-ink">{segment.name}</span> — caps at Level{" "}
              {segment.cap}
            </li>
          ))}
        </ul>
      </Section>

      <Section aria-label="The maturity ladder">
        <Heading level={2} size="h2">
          The ladder
        </Heading>
        <MaturityLadder levels={maturityLevels} segments={maturitySegments} />
      </Section>

      <MaturityAssessment segments={maturitySegments} levels={maturityLevels} />
    </div>
  );
}
