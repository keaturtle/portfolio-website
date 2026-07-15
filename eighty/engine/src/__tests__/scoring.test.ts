import { requiredItems, requiredSuccessDays, scoreDay, regularItems } from '../scoring';
import { eighty, hard75, day, firstRegular, allBut, BONUS_IDS } from './fixtures';
import { ChallengeConfig } from '../types';

describe('thresholds', () => {
  test('80% of 25 regular items = 20; bonus excluded from denominator', () => {
    expect(regularItems(eighty)).toHaveLength(25);
    expect(requiredItems(eighty)).toBe(20);
  });

  test('80% of 80 days = 64 success days', () => {
    expect(requiredSuccessDays(eighty)).toBe(64);
  });

  test('non-integer thresholds round up (21 items × 80% → 17)', () => {
    const cfg: ChallengeConfig = { ...eighty, items: eighty.items.slice(0, 21) };
    expect(requiredItems(cfg)).toBe(17);
  });

  test('100% threshold requires every regular item (75 Hard)', () => {
    expect(requiredItems(hard75)).toBe(5);
    expect(requiredSuccessDays(hard75)).toBe(75);
  });
});

describe('scoreDay', () => {
  test('exactly 80% (20/25) is a success', () => {
    const s = scoreDay(eighty, day(0, firstRegular(20)));
    expect(s.metThreshold).toBe(true);
    expect(s.outcome).toBe('success');
    expect(s.pct).toBe(80);
  });

  test('one item below the line (19/25) fails', () => {
    const s = scoreDay(eighty, day(0, firstRegular(19)));
    expect(s.metThreshold).toBe(false);
    expect(s.outcome).toBe('fail');
    expect(s.failReason).toBe('below-threshold');
  });

  test('a bonus item pushes a 19/25 day over the line', () => {
    const s = scoreDay(eighty, day(0, [...firstRegular(19), 'bsocial']));
    expect(s.completedRegular).toBe(19);
    expect(s.completedBonus).toBe(1);
    expect(s.metThreshold).toBe(true);
    expect(s.outcome).toBe('success');
  });

  test('bonus items never change the denominator; pct can exceed 100', () => {
    const s = scoreDay(eighty, day(0, [...firstRegular(25), ...BONUS_IDS]));
    expect(s.totalRegular).toBe(25);
    expect(s.pct).toBeCloseTo(124);
  });

  test('unknown item ids are ignored', () => {
    const s = scoreDay(eighty, day(0, ['nonsense', ...firstRegular(20)]));
    expect(s.completedRegular).toBe(20);
    expect(s.completedBonus).toBe(0);
  });

  test('an open (unclosed) day is pending regardless of progress', () => {
    const s = scoreDay(eighty, day(0, [], { closed: false }));
    expect(s.outcome).toBe('pending');
    expect(s.failReason).toBeUndefined();
  });

  test('a day that met the threshold still fails on a no-repeat violation', () => {
    const prev = day(0, allBut('wpull'));
    const today = day(1, allBut('wpull'));
    const s = scoreDay(eighty, today, prev);
    expect(s.metThreshold).toBe(true);
    expect(s.outcome).toBe('fail');
    expect(s.failReason).toBe('no-repeat-miss');
    expect(s.violations).toEqual([{ itemId: 'wpull', firstDayIndex: 0, secondDayIndex: 1 }]);
  });

  test('empty checklist edge case scores 100%', () => {
    const cfg: ChallengeConfig = { ...eighty, items: [] };
    const s = scoreDay(cfg, day(0, []));
    expect(s.pct).toBe(100);
    expect(s.outcome).toBe('success');
  });
});
