import type { Metadata } from "next";

import { MatrixView } from "@/components/matrix/MatrixView";
import { Heading } from "@/components/ui/Heading";
import { loadContent } from "@/lib/content/load";
import { groupColumnsByPhase } from "@/lib/matrix/group";

export const metadata: Metadata = {
  title: "Matrix",
  description:
    "The Human Risk Matrix — 11 columns of human behavior across 5 phases. Open any technique for details, and select the ones that apply to your environment to build a heatmap.",
};

export default function MatrixPage() {
  const { phases, columns, frameworks, insiderCategories } = loadContent();
  const groups = groupColumnsByPhase(columns, phases);
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
          Eleven columns of human behavior across five phases. Collapse a phase to focus, open any
          technique for details, and select the ones that apply to your environment to build a
          heatmap.
        </p>
      </header>
      <MatrixView groups={groups} frameworks={frameworksMap} insiders={insidersMap} />
    </div>
  );
}
