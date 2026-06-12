import { describe, expect, it } from "vitest";

import { healthStatus } from "@/lib/health";

describe("healthStatus", () => {
  it("reports ok", () => {
    expect(healthStatus()).toEqual({ status: "ok" });
  });
});
