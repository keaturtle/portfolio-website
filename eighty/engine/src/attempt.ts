import {
  AttemptState,
  ChallengeConfig,
  DayLog,
  DayScore,
  ItemStat,
  Rating,
} from './types';
import { requiredSuccessDays, scoreDay } from './scoring';
import { addDays } from './dayIdentity';

/**
 * Fill unlogged gaps in a dayIndex sequence with synthetic closed, empty days.
 * An unlogged day counts as a failed day with every item missed, and it feeds
 * the no-repeat-miss rule (Phase 0 ambiguity #2).
 */
export function fillGaps(logs: DayLog[]): DayLog[] {
  const sorted = [...logs].sort((a, b) => a.dayIndex - b.dayIndex);
  const filled: DayLog[] = [];
  for (const log of sorted) {
    let prev = filled[filled.length - 1];
    while (prev && prev.dayIndex < log.dayIndex - 1) {
      filled.push({
        dayIndex: prev.dayIndex + 1,
        localDate: addDays(prev.localDate, 1),
        completedItemIds: [],
        isTravel: false,
        closed: true,
      });
      prev = filled[filled.length - 1];
    }
    filled.push(log);
  }
  return filled;
}

/**
 * Recompute the full attempt state from raw logs. Pure and idempotent — this is
 * the single source of truth; nothing derived is ever stored. Amending any past
 * day means editing its log and calling this again.
 */
export function evaluateAttempt(cfg: ChallengeConfig, logs: DayLog[]): AttemptState {
  const needed = requiredSuccessDays(cfg);
  // Drop out-of-window logs BEFORE gap-filling so they can't synthesize phantom days.
  const filled = fillGaps(logs.filter((l) => l.dayIndex < cfg.durationDays));

  const dayScores: DayScore[] = [];
  let successDays = 0;
  let failedDays = 0;
  let closedCount = 0;
  let status: AttemptState['status'] = 'active';
  let restartReason: AttemptState['restartReason'];

  for (let i = 0; i < filled.length; i++) {
    const log = filled[i] as DayLog;
    const prev = i > 0 ? filled[i - 1] : undefined;
    const score = scoreDay(cfg, log, prev);
    dayScores.push(score);

    if (!log.closed) continue;
    closedCount++;
    if (score.outcome === 'success') successDays++;
    else failedDays++;

    if (status !== 'active') continue; // terminal already reached; keep stats only

    if (score.outcome === 'fail') {
      if (cfg.strictness === 'hardcore') {
        status = 'restart-required';
        restartReason =
          score.failReason === 'no-repeat-miss' ? 'no-repeat-miss' : 'incomplete-day';
      } else if (cfg.strictness === 'strict' && score.violations.length > 0) {
        status = 'restart-required';
        restartReason = 'no-repeat-miss';
      }
    } else if (successDays >= needed) {
      status = 'succeeded';
    }
  }

  const successDaysNeeded = Math.max(0, needed - successDays);
  const mathematicallyImpossible = successDaysNeeded > cfg.durationDays - closedCount;
  if (status === 'active' && mathematicallyImpossible) status = 'failed';

  const last = filled[filled.length - 1];
  const daysElapsed = last ? last.dayIndex + 1 : 0;

  const state: AttemptState = {
    status,
    daysElapsed,
    daysRemaining: cfg.durationDays - daysElapsed,
    successDays,
    failedDays,
    successDaysNeeded,
    marginForError: cfg.durationDays - needed - failedDays,
    mathematicallyImpossible,
    projectedEndLocalDate: last
      ? addDays(last.localDate, cfg.durationDays - 1 - last.dayIndex)
      : null,
    rollingPct: closedCount === 0 ? 0 : (successDays / closedCount) * 100,
    avgSatisfaction: average(logs, (l) => l.satisfaction),
    avgMood: average(logs, (l) => l.mood),
    dayScores,
  };
  if (restartReason) state.restartReason = restartReason;
  return state;
}

function average(logs: DayLog[], pick: (l: DayLog) => Rating | undefined): number | null {
  const vals = logs.filter((l) => l.closed).map(pick).filter((v): v is Rating => v !== undefined);
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

/** Per-item completion rates over closed days (gaps count as missed) — the habit leaderboard. */
export function itemStats(cfg: ChallengeConfig, logs: DayLog[]): ItemStat[] {
  const closed = fillGaps(logs.filter((l) => l.dayIndex < cfg.durationDays)).filter(
    (l) => l.closed,
  );
  return cfg.items.map((item) => {
    const completed = closed.filter((l) => l.completedItemIds.includes(item.id)).length;
    return {
      itemId: item.id,
      completed,
      eligibleDays: closed.length,
      pct: closed.length === 0 ? 0 : (completed / closed.length) * 100,
    };
  });
}
