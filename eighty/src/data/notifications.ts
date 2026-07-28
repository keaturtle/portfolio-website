import * as Notifications from 'expo-notifications';

const MORNING_ID = 'eighty-morning-closeout';
const EVENING_ID = 'eighty-evening-unchecked';

/** The fixed local times the two daily reminders fire at (shown in Settings copy). */
export const MORNING_HOUR = 8;
export const EVENING_HOUR = 21;

export type PermissionResult = 'granted' | 'denied' | 'blocked';

/**
 * Ensure notification permission, asking only when iOS still allows the prompt.
 * 'blocked' means the user must flip the switch in iOS Settings — the caller
 * should offer a direct "Open Settings" path rather than a dead-end alert.
 */
export async function ensureNotificationPermission(): Promise<PermissionResult> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return 'granted';
  if (!current.canAskAgain) return 'blocked';
  const requested = await Notifications.requestPermissionsAsync();
  if (requested.granted) return 'granted';
  return requested.canAskAgain ? 'denied' : 'blocked';
}

async function scheduleDaily(id: string, title: string, body: string, hour: number, minute: number): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined);
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: { title, body },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
  });
}

export async function setMorningReminder(enabled: boolean): Promise<void> {
  if (!enabled) {
    await Notifications.cancelScheduledNotificationAsync(MORNING_ID).catch(() => undefined);
    return;
  }
  await scheduleDaily(
    MORNING_ID,
    'Ready for a new day?',
    'Wrap up yesterday, then take on today’s list.',
    MORNING_HOUR,
    0,
  );
}

export async function setEveningReminder(enabled: boolean): Promise<void> {
  if (!enabled) {
    await Notifications.cancelScheduledNotificationAsync(EVENING_ID).catch(() => undefined);
    return;
  }
  await scheduleDaily(
    EVENING_ID,
    'Evening check-in',
    'A few items may still be open — close them out before bed.',
    EVENING_HOUR,
    0,
  );
}

export async function getReminderState(): Promise<{ morning: boolean; evening: boolean }> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const ids = new Set(scheduled.map((n) => n.identifier));
  return { morning: ids.has(MORNING_ID), evening: ids.has(EVENING_ID) };
}
