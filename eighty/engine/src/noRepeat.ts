import { ChallengeConfig, DayLog, NoRepeatViolation } from './types';

/**
 * No-repeat-miss pairs ending on `log`: regular items missed on both `prev` and `log`.
 * Exempt when the rule is off, there is no closed previous day, or (with travel
 * exemption on) either day of the pair is a travel day. Bonus items never violate.
 */
export function findViolations(
  cfg: ChallengeConfig,
  log: DayLog,
  prev?: DayLog,
): NoRepeatViolation[] {
  if (!cfg.noRepeatMiss || !prev || !prev.closed) return [];
  if (cfg.travelExemption && (log.isTravel || prev.isTravel)) return [];
  const doneToday = new Set(log.completedItemIds);
  const donePrev = new Set(prev.completedItemIds);
  return cfg.items
    .filter((i) => !i.isBonus && !doneToday.has(i.id) && !donePrev.has(i.id))
    .map((i) => ({
      itemId: i.id,
      firstDayIndex: prev.dayIndex,
      secondDayIndex: log.dayIndex,
    }));
}

/**
 * Regular items missed on `yesterday` — the "don't miss twice" warning list for today.
 * Empty when the rule can't fire (rule off, yesterday open, or a travel exemption applies).
 */
export function atRiskItems(
  cfg: ChallengeConfig,
  yesterday?: DayLog,
  todayIsTravel = false,
): string[] {
  if (!cfg.noRepeatMiss || !yesterday || !yesterday.closed) return [];
  if (cfg.travelExemption && (yesterday.isTravel || todayIsTravel)) return [];
  const done = new Set(yesterday.completedItemIds);
  return cfg.items.filter((i) => !i.isBonus && !done.has(i.id)).map((i) => i.id);
}
