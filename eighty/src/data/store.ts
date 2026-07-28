import { AppState } from 'react-native';
import { DayLog } from '@engine';
import { repo } from './db';
import { emitDataChanged, getDataVersion, subscribeData } from './events';
import { ActiveChallenge } from './repository';
import { refreshWidget } from './widget';

export interface ChallengeSnapshot {
  /** Data version this snapshot was built at — usable as a useMemo key. */
  version: number;
  active: ActiveChallenge | null;
  logs: DayLog[];
}

let cached: ChallengeSnapshot | null = null;

/**
 * The active challenge + its logs, cached until the next data change so every
 * subscribed screen shares one read (and useSyncExternalStore gets a stable
 * reference between versions).
 */
export function getChallengeSnapshot(): ChallengeSnapshot {
  const version = getDataVersion();
  if (!cached || cached.version !== version) {
    const active = repo.getActive();
    cached = { version, active, logs: active ? repo.getLogs(active.attemptId) : [] };
  }
  return cached;
}

function publishWidget(): void {
  const snap = getChallengeSnapshot();
  refreshWidget(snap.active?.config, snap.logs, snap.active?.name);
}

function msUntilNextLocalMidnight(): number {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5);
  return Math.max(1000, next.getTime() - now.getTime());
}

/**
 * Wires the app-lifecycle triggers, once, from the root layout:
 * - publish the widget snapshot now and after every data change;
 * - on foreground, bump the data version so date-dependent UI (the "move on to
 *   the next day" banner) re-renders with the current calendar date;
 * - same at local midnight while the app stays open.
 * Returns a cleanup for symmetry (the root layout never unmounts in practice).
 */
export function initDataStore(): () => void {
  publishWidget();
  const unsubscribe = subscribeData(publishWidget);
  const appState = AppState.addEventListener('change', (s) => {
    if (s === 'active') emitDataChanged();
  });
  let timer: ReturnType<typeof setTimeout>;
  const scheduleMidnight = () => {
    timer = setTimeout(() => {
      emitDataChanged();
      scheduleMidnight();
    }, msUntilNextLocalMidnight());
  };
  scheduleMidnight();
  return () => {
    unsubscribe();
    appState.remove();
    clearTimeout(timer);
  };
}
