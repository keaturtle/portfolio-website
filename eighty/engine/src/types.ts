export type Strictness = 'flexible' | 'strict' | 'hardcore';
export type TimeOfDay = 'morning' | 'day' | 'evening' | 'bed';
export type Rating = 1 | 2 | 3 | 4 | 5;

export interface ItemDef {
  id: string;
  categoryId: string;
  label: string;
  isBonus: boolean;
  /** Today-screen ordering hint; ignored by all scoring. */
  timeOfDay?: TimeOfDay;
}

export interface ChallengeConfig {
  durationDays: number;
  /** A day succeeds when (regular done + bonus done) / regular total ≥ this %. */
  dailyThresholdPct: number;
  /** The challenge succeeds when success days ≥ ceil(durationDays × this %). */
  challengeThresholdPct: number;
  strictness: Strictness;
  noRepeatMiss: boolean;
  travelExemption: boolean;
  items: ItemDef[];
}

export interface DayLog {
  /** 0-based counter within an attempt. Day identity is this counter, never the clock. */
  dayIndex: number;
  /** Local-date label (YYYY-MM-DD) stamped when the day was opened. */
  localDate: string;
  completedItemIds: string[];
  isTravel: boolean;
  satisfaction?: Rating;
  mood?: Rating;
  notes?: string;
  /** A day only counts toward success/fail once closed. */
  closed: boolean;
}

export interface NoRepeatViolation {
  itemId: string;
  firstDayIndex: number;
  secondDayIndex: number;
}

export type DayOutcome = 'success' | 'fail' | 'pending';
export type FailReason = 'below-threshold' | 'no-repeat-miss';

export interface DayScore {
  dayIndex: number;
  completedRegular: number;
  totalRegular: number;
  completedBonus: number;
  /** Regular-item count needed to hit the daily threshold (bonus credit included in the comparison). */
  requiredItems: number;
  /** (regular + bonus done) / regular total × 100. May exceed 100. */
  pct: number;
  metThreshold: boolean;
  /** No-repeat-miss pairs ending on this day. */
  violations: NoRepeatViolation[];
  outcome: DayOutcome;
  failReason?: FailReason;
}

export type AttemptStatus = 'active' | 'succeeded' | 'failed' | 'restart-required';
export type RestartReason = 'no-repeat-miss' | 'incomplete-day';

export interface AttemptState {
  status: AttemptStatus;
  restartReason?: RestartReason;
  /** Days started (highest dayIndex + 1, gaps included). */
  daysElapsed: number;
  /** Days of the window not yet started. */
  daysRemaining: number;
  successDays: number;
  failedDays: number;
  /** Success days still needed to reach the challenge threshold. */
  successDaysNeeded: number;
  /** Closed or future days that may still be failed without losing the challenge. */
  marginForError: number;
  mathematicallyImpossible: boolean;
  /** Local date of the final challenge day, or null before any day is logged. */
  projectedEndLocalDate: string | null;
  /** Success days / closed days × 100 (0 when nothing closed). */
  rollingPct: number;
  avgSatisfaction: number | null;
  avgMood: number | null;
  dayScores: DayScore[];
}

export interface ItemStat {
  itemId: string;
  completed: number;
  eligibleDays: number;
  pct: number;
}
