import { validateConfig } from '../validate';
import { eighty, hard75 } from './fixtures';
import { ChallengeConfig } from '../types';

describe('validateConfig', () => {
  test('the 80/80/80 and 75 Hard fixtures are both valid', () => {
    expect(validateConfig(eighty)).toEqual([]);
    expect(validateConfig(hard75)).toEqual([]);
  });

  test('duration must be a whole number of at least 1', () => {
    expect(validateConfig({ ...eighty, durationDays: 0 })[0]).toMatchObject({ field: 'durationDays' });
    expect(validateConfig({ ...eighty, durationDays: -5 })[0]).toMatchObject({ field: 'durationDays' });
    expect(validateConfig({ ...eighty, durationDays: 1.5 })[0]).toMatchObject({ field: 'durationDays' });
  });

  test('daily threshold must be between 0 and 100', () => {
    expect(validateConfig({ ...eighty, dailyThresholdPct: -1 })[0]).toMatchObject({
      field: 'dailyThresholdPct',
    });
    expect(validateConfig({ ...eighty, dailyThresholdPct: 101 })[0]).toMatchObject({
      field: 'dailyThresholdPct',
    });
    expect(validateConfig({ ...eighty, dailyThresholdPct: NaN })[0]).toMatchObject({
      field: 'dailyThresholdPct',
    });
    expect(validateConfig({ ...eighty, dailyThresholdPct: 0 })).toEqual([]);
    expect(validateConfig({ ...eighty, dailyThresholdPct: 100 })).toEqual([]);
  });

  test('challenge threshold must be between 0 and 100', () => {
    expect(validateConfig({ ...eighty, challengeThresholdPct: 101 })[0]).toMatchObject({
      field: 'challengeThresholdPct',
    });
  });

  test('at least one item is required', () => {
    const cfg: ChallengeConfig = { ...eighty, items: [] };
    expect(validateConfig(cfg)).toContainEqual({ field: 'items', message: 'Add at least one item.' });
  });

  test('at least one non-bonus item is required', () => {
    const cfg: ChallengeConfig = { ...eighty, items: eighty.items.filter((i) => i.isBonus) };
    expect(validateConfig(cfg)[0]).toMatchObject({ field: 'items', message: 'Add at least one non-bonus item.' });
  });

  test('every item needs a non-empty id and label', () => {
    const cfg: ChallengeConfig = {
      ...eighty,
      items: [{ id: '', categoryId: 'c', label: 'Something', isBonus: false }],
    };
    expect(validateConfig(cfg)).toContainEqual({
      field: 'items',
      message: 'Every item needs an id and a label.',
    });
    const cfg2: ChallengeConfig = {
      ...eighty,
      items: [{ id: 'x', categoryId: 'c', label: '  ', isBonus: false }],
    };
    expect(validateConfig(cfg2)).toContainEqual({
      field: 'items',
      message: 'Every item needs an id and a label.',
    });
  });

  test('duplicate item ids are rejected and named once each', () => {
    const cfg: ChallengeConfig = {
      ...eighty,
      items: [
        { id: 'dup', categoryId: 'c', label: 'A', isBonus: false },
        { id: 'dup', categoryId: 'c', label: 'B', isBonus: false },
        { id: 'dup', categoryId: 'c', label: 'C', isBonus: false },
      ],
    };
    expect(validateConfig(cfg)).toContainEqual({ field: 'items', message: 'Duplicate item id(s): dup' });
  });

  test('multiple errors can be reported at once', () => {
    const cfg: ChallengeConfig = { ...eighty, durationDays: 0, items: [] };
    const errors = validateConfig(cfg);
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });
});
