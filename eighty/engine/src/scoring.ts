import { ChallengeConfig, DayLog, DayScore, ItemDef } from './types';
import { findViolations } from './noRepeat';

export function regularItems(cfg: ChallengeConfig): ItemDef[] {
  return cfg.items.filter((i) => !i.isBonus);
}

/** Regular-item completions needed to hit the daily threshold (≥ compares; bonus credit counts). */
export function requiredItems(cfg: ChallengeConfig): number {
  return Math.ceil((regularItems(cfg).length * cfg.dailyThresholdPct) / 100);
}

/** Success days needed to win the challenge (e.g. 80 days × 80% = 64). */
export function requiredSuccessDays(cfg: ChallengeConfig): number {
  return Math.ceil((cfg.durationDays * cfg.challengeThresholdPct) / 100);
}

/**
 * Score a single day. Mode-independent: a no-repeat violation always marks the day
 * failed; what that failure *causes* (nothing / restart) is decided in attempt.ts.
 */
export function scoreDay(cfg: ChallengeConfig, log: DayLog, prev?: DayLog): DayScore {
  const regularIds = new Set(regularItems(cfg).map((i) => i.id));
  const bonusIds = new Set(cfg.items.filter((i) => i.isBonus).map((i) => i.id));
  const done = new Set(log.completedItemIds);

  let completedRegular = 0;
  let completedBonus = 0;
  for (const id of done) {
    if (regularIds.has(id)) completedRegular++;
    else if (bonusIds.has(id)) completedBonus++;
  }

  const totalRegular = regularIds.size;
  const required = requiredItems(cfg);
  const credit = completedRegular + completedBonus;
  const metThreshold = credit >= required;
  const pct = totalRegular === 0 ? 100 : (credit / totalRegular) * 100;
  const violations = findViolations(cfg, log, prev);

  const score: DayScore = {
    dayIndex: log.dayIndex,
    completedRegular,
    totalRegular,
    completedBonus,
    requiredItems: required,
    pct,
    metThreshold,
    violations,
    outcome: 'pending',
  };

  if (log.closed) {
    if (!metThreshold) {
      score.outcome = 'fail';
      score.failReason = 'below-threshold';
    } else if (violations.length > 0) {
      score.outcome = 'fail';
      score.failReason = 'no-repeat-miss';
    } else {
      score.outcome = 'success';
    }
  }
  return score;
}
