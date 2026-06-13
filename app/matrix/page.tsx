import type { Metadata } from "next";

import { MatrixView } from "@/components/matrix/MatrixView";
import { Heading } from "@/components/ui/Heading";
import { loadContent } from "@/lib/content/load";
import { groupCategoriesByDegree } from "@/lib/matrix/group";

export const metadata: Metadata = {
  title: "Matrix",
  description:
    "The Human Risk Matrix — 11 categories of human behavior across a spectrum of malicious intent. Open any technique for details, and select the ones that apply to your environment to build a heatmap.",
};

export default function MatrixPage() {
  const { degrees, categories, frameworks, insiderCategories } = loadContent();
  const groups = groupCategoriesByDegree(categories, degrees);
  const frameworksMap = Object.fromEntries(
    frameworks.map((f) => [f.slug, { title: f.title, summary: f.summary }]),
  );
  const insidersMap = Object.fromEntries(insiderCategories.map((c) => [c.slug, { name: c.name }]));

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Heading level={1} size="display">
          Human Risk Matrix
        </Heading>
        <p className="max-w-2xl text-muted">
          Eleven categories of human behavior, read left to right along a spectrum of malicious
          intent — from accidental, non-malicious actions to witting cooperation with an adversary.
          Open any technique for details, and select the ones that apply to your environment to
          build a heatmap.
        </p>
      </header>
      <MatrixView groups={groups} frameworks={frameworksMap} insiders={insidersMap} />
    </div>
  );
}
