import { useCallback, useEffect, useState } from 'react';
import { DayLog } from '@engine';
import { repo } from './db';
import { ActiveChallenge, ChallengeRepository } from './repository';
import { refreshWidget } from './widget';

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

  const refresh = useCallback(() => {
    const next = snapshot(repo);
    setSnap(next);
    // Keep the home-screen widget in sync after every mutation (no-op in Expo Go).
    refreshWidget(next.active?.config, next.logs, next.active?.name);
  }, []);

  // Publish once on mount so the widget reflects the latest state on app open.
  useEffect(() => {
    refreshWidget(snap.active?.config, snap.logs, snap.active?.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { repo, active: snap.active, logs: snap.logs, refresh };
}
