/** Build the canonical attack.mitre.org URL for a technique id (handles sub-techniques). */
export function mitreUrl(id: string): string {
  const [base, sub] = id.split(".");
  return sub
    ? `https://attack.mitre.org/techniques/${base}/${sub}/`
    : `https://attack.mitre.org/techniques/${base}/`;
}
