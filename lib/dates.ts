/** Formats a Date as 'YYYY-MM-DD' using its local calendar day. */
export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Returns the most recent Sunday (today, when today is a Sunday). */
export function getMostRecentSunday(today: Date): Date {
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay()); // getDay(): 0 = Sunday
  return sunday;
}

/**
 * Turns '2026-05-03' into 'Sunday, May 3, 2026'.
 * The date is read as UTC so the day never shifts with the server time zone.
 */
export function formatLongDate(isoDate: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

/** True for a real calendar date like '2026-03-01' (rejects '2026-02-31'). */
export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
}

/** True when a valid 'YYYY-MM-DD' date falls on a Sunday. */
export function isSunday(isoDate: string): boolean {
  return new Date(`${isoDate}T00:00:00Z`).getUTCDay() === 0;
}
