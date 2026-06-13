/** Build/CI gate: load and validate all of content/. Exits non-zero on any problem. */
import { ContentValidationError, loadContent } from "../src/lib/content/load";

try {
  const bundle = loadContent();
  const techniques = bundle.categories.reduce((n, c) => n + c.techniques.length, 0);
  console.log(
    `content OK — ${bundle.degrees.length} intent degrees, ${bundle.categories.length} categories, ` +
      `${techniques} techniques, ${bundle.frameworks.length} frameworks, ` +
      `${bundle.insiderCategories.length} insider categories`,
  );
} catch (err) {
  if (err instanceof ContentValidationError) {
    console.error(err.message);
    process.exit(1);
  }
  throw err;
}
