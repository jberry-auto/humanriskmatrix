/**
 * Maintainer-only seed tool. Parses the local, git-ignored `human-risk-framework.xlsx`
 * (Framework tab) into the committed `content/` tree, plus the fixed intent-degree /
 * framework / insider data. Run on a branch via `npm run import:xlsx`; then author each
 * technique's `description` (the schema requires it). Never commits the workbook.
 *
 * Not part of CI or the production build — the app only reads the committed content/.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import ExcelJS from "exceljs";
import matter from "gray-matter";
import { stringify as toYaml } from "yaml";

const ROOT = process.cwd();
const XLSX = join(ROOT, "human-risk-framework.xlsx");
const CONTENT = join(ROOT, "content");

type IntentDegreeId = "unintentional" | "unaware" | "deceived" | "coerced" | "complicit";

const DEGREES = [
  {
    id: "unintentional",
    name: "Unintentional",
    order: 1,
    categoryRange: [1, 3],
    adversaryRole: "None",
    awareness: "Low to none; no harmful intent — slip, habit, convenience",
  },
  {
    id: "unaware",
    name: "Unaware",
    order: 2,
    categoryRange: [4, 6],
    adversaryRole: "Passive observation or relationship-building",
    awareness: "None to low; unaware of being targeted",
  },
  {
    id: "deceived",
    name: "Deceived",
    order: 3,
    categoryRange: [7, 8],
    adversaryRole: "Active deception",
    awareness: "Detected on reflection or never; believes the action is correct",
  },
  {
    id: "coerced",
    name: "Coerced",
    order: 4,
    categoryRange: [9, 10],
    adversaryRole: "Active pressure or physical action",
    awareness: "Immediate or imminent; acts under force or confusion",
  },
  {
    id: "complicit",
    name: "Complicit",
    order: 5,
    categoryRange: [11, 11],
    adversaryRole: "Active sponsor",
    awareness: "Full awareness; aligned with adversary",
  },
] as const;

const CATEGORIES: { id: number; name: string; degreeId: IntentDegreeId; slug: string }[] = [
  {
    id: 1,
    name: "Accidental Disclosure",
    degreeId: "unintentional",
    slug: "accidental-disclosure",
  },
  {
    id: 2,
    name: "Hygiene & Config Drift",
    degreeId: "unintentional",
    slug: "hygiene-config-drift",
  },
  {
    id: 3,
    name: "Workarounds & Self-Exposure",
    degreeId: "unintentional",
    slug: "workarounds-self-exposure",
  },
  { id: 4, name: "Reconnaissance", degreeId: "unaware", slug: "reconnaissance" },
  { id: 5, name: "Access Development", degreeId: "unaware", slug: "access-development" },
  { id: 6, name: "Elicitation", degreeId: "unaware", slug: "elicitation" },
  { id: 7, name: "Deceptive Delivery", degreeId: "deceived", slug: "deceptive-delivery" },
  { id: 8, name: "Impersonation", degreeId: "deceived", slug: "impersonation" },
  { id: 9, name: "Forced Compliance", degreeId: "coerced", slug: "forced-compliance" },
  { id: 10, name: "Physical Intrusion", degreeId: "coerced", slug: "physical-intrusion" },
  { id: 11, name: "Coercion & Recruitment", degreeId: "complicit", slug: "coercion-recruitment" },
];

const FRAMEWORKS = [
  {
    slug: "mice",
    title: "MICE",
    discipline: "CounterIntel",
    origin: "Classical CI model",
    mappedCategories: [5, 7, 11],
    summary:
      "Money, Ideology, Coercion, Ego — the motivators an intelligence service develops into witting cooperation.",
  },
  {
    slug: "rascls",
    title: "RASCLS",
    discipline: "CounterIntel",
    origin: "Cialdini / Randy Burkett (CIA)",
    mappedCategories: [5, 6, 7],
    summary:
      "Reciprocation, Authority, Scarcity, Commitment, Liking, Social proof — the operational core of elicitation tradecraft.",
  },
  {
    slug: "cialdini-unity",
    title: "Cialdini — Unity (extended)",
    discipline: "Influence",
    origin: "Robert Cialdini",
    mappedCategories: [5, 6, 8],
    summary:
      "RASCLS plus Unity: appeal to shared identity ('we're both engineers'), materially more powerful than mere liking.",
  },
  {
    slug: "cognitive-biases",
    title: "Cognitive Biases",
    discipline: "Influence",
    origin: "Behavioral science",
    mappedCategories: [4, 5, 6, 7, 8, 9, 10, 11],
    summary:
      "Authority bias, halo effect, confirmation, optimism, bandwagon, sunk-cost, default, loss aversion — shortcuts adversarial models exploit.",
  },
  {
    slug: "swiss-cheese",
    title: "Reason — Swiss Cheese Model",
    discipline: "SafetyScience",
    origin: "James Reason",
    mappedCategories: [1, 2, 3],
    summary:
      "Defenses as layered slices with shifting holes; incidents occur when holes align — shifts blame from the person to the system.",
  },
  {
    slug: "etto",
    title: "Hollnagel — ETTO",
    discipline: "SafetyScience",
    origin: "Erik Hollnagel",
    mappedCategories: [2, 3],
    summary:
      "The Efficiency–Thoroughness Trade-Off: people rationally trade thoroughness for efficiency; only the conditions can be changed.",
  },
  {
    slug: "drift-to-danger",
    title: "Rasmussen — Drift to Danger",
    discipline: "SafetyScience",
    origin: "Jens Rasmussen",
    mappedCategories: [2, 3],
    summary:
      "Systems drift toward the safety boundary under economic and effort pressure — invisible until an incident, obvious in retrospect.",
  },
  {
    slug: "just-culture",
    title: "Dekker — Just Culture",
    discipline: "SafetyScience",
    origin: "Sidney Dekker",
    mappedCategories: [1, 2, 3],
    summary:
      "Distinguishes human error, at-risk behavior, and reckless behavior — each needing a different response to preserve reporting.",
  },
  {
    slug: "heinrich-pyramid",
    title: "Heinrich Pyramid",
    discipline: "SafetyScience",
    origin: "Industrial safety",
    mappedCategories: [1, 2, 3],
    summary:
      "For each major incident, many minor ones and far more near-misses beneath — the base most programs never measure.",
  },
] as const;

const INSIDERS = [
  {
    slug: "negligent-insider",
    name: "Negligent insider",
    primaryCategories: [1, 2, 3],
    responseMechanism: "Tooling and culture, not investigation",
    note: "Reason / Hollnagel / Dekker substrate is the relevant doctrine.",
  },
  {
    slug: "compromised-credentials",
    name: "Compromised-credentials insider",
    primaryCategories: [2, 7, 8],
    responseMechanism: "Identity tooling and incident response",
    note: "The 'insider' framing is misleading — the human is the surface, not the actor.",
  },
  {
    slug: "unwitting-exploited",
    name: "Unwitting exploited insider",
    primaryCategories: [4, 5, 6, 7, 8, 9],
    responseMechanism: "Awareness and out-of-band verification",
    note: "The human is the medium of the attack, not the source of intent.",
  },
  {
    slug: "departing-employee",
    name: "Departing-employee exfiltration",
    primaryCategories: [3, 11],
    responseMechanism: "Cross-category investigation by default",
    note: "Usually starts as a workaround; can cross into alignment with a hostile destination.",
  },
  {
    slug: "third-party-vendor",
    name: "Third-party / vendor insider",
    primaryCategories: [5, 8],
    responseMechanism: "Vendor-risk program at the human layer",
    note: "Vendor staff with access who are exploited or recruited.",
  },
  {
    slug: "witting-recruited",
    name: "Witting recruited insider",
    primaryCategories: [11],
    responseMechanism: "Counterintelligence response",
    note: "MICE doctrine.",
  },
  {
    slug: "collusive",
    name: "Collusive insider",
    primaryCategories: [11],
    responseMechanism: "Counterintelligence plus investigation",
    note: "Two or more witting insiders coordinating; rare but consequential.",
  },
] as const;

function cellText(cell: ExcelJS.Cell): string {
  const v = cell.value;
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "object") {
    if ("richText" in v && Array.isArray(v.richText)) {
      return v.richText
        .map((t) => t.text)
        .join("")
        .trim();
    }
    if ("text" in v && v.text != null) return String(v.text).trim();
    if ("result" in v && v.result != null) return String(v.result).trim();
  }
  return String(v).trim();
}

function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseTechnique(raw: string): { label: string; mitreId: string | null } {
  // Cells are "label\n(MITRE)"; the label itself may contain "/". The MITRE id is the
  // last line when it is a lone parenthesized token ("(T1566.001)" or "(—)").
  const lines = raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  let mitreId: string | null = null;
  let labelLines = lines;
  const last = lines[lines.length - 1];
  if (last && /^\(.*\)$/.test(last)) {
    const match = last.slice(1, -1).match(/T\d{4}(\.\d{3})?/);
    mitreId = match ? match[0] : null;
    labelLines = lines.slice(0, -1);
  }
  const label = labelLines.join(" ").replace(/\s+/g, " ").trim();
  return { label, mitreId };
}

async function main(): Promise<void> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(XLSX);
  const ws = wb.getWorksheet("Framework");
  if (!ws) throw new Error("Framework worksheet not found");

  // Find the header row (the one whose first cell names category 1).
  let headerRow = -1;
  for (let r = 1; r <= ws.rowCount; r += 1) {
    if (/Accidental Disclosure/i.test(cellText(ws.getRow(r).getCell(1)))) {
      headerRow = r;
      break;
    }
  }
  if (headerRow === -1) throw new Error("Could not find the header row in Framework tab");

  mkdirSync(join(CONTENT, "matrix", "categories"), { recursive: true });
  mkdirSync(join(CONTENT, "frameworks"), { recursive: true });

  const report: string[] = [];

  for (const cat of CATEGORIES) {
    const seen = new Set<string>();
    // Authored fields are emitted empty; the strict schema requires them to be filled in
    // before content validates. See docs/content-model.md.
    const techniques: {
      id: string;
      label: string;
      mitreId: string | null;
      description: string;
      detailedDescription: string;
      attackerBehavior: string;
      insiderBehavior: string;
      prevention: { mode: string; action: string }[];
    }[] = [];
    for (let r = headerRow + 1; r <= ws.rowCount; r += 1) {
      const raw = cellText(ws.getRow(r).getCell(cat.id));
      if (!raw) continue;
      const { label, mitreId } = parseTechnique(raw);
      if (!label) continue;
      let id = `${cat.id}-${slugify(label)}`;
      let n = 2;
      while (seen.has(id)) id = `${cat.id}-${slugify(label)}-${n++}`;
      seen.add(id);
      techniques.push({
        id,
        label,
        mitreId,
        description: "",
        detailedDescription: "",
        attackerBehavior: "",
        insiderBehavior: "",
        prevention: [],
      });
    }

    const mappedModels = FRAMEWORKS.filter((f) =>
      (f.mappedCategories as readonly number[]).includes(cat.id),
    ).map((f) => f.slug);
    const insiderCategories = INSIDERS.filter((c) =>
      (c.primaryCategories as readonly number[]).includes(cat.id),
    ).map((c) => c.slug);

    const out = {
      id: cat.id,
      name: cat.name,
      degreeId: cat.degreeId,
      mappedModels,
      insiderCategories,
      techniques,
    };
    const file = `${String(cat.id).padStart(2, "0")}-${cat.slug}.yaml`;
    writeFileSync(join(CONTENT, "matrix", "categories", file), toYaml(out), "utf8");
    report.push(`  category ${cat.id} (${cat.name}): ${techniques.length} techniques`);
  }

  // Intent degrees
  writeFileSync(join(CONTENT, "matrix", "intent-degrees.yaml"), toYaml(DEGREES), "utf8");

  // Insider categories
  writeFileSync(join(CONTENT, "insider-categories.yaml"), toYaml(INSIDERS), "utf8");

  // Frameworks (MDX with frontmatter; body is a short stub for now)
  for (const fw of FRAMEWORKS) {
    const body = `\n${fw.summary}\n`;
    const mdx = matter.stringify(body, {
      slug: fw.slug,
      title: fw.title,
      discipline: fw.discipline,
      origin: fw.origin,
      mappedCategories: fw.mappedCategories,
      summary: fw.summary,
    });
    writeFileSync(join(CONTENT, "frameworks", `${fw.slug}.mdx`), mdx, "utf8");
  }

  console.log("Imported content/ from the workbook.\nTechnique counts per category:");
  console.log(report.join("\n"));
  console.log(
    "\nNEXT: author the `description` for every technique (currently empty), then run `npm run validate:content`.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
