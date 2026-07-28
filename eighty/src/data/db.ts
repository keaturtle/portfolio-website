import { DayLog } from '@engine';
import { emitDataChanged } from './events';
import {
  ActiveChallenge,
  BackupFile,
  ChallengeConfigUpdate,
  ChallengeListItem,
  ChallengePreset,
  ChallengeRepository,
  DayMeta,
} from './repository';
import { SqliteRepository } from './sqlite';

/**
 * Wraps the SQLite repository so every mutation announces itself (events.ts).
 * Screens subscribe through useActiveChallenge and update automatically — the
 * fix for stale lists/tabs after create/delete/edit from another screen.
 */
class NotifyingRepository implements ChallengeRepository {
  constructor(private readonly inner: ChallengeRepository) {}

  private mutate<T>(fn: () => T): T {
    const result = fn();
    emitDataChanged();
    return result;
  }

  getActive(): ActiveChallenge | null {
    return this.inner.getActive();
  }
  getLogs(attemptId: number): DayLog[] {
    return this.inner.getLogs(attemptId);
  }
  getSetting(key: string): string | null {
    return this.inner.getSetting(key);
  }
  listChallenges(): ChallengeListItem[] {
    return this.inner.listChallenges();
  }
  getChallengeDetail(challengeId: number): ActiveChallenge | null {
    return this.inner.getChallengeDetail(challengeId);
  }
  exportAllData(): BackupFile {
    return this.inner.exportAllData();
  }

  startChallenge(preset: ChallengePreset, todayLabel: string, startLabel?: string): ActiveChallenge {
    return this.mutate(() => this.inner.startChallenge(preset, todayLabel, startLabel));
  }
  setItemDone(attemptId: number, dayIndex: number, itemId: string, done: boolean): void {
    this.mutate(() => this.inner.setItemDone(attemptId, dayIndex, itemId, done));
  }
  setDayMeta(attemptId: number, dayIndex: number, meta: DayMeta): void {
    this.mutate(() => this.inner.setDayMeta(attemptId, dayIndex, meta));
  }
  closeDay(attemptId: number, dayIndex: number, nextLabel: string): void {
    this.mutate(() => this.inner.closeDay(attemptId, dayIndex, nextLabel));
  }
  setSetting(key: string, value: string): void {
    this.mutate(() => this.inner.setSetting(key, value));
  }
  updateChallengeConfig(challengeId: number, update: ChallengeConfigUpdate): void {
    this.mutate(() => this.inner.updateChallengeConfig(challengeId, update));
  }
  activateChallenge(challengeId: number): void {
    this.mutate(() => this.inner.activateChallenge(challengeId));
  }
  deleteChallenge(challengeId: number): void {
    this.mutate(() => this.inner.deleteChallenge(challengeId));
  }
  importAllData(data: BackupFile): void {
    this.mutate(() => this.inner.importAllData(data));
  }
}

/** One shared connection for the whole app — screens no longer each open their own. */
export const repo: ChallengeRepository = new NotifyingRepository(new SqliteRepository());
