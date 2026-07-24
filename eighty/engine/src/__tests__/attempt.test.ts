import { evaluateAttempt, fillGaps, itemStats } from '../attempt';
import { eighty, hard75, day, firstRegular, allBut, REGULAR_IDS, START } from './fixtures';
import { ChallengeConfig, DayLog } from '../types';
import { addDays } from '../dayIdentity';

const strict: ChallengeConfig = { ...eighty, strictness: 'strict' };
const hardcore: ChallengeConfig = { ...eighty, strictness: 'hardcore' };

// completes everything — avoids accidental no-repeat pairs between fixture days
const successDay = (i: number) => day(i, REGULAR_IDS);
const failDay = (i: number) => day(i, firstRegular(10));

describe('config changes re-score prior days (edit-challenge safety)', () => {
  // The same regular item missed two days running; both days are otherwise well
  // above threshold, so the only thing that can fail day 1 is the no-repeat rule.
  const violationLogs = [day(0, allBut('w1')), day(1, allBut('w1'))];

  test('turning noRepeatMiss off clears the violation and un-fails the day', () => {
    const on = evaluateAttempt(eighty, violationLogs); // noRepeatMiss: true
    expect(on.dayScores[1]?.outcome).toBe('fail');
    expect(on.dayScores[1]?.failReason).toBe('no-repeat-miss');
    expect(on.successDays).toBe(1);

    const off = evaluateAttempt({ ...eighty, noRepeatMiss: false }, violationLogs);
    expect(off.dayScores[1]?.outcome).toBe('success');
    expect(off.dayScores[1]?.violations).toEqual([]);
    expect(off.successDays).toBe(2);
  });

  test('flexible → strict retroactively requires a restart on the same logs', () => {
    expect(evaluateAttempt(eighty, violationLogs).status).toBe('active');
    const s = evaluateAttempt(strict, violationLogs);
    expect(s.status).toBe('restart-required');
    expect(s.restartReason).toBe('no-repeat-miss');
  });

  test('lowering the daily threshold un-fails a previously below-threshold day', () => {
    const logs = [day(0, firstRegular(15))]; // 15/25 = 60%
    expect(evaluateAttempt(eighty, logs).dayScores[0]?.outcome).toBe('fail'); // vs 80%
    expect(
      evaluateAttempt({ ...eighty, dailyThresholdPct: 60 }, logs).dayScores[0]?.outcome,
    ).toBe('success');
  });
});

describe('fillGaps', () => {
  test('synthesizes closed, empty, correctly-dated days for unlogged gaps', () => {
    const filled = fillGaps([day(0, []), day(3, [])]);
    expect(filled.map((l) => l.dayIndex)).toEqual([0, 1, 2, 3]);
    const gap = filled[1] as DayLog;
    expect(gap.localDate).toBe(addDays(START, 1));
    expect(gap.closed).toBe(true);
    expect(gap.completedItemIds).toEqual([]);
  });

  test('sorts out-of-order logs and leaves contiguous logs untouched', () => {
    const filled = fillGaps([day(1, []), day(0, [])]);
    expect(filled.map((l) => l.dayIndex)).toEqual([0, 1]);
    expect(filled).toHaveLength(2);
  });
});

describe('evaluateAttempt — basics', () => {
  test('empty attempt: everything ahead of you', () => {
    const s = evaluateAttempt(eighty, []);
    expect(s.status).toBe('active');
    expect(s.daysElapsed).toBe(0);
    expect(s.daysRemaining).toBe(80);
    expect(s.successDaysNeeded).toBe(64);
    expect(s.marginForError).toBe(16);
    expect(s.projectedEndLocalDate).toBeNull();
    expect(s.rollingPct).toBe(0);
    expect(s.avgSatisfaction).toBeNull();
  });

  test('counts success/fail days, rolling %, margin, projected end date', () => {
    const logs = [successDay(0), successDay(1), failDay(2), day(3, firstRegular(21), { closed: false })];
    const s = evaluateAttempt(eighty, logs);
    expect(s.successDays).toBe(2);
    expect(s.failedDays).toBe(1);
    expect(s.daysElapsed).toBe(4); // open day has started
    expect(s.daysRemaining).toBe(76);
    expect(s.rollingPct).toBeCloseTo((2 / 3) * 100); // open day not counted
    expect(s.marginForError).toBe(15); // 16 allowed misses − 1 used
    expect(s.successDaysNeeded).toBe(62);
    // day 3 opened on 2026-07-04; day 79 lands 76 days later
    expect(s.projectedEndLocalDate).toBe(addDays(START, 79));
    expect(s.dayScores[3]?.outcome).toBe('pending');
  });

  test('logs beyond the challenge window are ignored', () => {
    const s = evaluateAttempt(eighty, [successDay(0), successDay(80)]);
    expect(s.daysElapsed).toBe(1);
    expect(s.successDays).toBe(1);
  });

  test('averages satisfaction and mood over closed days only', () => {
    const logs = [
      day(0, [], { satisfaction: 4, mood: 2 }),
      day(1, [], { satisfaction: 2 }),
      day(2, [], { satisfaction: 5, mood: 4, closed: false }), // open — excluded
    ];
    const s = evaluateAttempt(eighty, logs);
    expect(s.avgSatisfaction).toBe(3);
    expect(s.avgMood).toBe(2);
  });
});

describe('unlogged days', () => {
  test('count as failed with every item missed, and feed the no-repeat rule', () => {
    // day 1 never logged; day 2 misses wpull → pair with synthetic day 1
    const s = evaluateAttempt(eighty, [successDay(0), day(2, allBut('wpull'))]);
    expect(s.failedDays).toBe(2); // synthetic day 1 + violation-failed day 2
    expect(s.dayScores[1]?.failReason).toBe('below-threshold');
    expect(s.dayScores[2]?.failReason).toBe('no-repeat-miss');
    expect(s.dayScores[2]?.violations).toContainEqual({
      itemId: 'wpull',
      firstDayIndex: 1,
      secondDayIndex: 2,
    });
  });
});

describe('strictness modes', () => {
  const pairMiss = [day(0, allBut('wpull')), day(1, allBut('wpull'))];

  test('flexible: violation fails the second day; challenge stays active', () => {
    const s = evaluateAttempt(eighty, pairMiss);
    expect(s.status).toBe('active');
    expect(s.dayScores[0]?.outcome).toBe('success');
    expect(s.dayScores[1]?.outcome).toBe('fail');
    expect(s.failedDays).toBe(1);
  });

  test('strict: violation requires a restart; earlier days keep their outcomes', () => {
    const s = evaluateAttempt(strict, [successDay(0), ...pairMiss.map((l, i) => ({ ...l, dayIndex: i + 1, localDate: addDays(START, i + 1) }))]);
    expect(s.status).toBe('restart-required');
    expect(s.restartReason).toBe('no-repeat-miss');
    expect(s.successDays).toBe(2); // day 0 and the first pair day still succeeded
  });

  test('strict: a merely below-threshold day does NOT restart', () => {
    const s = evaluateAttempt(strict, [failDay(0)]);
    expect(s.status).toBe('active');
    expect(s.failedDays).toBe(1);
  });

  test('hardcore: any incomplete day requires a restart', () => {
    const s = evaluateAttempt(hardcore, [successDay(0), failDay(1)]);
    expect(s.status).toBe('restart-required');
    expect(s.restartReason).toBe('incomplete-day');
  });

  test('hardcore: a violation-failed day restarts with the no-repeat reason', () => {
    const s = evaluateAttempt(hardcore, pairMiss);
    expect(s.status).toBe('restart-required');
    expect(s.restartReason).toBe('no-repeat-miss');
  });

  test('days after a restart trigger still count in stats but cannot change status', () => {
    const s = evaluateAttempt(hardcore, [failDay(0), successDay(1), failDay(2)]);
    expect(s.status).toBe('restart-required');
    expect(s.restartReason).toBe('incomplete-day');
    expect(s.successDays).toBe(1);
    expect(s.failedDays).toBe(2);
  });

  test('75 Hard: one missed item on a 5-item, 100% day restarts', () => {
    const good = (i: number) => day(i, ['workouts', 'diet', 'water', 'read', 'photo']);
    expect(evaluateAttempt(hard75, [good(0), good(1)]).status).toBe('active');
    const s = evaluateAttempt(hard75, [good(0), day(1, ['workouts', 'diet', 'water', 'read'])]);
    expect(s.status).toBe('restart-required');
    expect(s.restartReason).toBe('incomplete-day');
  });
});

describe('challenge success and mathematical impossibility', () => {
  test('succeeds on the 64th success day and cannot be downgraded afterwards', () => {
    const logs = Array.from({ length: 64 }, (_, i) => successDay(i));
    expect(evaluateAttempt(eighty, logs).status).toBe('succeeded');
    expect(evaluateAttempt(eighty, [...logs, failDay(64)]).status).toBe('succeeded');
  });

  test('16 failed days is survivable; the 17th makes success impossible', () => {
    const sixteenFails = Array.from({ length: 16 }, (_, i) => failDay(i));
    const at16 = evaluateAttempt(eighty, sixteenFails);
    expect(at16.status).toBe('active');
    expect(at16.mathematicallyImpossible).toBe(false);
    expect(at16.marginForError).toBe(0);
    expect(at16.successDaysNeeded).toBe(64); // needs success on every remaining day

    const at17 = evaluateAttempt(eighty, [...sixteenFails, failDay(16)]);
    expect(at17.status).toBe('failed');
    expect(at17.mathematicallyImpossible).toBe(true);
    expect(at17.marginForError).toBe(-1);
  });

  test('impossibility does not overwrite an earlier restart-required status', () => {
    const fails = Array.from({ length: 17 }, (_, i) => failDay(i));
    const s = evaluateAttempt(hardcore, fails);
    expect(s.status).toBe('restart-required');
    expect(s.mathematicallyImpossible).toBe(true);
  });
});

describe('retroactive edits recompute everything downstream', () => {
  test('completing one item on an old day flips a later violation and both day outcomes', () => {
    const logs = [
      ...Array.from({ length: 3 }, (_, i) => successDay(i)),
      day(3, allBut('wpull')), // wpull missed…
      day(4, allBut('wpull')), // …twice: day 4 fails by violation
      ...Array.from({ length: 5 }, (_, i) => successDay(i + 5)),
    ];
    const before = evaluateAttempt(eighty, logs);
    expect(before.dayScores[4]?.outcome).toBe('fail');
    expect(before.successDays).toBe(9);

    // amend day 3: user actually did their pull-ups
    const amended = logs.map((l) =>
      l.dayIndex === 3 ? { ...l, completedItemIds: [...l.completedItemIds, 'wpull'] } : l,
    );
    const after = evaluateAttempt(eighty, amended);
    expect(after.dayScores[4]?.outcome).toBe('success');
    expect(after.dayScores[4]?.violations).toEqual([]);
    expect(after.successDays).toBe(10); // every one of the 10 logged days now succeeds
    expect(after.failedDays).toBe(0);
  });

  test('an edit can retroactively trigger a strict restart', () => {
    const logs = [day(0, allBut('wpull')), successDay(1)];
    expect(evaluateAttempt(strict, logs).status).toBe('active');
    const amended = [logs[0] as DayLog, day(1, allBut('wpull'))];
    expect(evaluateAttempt(strict, amended).status).toBe('restart-required');
  });
});

describe('itemStats', () => {
  test('computes per-item completion over closed days, counting gaps as misses', () => {
    const logs = [day(0, ['wpull', 'bsocial']), day(2, ['wpull'])]; // day 1 unlogged
    const stats = itemStats(eighty, logs);
    const wpull = stats.find((s) => s.itemId === 'wpull');
    const bsocial = stats.find((s) => s.itemId === 'bsocial');
    expect(wpull).toEqual({ itemId: 'wpull', completed: 2, eligibleDays: 3, pct: (2 / 3) * 100 });
    expect(bsocial?.completed).toBe(1);
    expect(stats).toHaveLength(31);
  });

  test('zero closed days → 0% for everything', () => {
    const stats = itemStats(eighty, [day(0, REGULAR_IDS, { closed: false })]);
    expect(stats.every((s) => s.pct === 0 && s.eligibleDays === 0)).toBe(true);
  });
});
