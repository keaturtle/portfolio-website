/**
 * Minimal external store for "the database changed" notifications.
 *
 * Every repository mutation bumps the version and notifies listeners (see db.ts);
 * useActiveChallenge subscribes via useSyncExternalStore so every mounted screen
 * re-reads after any write, from any screen. This is the single invalidation path —
 * screens never manually refresh.
 *
 * Deliberately import-free so it can sit below both the data layer and React.
 */
let version = 0;
const listeners = new Set<() => void>();

export function getDataVersion(): number {
  return version;
}

export function subscribeData(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitDataChanged(): void {
  version++;
  for (const listener of [...listeners]) listener();
}
