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

export interface BackupDay {
  dayIndex: number;
  localDate: string;
  isTravel: boolean;
  satisfaction: number | null;
  mood: number | null;
  notes: string | null;
  closedAtUtc: string | null;
  completedItemIds: string[];
}

export interface BackupAttempt {
  attemptNo: number;
  startedLocalDate: string;
  status: string;
  endedReason: string | null;
  days: BackupDay[];
}

export interface BackupChallenge {
  name: string;
  durationDays: number;
  dailyThresholdPct: number;
  challengeThresholdPct: number;
  strictness: Strictness;
  noRepeatMiss: boolean;
  travelExemption: boolean;
  status: string;
  createdAtUtc: string;
  categories: PresetCategory[];
  items: PresetItem[];
  attempts: BackupAttempt[];
}

/** Full-fidelity dump of every challenge/attempt/day — the backup/restore format (M9). */
export interface BackupFile {
  schemaVersion: 1;
  exportedAtUtc: string;
  challenges: BackupChallenge[];
  settings: Record<string, string>;
}

/**
 * Editable challenge config fields (scalars only — the checklist/items are edited
 * elsewhere). Every field is optional; only the provided ones are updated. Because
 * all stats recompute from raw logs, changing any of these re-scores every past day.
 */
export interface ChallengeConfigUpdate {
  name?: string;
  durationDays?: number;
  dailyThresholdPct?: number;
  challengeThresholdPct?: number;
  strictness?: Strictness;
  noRepeatMiss?: boolean;
  travelExemption?: boolean;
}

/**
 * All persistence goes through this interface so a synced implementation can
 * replace SQLite later without touching the engine or the UI.
 */
export interface ChallengeRepository {
  getActive(): ActiveChallenge | null;
  /**
   * Creates challenge + attempt. Day 0 is labelled `startLabel` (defaults to today).
   * If `startLabel` is before today, days 0…(today−start) are pre-created — earlier
   * ones closed-but-empty so they count and can be filled in, the last one open.
   */
  startChallenge(preset: ChallengePreset, todayLabel: string, startLabel?: string): ActiveChallenge;
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
  /** Updates scalar config fields in place. Stats re-score from raw logs on next read. */
  updateChallengeConfig(challengeId: number, update: ChallengeConfigUpdate): void;
  /** Archives whatever is active and reactivates this challenge's existing attempt in place. */
  activateChallenge(challengeId: number): void;
  /** Deletes a challenge and everything under it. Irreversible. */
  deleteChallenge(challengeId: number): void;
  /** Full-fidelity snapshot of every challenge/attempt/day/setting — the backup format. */
  exportAllData(): BackupFile;
  /** Replaces everything currently stored with the snapshot. Irreversible. */
  importAllData(data: BackupFile): void;
}
