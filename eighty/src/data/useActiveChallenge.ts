import { useCallback, useState } from 'react';
import { DayLog } from '@engine';
import { repo } from './db';
import { ActiveChallenge, ChallengeRepository } from './repository';

export interface ChallengeSnapshot {
  active: ActiveChallenge | null;
  logs: DayLog[];
}

function snapshot(r: ChallengeRepository): ChallengeSnapshot {
  const active = r.getActive();
  return { active, logs: active ? r.getLogs(active.attemptId) : [] };
}

/** Shared active-challenge + logs state, reloaded on demand after any write. */
export function useActiveChallenge() {
  const [snap, setSnap] = useState<ChallengeSnapshot>(() => snapshot(repo));

  const refresh = useCallback(() => setSnap(snapshot(repo)), []);

  return { repo, active: snap.active, logs: snap.logs, refresh };
}
