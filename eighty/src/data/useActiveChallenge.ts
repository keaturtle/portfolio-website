import { useSyncExternalStore } from 'react';
import { repo } from './db';
import { subscribeData } from './events';
import { getChallengeSnapshot } from './store';

/**
 * Live active-challenge + logs. Re-renders automatically after any repository
 * write (from any screen), on foreground, and at midnight — see events.ts/store.ts.
 * `version` identifies the snapshot; use it as a useMemo key for derived data.
 */
export function useActiveChallenge() {
  const snap = useSyncExternalStore(subscribeData, getChallengeSnapshot);
  return { repo, active: snap.active, logs: snap.logs, version: snap.version };
}
