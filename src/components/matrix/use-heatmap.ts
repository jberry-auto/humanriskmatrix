"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "hrm.heatmap.v1";

type Listener = () => void;

// Module-level external store so the selection is hydration-safe (server snapshot is
// always empty; the stored set loads after subscribe) without setState-in-effect.
let state: ReadonlySet<string> = new Set();
let initialized = false;
const listeners = new Set<Listener>();
const serverSnapshot: ReadonlySet<string> = new Set();

function load(): ReadonlySet<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? new Set(parsed.filter((x): x is string => typeof x === "string"))
      : new Set();
  } catch {
    return new Set();
  }
}

function persist(next: ReadonlySet<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  } catch {
    // ignore (private mode / quota)
  }
}

function setState(next: ReadonlySet<string>): void {
  state = next;
  persist(next);
  listeners.forEach((l) => l());
}

function subscribe(listener: Listener): () => void {
  if (!initialized) {
    state = load();
    initialized = true;
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export interface Heatmap {
  readonly selected: ReadonlySet<string>;
  readonly toggle: (id: string) => void;
  readonly clear: () => void;
}

export function useHeatmap(): Heatmap {
  const selected = useSyncExternalStore(
    subscribe,
    () => state,
    () => serverSnapshot,
  );

  const toggle = useCallback((id: string) => {
    const next = new Set(state);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setState(next);
  }, []);

  const clear = useCallback(() => setState(new Set()), []);

  return { selected, toggle, clear };
}
