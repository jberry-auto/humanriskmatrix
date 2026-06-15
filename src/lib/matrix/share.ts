import { z } from "zod";

// The three highlight colors a technique can be marked with. Absence from the selection
// map means "not highlighted". The colors carry no fixed semantic (risk, coverage, …) —
// they are always paired with a text label so meaning is never conveyed by color alone.
export const HIGHLIGHT_COLORS = ["green", "yellow", "red"] as const;
export const HighlightColorSchema = z.enum(HIGHLIGHT_COLORS);
export type HighlightColor = z.infer<typeof HighlightColorSchema>;

export type HeatmapSelection = ReadonlyMap<string, HighlightColor>;

// Wire format: [version byte][2 bits per technique, 4 per byte] over a canonical id order.
// Tiny (160 techniques → 41 bytes → ~55 base64url chars) and deterministic. A version
// bump or a technique-count change invalidates old payloads via the length guard in decode.
const VERSION = 1;
const CODE: Record<HighlightColor, number> = { green: 1, yellow: 2, red: 3 };
const COLOR_BY_CODE: Record<number, HighlightColor> = { 1: "green", 2: "yellow", 3: "red" };

function canonicalOrder(ids: readonly string[]): string[] {
  return [...ids].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

function byteLengthFor(count: number): number {
  return 1 + Math.ceil(count / 4);
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(encoded: string): Uint8Array | null {
  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

/** Pack a heatmap selection into a compact, URL-safe string over the given technique ids. */
export function encodeHeatmap(selection: HeatmapSelection, ids: readonly string[]): string {
  const ordered = canonicalOrder(ids);
  const bytes = new Uint8Array(byteLengthFor(ordered.length));
  bytes[0] = VERSION;
  ordered.forEach((id, index) => {
    const color = selection.get(id);
    if (!color) return;
    const byteIndex = 1 + (index >> 2);
    const shift = (index & 3) * 2;
    bytes[byteIndex] = (bytes[byteIndex] ?? 0) | (CODE[color] << shift);
  });
  return bytesToBase64Url(bytes);
}

/**
 * Decode a payload back into a selection. Returns an empty map if the payload is corrupt,
 * the wrong version, or sized for a different technique set (guards against taxonomy drift).
 */
export function decodeHeatmap(encoded: string, ids: readonly string[]): HeatmapSelection {
  const result = new Map<string, HighlightColor>();
  const ordered = canonicalOrder(ids);
  const bytes = base64UrlToBytes(encoded);
  if (!bytes || bytes.length !== byteLengthFor(ordered.length) || bytes[0] !== VERSION) {
    return result;
  }
  ordered.forEach((id, index) => {
    const byteIndex = 1 + (index >> 2);
    const shift = (index & 3) * 2;
    const code = ((bytes[byteIndex] ?? 0) >> shift) & 3;
    const color = COLOR_BY_CODE[code];
    if (color) result.set(id, color);
  });
  return result;
}
