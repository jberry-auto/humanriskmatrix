import type { Metadata } from "next";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { Disclosure } from "@/components/ui/Disclosure";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Link } from "@/components/ui/Link";
import { Section } from "@/components/ui/Section";
import { Tabs } from "@/components/ui/Tabs";
import { Tag, type Degree } from "@/components/ui/Tag";
import { TextField } from "@/components/ui/TextField";

export const metadata: Metadata = {
  title: "Style guide",
  robots: { index: false, follow: false },
};

const degrees: ReadonlyArray<Degree> = [
  "internal",
  "approach",
  "deception",
  "imposition",
  "alignment",
];

export default function StyleGuide() {
  return (
    <div className="flex flex-col gap-16">
      <Section className="gap-2">
        <Eyebrow>Internal</Eyebrow>
        <Heading level={1} size="h1">
          Design system
        </Heading>
        <p className="text-muted">
          Living reference for tokens and components. See docs/design-system.md.
        </p>
      </Section>

      <Section className="gap-4">
        <Heading level={2} size="h3">
          Buttons
        </Heading>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button isDisabled>Disabled</Button>
          <Button size="sm">Small</Button>
        </div>
      </Section>

      <Section className="gap-4">
        <Heading level={2} size="h3">
          Intent-degree tags
        </Heading>
        <div className="flex flex-wrap gap-2">
          {degrees.map((degree) => (
            <Tag key={degree} degree={degree}>
              {degree}
            </Tag>
          ))}
        </div>
      </Section>

      <Section className="gap-4">
        <Heading level={2} size="h3">
          Disclosure
        </Heading>
        <div className="max-w-xl">
          <Disclosure title="What is a degree of intent?">
            Degrees of intent group the 11 categories along a spectrum of malicious intent — from
            accidental, non-malicious behavior to witting cooperation with an adversary.
          </Disclosure>
          <Disclosure title="What is a technique?">
            A concrete behavior, often mapped to a MITRE ATT&amp;CK technique.
          </Disclosure>
        </div>
      </Section>

      <Section className="gap-4">
        <Heading level={2} size="h3">
          Tabs
        </Heading>
        <Tabs
          label="Example tabs"
          items={[
            {
              id: "a",
              label: "Overview",
              content: <p className="text-muted">Overview content.</p>,
            },
            { id: "b", label: "Details", content: <p className="text-muted">Detailed content.</p> },
          ]}
        />
      </Section>

      <Section className="gap-4">
        <Heading level={2} size="h3">
          Dialog &amp; form field
        </Heading>
        <Dialog trigger={<Button>Open dialog</Button>} title="Example dialog">
          <div className="flex flex-col gap-4">
            <p>React Aria handles focus trapping, escape to close, and scroll lock.</p>
            <TextField label="Your name" description="A demo field." placeholder="Ada Lovelace" />
          </div>
        </Dialog>
      </Section>

      <Section className="gap-4">
        <Heading level={2} size="h3">
          Card &amp; link
        </Heading>
        <Card className="flex max-w-md flex-col gap-2">
          <p className="text-muted">A surface for grouped content.</p>
          <Link href="/">Home link</Link>
        </Card>
      </Section>
    </div>
  );
}
