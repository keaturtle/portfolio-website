import * as Notifications from 'expo-notifications';

const MORNING_ID = 'eighty-morning-closeout';
const EVENING_ID = 'eighty-evening-unchecked';

export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
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
    'Close out yesterday',
    "Log what's left from yesterday before today gets away from you.",
    8,
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
    "You've got unchecked items",
    'A few boxes are still open for today — quick check before bed?',
    21,
    0,
  );
}

export async function getReminderState(): Promise<{ morning: boolean; evening: boolean }> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const ids = new Set(scheduled.map((n) => n.identifier));
  return { morning: ids.has(MORNING_ID), evening: ids.has(EVENING_ID) };
}
