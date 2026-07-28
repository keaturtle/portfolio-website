import { ExtensionStorage } from '@bacons/apple-targets';
import { ChallengeConfig, DayLog, evaluateAttempt, scoreDay } from '@engine';

/**
 * Home-screen widget data bridge (M13).
 *
 * The widget can't read the app's SQLite DB, so the app writes a tiny snapshot of
 * "today's ring" to a shared App Group; the WidgetKit extension reads it. See
 * eighty/WIDGET.md and targets/widget/.
 *
 * In Expo Go the native `ExtensionStorage` module is absent, so every call here is a
 * safe no-op (the library falls back to stubs) — the app keeps working unchanged.
 */

export const WIDGET_APP_GROUP = 'group.com.keatentuttle.eighty';
const TODAY_KEY = 'today';
const HEARTBEAT_KEY = 'heartbeat';

export interface WidgetSnapshot {
  /** Today's day-progress %, clamped 0–100. */
  pct: number;
  /** Daily success threshold (for the goal tick / context). */
  goalPct: number;
  /** 1-based day number within the attempt. */
  dayNumber: number;
  totalDays: number;
  successDays: number;
  /** "You can still miss N more days and succeed." */
  marginForError: number;
  challengeName: string;
  updatedAt: string;
}

/**
 * Pure: derive the widget snapshot from the active challenge's raw logs. Returns null
 * when there's no open day (no active challenge, or the challenge is finished) — the
 * widget then shows its empty state. Composes already-tested engine primitives only.
 */
export function buildWidgetSnapshot(
  config: ChallengeConfig,
  logs: DayLog[],
  challengeName: string,
): WidgetSnapshot | null {
  const openDay = logs.find((l) => !l.closed);
  if (!openDay) return null;
  const prev = logs.find((l) => l.dayIndex === openDay.dayIndex - 1);
  const score = scoreDay(config, openDay, prev);
  const state = evaluateAttempt(config, logs);
  return {
    pct: Math.max(0, Math.min(100, Math.round(score.pct))),
    goalPct: config.dailyThresholdPct,
    dayNumber: openDay.dayIndex + 1,
    totalDays: config.durationDays,
    successDays: state.successDays,
    marginForError: state.marginForError,
    challengeName,
    updatedAt: new Date().toISOString(),
  };
}

const storage = new ExtensionStorage(WIDGET_APP_GROUP);

/** Write the snapshot to the shared App Group and ask WidgetKit to refresh. No-op in Expo Go. */
export function publishWidgetSnapshot(snap: WidgetSnapshot | null): void {
  try {
    storage.set(TODAY_KEY, snap ? JSON.stringify(snap) : undefined);
    // Heartbeat proves the app→App Group→widget bridge works even when there's no snapshot;
    // the widget's empty state reads it to distinguish "no data" from "bridge broken".
    storage.set(HEARTBEAT_KEY, new Date().toISOString());
    ExtensionStorage.reloadWidget();
  } catch {
    // No native module (Expo Go) or App Group not provisioned yet — ignore.
  }
}

/**
 * Build from the active challenge and publish in one call; publishes the empty state
 * when inactive. The data store calls this on launch, after every write, and on
 * foreground (see store.ts) — no screen involvement.
 */
export function refreshWidget(
  config: ChallengeConfig | null | undefined,
  logs: DayLog[],
  challengeName: string | null | undefined,
): void {
  if (!config || !challengeName) {
    publishWidgetSnapshot(null);
    return;
  }
  publishWidgetSnapshot(buildWidgetSnapshot(config, logs, challengeName));
}
