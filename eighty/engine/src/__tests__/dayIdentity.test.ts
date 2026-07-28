import { localDateLabel, addDays, diffDays } from '../dayIdentity';

describe('localDateLabel', () => {
  test('formats a UTC instant in the given timezone', () => {
    // 2026-07-15T03:00Z = July 14, 9:00pm in Denver (UTC-6)
    expect(localDateLabel(Date.UTC(2026, 6, 15, 3, 0), 'America/Denver')).toBe('2026-07-14');
    expect(localDateLabel(Date.UTC(2026, 6, 15, 3, 0), 'UTC')).toBe('2026-07-15');
  });

  test('DST spring-forward day (2026-03-08, America/Denver) neither skips nor duplicates', () => {
    // local noon on the 7th, 8th, 9th — offsets differ across the transition
    const labels = [7, 8, 9].map((d) => localDateLabel(Date.UTC(2026, 2, d, 19, 0), 'America/Denver'));
    expect(labels).toEqual(['2026-03-07', '2026-03-08', '2026-03-09']);
  });

  test('DST fall-back day (2026-11-01, America/Denver): both 1:30ams are the same date', () => {
    const beforeShift = localDateLabel(Date.UTC(2026, 10, 1, 7, 30), 'America/Denver'); // 1:30 MDT
    const afterShift = localDateLabel(Date.UTC(2026, 10, 1, 8, 30), 'America/Denver'); // 1:30 MST
    expect(beforeShift).toBe('2026-11-01');
    expect(afterShift).toBe('2026-11-01');
  });
});

describe('addDays / diffDays', () => {
  test('pure calendar arithmetic across month ends and leap days', () => {
    expect(addDays('2026-07-31', 1)).toBe('2026-08-01');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29'); // leap year
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
    expect(addDays('2026-01-15', -20)).toBe('2025-12-26');
  });

  test('DST transition dates are ordinary labels — no skip, no duplicate', () => {
    expect(addDays('2026-03-07', 1)).toBe('2026-03-08');
    expect(addDays('2026-03-08', 1)).toBe('2026-03-09');
    expect(addDays('2026-10-31', 2)).toBe('2026-11-02');
  });

  test('diffDays is the exact day-count inverse of addDays', () => {
    expect(diffDays('2026-07-01', '2026-09-18')).toBe(79);
    expect(diffDays('2026-09-18', '2026-07-01')).toBe(-79);
    expect(diffDays('2026-03-07', '2026-03-09')).toBe(2); // across spring-forward
  });
});
