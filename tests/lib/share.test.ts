import { describe, expect, it } from "vitest";

import { decodeHeatmap, encodeHeatmap, type HighlightColor } from "@/lib/matrix/share";

// Deliberately unsorted; the codec must impose its own canonical order.
const ids = ["1-a", "1-b", "2-a", "7-z", "3-m"];

describe("encodeHeatmap / decodeHeatmap", () => {
  it("round-trips a selection regardless of the input id order", () => {
    const selection = new Map<string, HighlightColor>([
      ["1-a", "green"],
      ["7-z", "red"],
      ["3-m", "yellow"],
    ]);
    const encoded = encodeHeatmap(selection, ids);
    const decoded = decodeHeatmap(encoded, [...ids].reverse());
    expect(new Map(decoded)).toEqual(selection);
  });

  it("encodes an empty selection and decodes back to empty", () => {
    const encoded = encodeHeatmap(new Map(), ids);
    expect(decodeHeatmap(encoded, ids).size).toBe(0);
  });

  it("produces a URL-safe, compact string", () => {
    const encoded = encodeHeatmap(new Map([["1-a", "green"]]), ids);
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("returns empty when the payload is sized for a different id set (drift guard)", () => {
    const encoded = encodeHeatmap(new Map([["1-a", "green"]]), ids);
    expect(decodeHeatmap(encoded, ["1-a", "1-b"]).size).toBe(0);
  });

  it("returns empty on a corrupt or empty payload", () => {
    expect(decodeHeatmap("@@not-base64@@", ids).size).toBe(0);
    expect(decodeHeatmap("", ids).size).toBe(0);
  });
});
