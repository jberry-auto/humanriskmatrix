export type ClassValue = string | number | null | undefined | false | ClassValue[];

/**
 * Join class names, dropping falsy values. Pure (no React/DOM) so it lives in the
 * core and is trivially testable. Conflicts resolve by order — put overrides last.
 */
export function cn(...values: ClassValue[]): string {
  const out: string[] = [];
  for (const value of values) {
    if (!value) continue;
    if (Array.isArray(value)) {
      const nested = cn(...value);
      if (nested) out.push(nested);
    } else {
      out.push(String(value));
    }
  }
  return out.join(" ");
}
