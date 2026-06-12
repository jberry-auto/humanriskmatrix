const phases = [
  { id: "internal", name: "Internal", columns: "1–3", color: "bg-phase-internal" },
  { id: "approach", name: "Approach", columns: "4–6", color: "bg-phase-approach" },
  { id: "deception", name: "Deception", columns: "7–8", color: "bg-phase-deception" },
  { id: "imposition", name: "Imposition", columns: "9–10", color: "bg-phase-imposition" },
  { id: "alignment", name: "Alignment", columns: "11", color: "bg-phase-alignment" },
] as const;

export default function Home() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <p className="inline-flex w-fit items-center rounded-full border border-black/15 px-3 py-1 text-xs font-medium uppercase tracking-wide text-black/60 dark:border-white/20 dark:text-white/60">
          In active development · Phase 1
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Human Risk Matrix</h1>
        <p className="max-w-2xl text-lg text-black/70 dark:text-white/70">
          An open taxonomy of human behavior that produces business impact — from honest mistakes to
          witting cooperation with an adversary. It unifies counterintelligence tradecraft and
          safety science across <strong>11 columns</strong> grouped into <strong>5 phases</strong>.
        </p>
      </section>

      <section aria-labelledby="phases-heading" className="flex flex-col gap-4">
        <h2 id="phases-heading" className="text-sm font-semibold uppercase tracking-wide">
          The five phases
        </h2>
        <ol className="grid gap-3 sm:grid-cols-5">
          {phases.map((phase) => (
            <li
              key={phase.id}
              className="flex flex-col gap-2 rounded-lg border border-black/10 p-4 dark:border-white/15"
            >
              <span aria-hidden="true" className={`h-1.5 w-10 rounded-full ${phase.color}`} />
              <span className="font-medium">{phase.name}</span>
              <span className="text-sm text-black/60 dark:text-white/60">
                Columns {phase.columns}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-black/10 p-6 dark:border-white/15">
        <h2 className="text-sm font-semibold uppercase tracking-wide">What&apos;s coming</h2>
        <p className="max-w-2xl text-black/70 dark:text-white/70">
          The interactive Matrix and the Theory &amp; Frameworks pages land next, driven by
          version-controlled, schema-validated content. The site is built in the open.
        </p>
        <a
          href="https://github.com/jberry-auto/humanriskmatrix"
          className="w-fit text-sm font-medium underline underline-offset-4"
        >
          Follow along on GitHub →
        </a>
      </section>
    </div>
  );
}
