/** Formats a Date as the local YYYY-MM-DD string used by native `<input type="date">` elements. */
export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// "8/9/2026" is genuinely ambiguous (Aug 9 or Sep 8?) — risky on an expiry date for
// medicine. "9 Aug 2026" reads the same way everywhere, no locale guessing required.
export function formatShortDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
