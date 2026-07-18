import { ChallengeConfig, DayLog, Rating, Strictness, TimeOfDay } from '@engine';

export interface PresetCategory {
  id: string;
  name: string;
}

export interface PresetItem {
  id: string;
  categoryId: string;
  label: string;
  isBonus: boolean;
  timeOfDay: TimeOfDay;
}

export interface ChallengePreset {
  name: string;
  durationDays: number;
  dailyThresholdPct: number;
  challengeThresholdPct: number;
  strictness: Strictness;
  noRepeatMiss: boolean;
  travelExemption: boolean;
  categories: PresetCategory[];
  items: PresetItem[];
}

export interface ActiveChallenge {
  challengeId: number;
  attemptId: number;
  name: string;
  config: ChallengeConfig;
  categories: PresetCategory[];
  items: PresetItem[];
}

export interface DayMeta {
  satisfaction?: Rating;
  mood?: Rating;
  notes?: string;
  isTravel?: boolean;
}

export interface ChallengeListItem {
  challengeId: number;
  name: string;
  status: 'active' | 'archived';
  createdAtUtc: string;
}

/**
 * All persistence goes through this interface so a synced implementation can
 * replace SQLite later without touching the engine or the UI.
 */
export interface ChallengeRepository {
  getActive(): ActiveChallenge | null;
  /** Creates challenge + attempt and opens day 0 with today's label. */
  startChallenge(preset: ChallengePreset, todayLabel: string): ActiveChallenge;
  /** Raw logs for the engine, ordered by dayIndex. Exactly one may be open. */
  getLogs(attemptId: number): DayLog[];
  setItemDone(attemptId: number, dayIndex: number, itemId: string, done: boolean): void;
  setDayMeta(attemptId: number, dayIndex: number, meta: DayMeta): void;
  /** Closes the day and opens the next one (labelled with the current local date). */
  closeDay(attemptId: number, dayIndex: number, nextLabel: string): void;
  getSetting(key: string): string | null;
  setSetting(key: string, value: string): void;
  /** All challenges (active + archived), most recently created first. */
  listChallenges(): ChallengeListItem[];
  /** Full config/categories/items for any challenge, keyed to its most recent attempt. */
  getChallengeDetail(challengeId: number): ActiveChallenge | null;
  /** Archives whatever is active and reactivates this challenge's existing attempt in place. */
  activateChallenge(challengeId: number): void;
  /** Deletes a challenge and everything under it. Irreversible. */
  deleteChallenge(challengeId: number): void;
}
