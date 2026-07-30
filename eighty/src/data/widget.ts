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
const PROBE_KEY = 'bridge_probe';

/** True when the native App Group module is present (false in Expo Go). */
export function isWidgetBridgeAvailable(): boolean {
  const g = globalThis as { expo?: { modules?: Record<string, unknown> } };
  return g.expo?.modules?.ExtensionStorage != null;
}

export type WidgetBridgeStatus = 'ok' | 'broken' | 'unavailable';

/**
 * Round-trips a probe value through the shared App Group to test the *app* half of the
 * widget bridge, independent of the widget itself:
 *   - 'ok'          the app can write AND read the shared container — any remaining
 *                   empty-widget is on the widget's side (or just needs a refresh);
 *   - 'broken'      the app can't read back its own write — the App Group entitlement
 *                   isn't valid in this build (an Apple-side App Group setup step);
 *   - 'unavailable' no native module (Expo Go) — nothing to test here.
 * This is what makes the widget's "not synced" actionable: it says which side to fix.
 */
export function checkWidgetBridge(): WidgetBridgeStatus {
  if (!isWidgetBridgeAvailable()) return 'unavailable';
  try {
    const token = `probe-${Date.now()}`;
    storage.set(PROBE_KEY, token);
    return storage.get(PROBE_KEY) === token ? 'ok' : 'broken';
  } catch {
    return 'broken';
  }
}

/** Write the snapshot to the shared App Group and ask WidgetKit to refresh. No-op in Expo Go. */
export function publishWidgetSnapshot(snap: WidgetSnapshot | null): void {
  // Heartbeat first, on its own, so the "is the bridge alive?" signal lands even if
  // writing the snapshot itself ever fails. The widget's empty state reads it to tell
  // "no data yet" apart from "bridge broken".
  try {
    storage.set(HEARTBEAT_KEY, new Date().toISOString());
  } catch {
    // No native module (Expo Go) or App Group not provisioned — ignore.
  }
  try {
    if (snap) storage.set(TODAY_KEY, JSON.stringify(snap));
    else storage.remove(TODAY_KEY);
    ExtensionStorage.reloadWidget();
  } catch {
    // ignore
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
