import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { localDateLabel } from '@engine';
import { ActiveChallenge, ChallengePreset, ChallengeRepository } from './repository';

export function todayLabel(): string {
  return localDateLabel(Date.now(), Intl.DateTimeFormat().resolvedOptions().timeZone);
}

/** Starts `preset`, confirming first if it would archive an already-active challenge. */
export function confirmAndStart(
  repo: ChallengeRepository,
  active: ActiveChallenge | null,
  preset: ChallengePreset,
  refresh: () => void,
): void {
  const go = () => {
    repo.startChallenge(preset, todayLabel());
    refresh();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/');
  };
  if (active) {
    Alert.alert(
      'Start new challenge?',
      `This will archive "${active.name}" and start "${preset.name}" today.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start', style: 'destructive', onPress: go },
      ],
    );
  } else {
    go();
  }
}
