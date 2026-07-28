import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { localDateLabel } from '@engine';
import { ActiveChallenge, ChallengePreset, ChallengeRepository } from './repository';

export function todayLabel(): string {
  return localDateLabel(Date.now(), Intl.DateTimeFormat().resolvedOptions().timeZone);
}

/**
 * Starts `preset`, confirming first if it would archive an already-active challenge.
 * `startLabel` (a YYYY-MM-DD in the past) back-dates day 0; defaults to today.
 * No refresh callback — the repository write notifies every screen (see events.ts).
 */
export function confirmAndStart(
  repo: ChallengeRepository,
  active: ActiveChallenge | null,
  preset: ChallengePreset,
  startLabel?: string,
): void {
  const today = todayLabel();
  const start = startLabel ?? today;
  const go = () => {
    repo.startChallenge(preset, today, start);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/');
  };
  const whenText = start < today ? `starting from ${start}` : 'today';
  if (active) {
    Alert.alert(
      'Start a new challenge?',
      `This pauses "${active.name}" (you can switch back anytime) and starts "${preset.name}" ${whenText}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start', style: 'destructive', onPress: go },
      ],
    );
  } else {
    go();
  }
}
