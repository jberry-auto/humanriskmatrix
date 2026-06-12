import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Unmount and clear the DOM between tests (Testing Library's auto-cleanup only
// registers when Vitest globals are enabled, which we deliberately leave off).
afterEach(() => {
  cleanup();
});
