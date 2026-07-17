import { useCallback, useMemo, useState } from 'react';
import { DayLog } from '@engine';
import { SqliteRepository } from './sqlite';
import { ActiveChallenge } from './repository';

export interface ChallengeSnapshot {
  active: ActiveChallenge | null;
  logs: DayLog[];
}

function snapshot(repo: SqliteRepository): ChallengeSnapshot {
  const active = repo.getActive();
  return { active, logs: active ? repo.getLogs(active.attemptId) : [] };
}

/** Shared active-challenge + logs state, reloaded on demand after any write. */
export function useActiveChallenge() {
  const repo = useMemo(() => new SqliteRepository(), []);
  const [snap, setSnap] = useState<ChallengeSnapshot>(() => snapshot(repo));

  const refresh = useCallback(() => setSnap(snapshot(repo)), [repo]);

  return { repo, active: snap.active, logs: snap.logs, refresh };
}
