import { describe, expect, it } from "vitest";

import { mitreUrl } from "@/lib/matrix/mitre";

describe("mitreUrl", () => {
  it("builds a base technique URL", () => {
    expect(mitreUrl("T1566")).toBe("https://attack.mitre.org/techniques/T1566/");
  });

  it("builds a sub-technique URL", () => {
    expect(mitreUrl("T1566.001")).toBe("https://attack.mitre.org/techniques/T1566/001/");
  });
});
