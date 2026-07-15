const DAY_MS = 86_400_000;

/**
 * Local-date label (YYYY-MM-DD) for a UTC instant in a given IANA timezone.
 * Intl does the DST/offset work; we never do offset math ourselves.
 */
export function localDateLabel(utcMs: number, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(utcMs));
}

function toUtcMs(label: string): number {
  const [y, m, d] = label.split('-').map(Number);
  return Date.UTC(y as number, (m as number) - 1, d as number);
}

/** Pure calendar arithmetic on YYYY-MM-DD labels; immune to DST because labels carry no time. */
export function addDays(label: string, n: number): string {
  return new Date(toUtcMs(label) + n * DAY_MS).toISOString().slice(0, 10);
}

/** Whole calendar days from a to b (positive when b is later). */
export function diffDays(a: string, b: string): number {
  return Math.round((toUtcMs(b) - toUtcMs(a)) / DAY_MS);
}
