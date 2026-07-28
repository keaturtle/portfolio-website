import { findViolations, atRiskItems } from '../noRepeat';
import { eighty, day, allBut } from './fixtures';
import { ChallengeConfig } from '../types';

const noExemption: ChallengeConfig = { ...eighty, travelExemption: false };
const ruleOff: ChallengeConfig = { ...eighty, noRepeatMiss: false };

describe('findViolations', () => {
  test('same regular item missed two days in a row violates', () => {
    const v = findViolations(eighty, day(5, allBut('mkitchen')), day(4, allBut('mkitchen')));
    expect(v).toEqual([{ itemId: 'mkitchen', firstDayIndex: 4, secondDayIndex: 5 }]);
  });

  test('different items missed on each day do not violate', () => {
    expect(findViolations(eighty, day(1, allBut('wpull')), day(0, allBut('dsweets')))).toEqual([]);
  });

  test('multiple repeated misses all reported', () => {
    const v = findViolations(eighty, day(1, allBut('wpull', 'sread')), day(0, allBut('wpull', 'sread')));
    expect(v.map((x) => x.itemId).sort()).toEqual(['sread', 'wpull']);
  });

  test('day one has no previous day, so no violations', () => {
    expect(findViolations(eighty, day(0, []))).toEqual([]);
  });

  test('an open previous day cannot complete a pair', () => {
    expect(
      findViolations(eighty, day(1, allBut('wpull')), day(0, allBut('wpull'), { closed: false })),
    ).toEqual([]);
  });

  test('rule off → never violates', () => {
    expect(findViolations(ruleOff, day(1, []), day(0, []))).toEqual([]);
  });

  test('bonus items never violate', () => {
    // bsocial missed both days; every regular item done
    const all = eighty.items.filter((i) => !i.isBonus).map((i) => i.id);
    expect(findViolations(eighty, day(1, all), day(0, all))).toEqual([]);
  });

  describe('travel exemption', () => {
    const missed = allBut('wpull');
    test('travel on the first day of the pair exempts it', () => {
      expect(findViolations(eighty, day(1, missed), day(0, missed, { isTravel: true }))).toEqual([]);
    });
    test('travel on the second day of the pair exempts it', () => {
      expect(findViolations(eighty, day(1, missed, { isTravel: true }), day(0, missed))).toEqual([]);
    });
    test('travel on both days exempts it', () => {
      expect(
        findViolations(eighty, day(1, missed, { isTravel: true }), day(0, missed, { isTravel: true })),
      ).toEqual([]);
    });
    test('with exemption disabled, travel days still violate', () => {
      expect(
        findViolations(noExemption, day(1, missed, { isTravel: true }), day(0, missed, { isTravel: true })),
      ).toHaveLength(1);
    });
  });
});

describe('atRiskItems', () => {
  test('lists regular items missed yesterday, never bonus items', () => {
    const risk = atRiskItems(eighty, day(0, allBut('wpull', 'mkitchen')));
    expect(risk.sort()).toEqual(['mkitchen', 'wpull']);
  });

  test('empty when rule is off, yesterday missing, or yesterday still open', () => {
    expect(atRiskItems(ruleOff, day(0, []))).toEqual([]);
    expect(atRiskItems(eighty)).toEqual([]);
    expect(atRiskItems(eighty, day(0, [], { closed: false }))).toEqual([]);
  });

  test('empty when yesterday was a travel day (exemption on)', () => {
    expect(atRiskItems(eighty, day(0, [], { isTravel: true }))).toEqual([]);
  });

  test('empty when today is a travel day (exemption on)', () => {
    expect(atRiskItems(eighty, day(0, []), true)).toEqual([]);
  });

  test('travel days still at risk when exemption is off', () => {
    expect(atRiskItems(noExemption, day(0, allBut('wpull'), { isTravel: true }))).toEqual(['wpull']);
  });
});
