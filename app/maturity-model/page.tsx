import type { Metadata } from "next";

import { MaturityAssessment } from "@/components/maturity/MaturityAssessment";
import { MaturityPhases } from "@/components/maturity/MaturityPhases";
import { MaturityTimeline } from "@/components/maturity/MaturityTimeline";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Link } from "@/components/ui/Link";
import { Section } from "@/components/ui/Section";
import { loadContent } from "@/lib/content/load";

export const metadata: Metadata = {
  title: "Maturity Model",
  description:
    "The Human Risk Maturity Model — five levels for maturing a human-risk program, from compliance training to a proactive human-risk program, with a track and a realistic ceiling for each organization size.",
};

export default function MaturityModelPage() {
  const { maturitySegments, maturityLevels } = loadContent();

  return (
    <div className="flex flex-col gap-12">
      <Section>
        <Eyebrow>Human risk program maturity</Eyebrow>
        <Heading level={1} size="display">
          Human Risk Maturity Model
        </Heading>
        <p className="max-w-2xl text-muted">
          The <Link href="/matrix">Human Risk Matrix</Link> shows which behaviors create risk. This
          model shows how a security program matures against them, in five levels. A program starts
          with compliance training, then learns to manage behavior: it maps the threats it faces to
          the behaviors that drive them, trains on those behaviors, measures them, and drives risky
          behavior down over time. The last step is the hardest: finding the rare, high-fidelity
          signals of malicious intent hidden in the noise, where insider-threat and
          counter-intelligence work sits.
        </p>
        <p className="max-w-2xl text-muted">
          Not every organization can build the same capability. Each level lists what it looks like
          for a small business, a mid-size company, and an enterprise. Each size has a ceiling:
          small stops at Level 3, mid-size at Level 4, enterprise at Level 5. Above the ceiling, you
          transfer, outsource, or accept the risk.
        </p>
        <MaturityPhases levels={maturityLevels} />
      </Section>

      <Section aria-label="The five levels">
        <Heading level={2} size="h2">
          The five levels
        </Heading>
        <MaturityTimeline levels={maturityLevels} segments={maturitySegments} />
      </Section>

      <MaturityAssessment segments={maturitySegments} levels={maturityLevels} />
    </div>
  );
}
