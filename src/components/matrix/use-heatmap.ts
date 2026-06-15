"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  decodeHeatmap,
  HIGHLIGHT_COLORS,
  HighlightColorSchema,
  type HeatmapSelection,
  type HighlightColor,
} from "@/lib/matrix/share";

const STORAGE_KEY = "hrm.heatmap.v2";

// Cycle order for a single click: none → green → yellow → red → none.
const CYCLE: readonly HighlightColor[] = HIGHLIGHT_COLORS;

type Listener = () => void;

// Module-level external store so the selection is hydration-safe (server snapshot is
// always empty; the stored map loads after subscribe) without setState-in-effect.
let state: HeatmapSelection = new Map();
let initialized = false;
const listeners = new Set<Listener>();
const serverSnapshot: HeatmapSelection = new Map();

function load(): HeatmapSelection {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Map();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Map();
    const entries = new Map<string, HighlightColor>();
    for (const entry of parsed) {
      if (!Array.isArray(entry) || entry.length !== 2) continue;
      const [id, color] = entry;
      const validColor = HighlightColorSchema.safeParse(color);
      if (typeof id === "string" && validColor.success) entries.set(id, validColor.data);
    }
    return entries;
  } catch {
    return new Map();
  }
}

function persist(next: HeatmapSelection): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next.entries()]));
  } catch {
    // ignore (private mode / quota)
  }
}

function setState(next: HeatmapSelection): void {
  state = next;
  persist(next);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener): () => void {
  if (!initialized) {
    state = load();
    initialized = true;
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function nextColor(current: HighlightColor | undefined): HighlightColor | null {
  if (!current) return CYCLE[0] ?? null;
  const index = CYCLE.indexOf(current);
  return CYCLE[index + 1] ?? null;
}

export interface Heatmap {
  readonly selection: HeatmapSelection;
  readonly cycle: (id: string) => void;
  readonly setColor: (id: string, color: HighlightColor | null) => void;
  readonly clear: () => void;
  /** Replace the selection from an encoded share payload. Returns true if anything applied. */
  readonly loadShared: (encoded: string, ids: readonly string[]) => boolean;
}

export function useHeatmap(): Heatmap {
  const selection = useSyncExternalStore(
    subscribe,
    () => state,
    () => serverSnapshot,
  );

  const setColor = useCallback((id: string, color: HighlightColor | null) => {
    const next = new Map(state);
    if (color) next.set(id, color);
    else next.delete(id);
    setState(next);
  }, []);

  const cycle = useCallback((id: string) => {
    const next = new Map(state);
    const color = nextColor(next.get(id));
    if (color) next.set(id, color);
    else next.delete(id);
    setState(next);
  }, []);

  const clear = useCallback(() => setState(new Map()), []);

  const loadShared = useCallback((encoded: string, ids: readonly string[]) => {
    const shared = decodeHeatmap(encoded, ids);
    if (shared.size === 0) return false;
    setState(new Map(shared));
    return true;
  }, []);

  return { selection, cycle, setColor, clear, loadShared };
}
