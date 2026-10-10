// Article dates are calendar dates in WIB. They're stored at 12:00 WIB so the
// day doesn't shift when the server (e.g. Vercel, UTC) or a reader formats them.
const TIME_ZONE = "Asia/Jakarta";
const DATE_INPUT = /^\d{4}-\d{2}-\d{2}$/;

/** Date -> "YYYY-MM-DD" (WIB) for <input type="date">. */
export function toDateInputValue(date: Date | string | null | undefined) {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date(date));
}

/** "YYYY-MM-DD" -> Date at 12:00 WIB, or null when empty/invalid. */
export function fromDateInputValue(value: string) {
  if (!DATE_INPUT.test(value)) return null;
  const date = new Date(`${value}T12:00:00+07:00`);
  // Rejects impossible dates like 2026-02-31
  return toDateInputValue(date) === value ? date : null;
}

/** "12 September 2026" */
export function formatArticleDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(new Date(date));
}
