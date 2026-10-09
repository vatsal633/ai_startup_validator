const UNITS = [
  ["year", 365 * 24 * 60 * 60],
  ["month", 30 * 24 * 60 * 60],
  ["day", 24 * 60 * 60],
  ["hour", 60 * 60],
  ["minute", 60],
];

/** "12 minutes ago" from an ISO timestamp. */
export function relativeTime(iso) {
  if (!iso) return "";

  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const seconds = Math.round((Date.now() - then) / 1000);
  if (seconds < 45) return "just now";

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, size] of UNITS) {
    if (seconds >= size) {
      return formatter.format(-Math.floor(seconds / size), unit);
    }
  }
  return "just now";
}
