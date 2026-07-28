import { Alert, ScrollView, Switch, Text, TextInput, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { AttemptState, DayLog, evaluateAttempt, scoreDay } from '@engine';
import { useActiveChallenge } from '@/data/useActiveChallenge';
import { usePalette, radius, type as t } from '@/theme/tokens';
import { CheckRow } from '@/ui/CheckRow';
import { RatingScale } from '@/ui/RatingScale';

const OUTCOME_LABEL: Record<string, string> = {
  success: 'Success',
  fail: 'Failed',
  pending: 'Open',
};

/** Human-readable warning when an edit would change the attempt's outcome, per PLAN.md #11. */
function consequenceMessage(before: AttemptState, after: AttemptState): string | null {
  if (after.status === 'restart-required' && before.status !== 'restart-required') {
    const cause =
      after.restartReason === 'no-repeat-miss'
        ? 'missing the same item two days in a row'
        : 'a day falling below threshold under strict/hardcore rules';
    return `This restarts the attempt — ${cause}.`;
  }
  if (after.status === 'failed' && before.status !== 'failed') {
    return 'This makes challenge success mathematically impossible.';
  }
  if (before.status === 'succeeded' && after.status !== 'succeeded') {
    return 'This undoes the challenge’s success.';
  }
  return null;
}

export default function DayDetailScreen() {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const { dayIndex: dayIndexParam } = useLocalSearchParams<{ dayIndex: string }>();
  const dayIndex = Number(dayIndexParam);
  const { repo, active, logs } = useActiveChallenge();
  const card = { backgroundColor: p.card, borderRadius: radius.card };

  const log = logs.find((l) => l.dayIndex === dayIndex);
  const prev = logs.find((l) => l.dayIndex === dayIndex - 1);

  if (!active || !log) {
    return (
      <>
        <Stack.Screen
          options={{ headerShown: true, title: 'Day', headerStyle: { backgroundColor: p.bg }, headerTintColor: p.ink }}
        />
        <View style={[styles.empty, { backgroundColor: p.bg }]}>
          <Text style={{ color: p.sub }}>Day not found.</Text>
        </View>
      </>
    );
  }

  const score = scoreDay(active.config, log, prev);
  const outcome = OUTCOME_LABEL[score.outcome] ?? score.outcome;
  const done = new Set(log.completedItemIds);
  const categoryName = (id: string) => active.categories.find((c) => c.id === id)?.name ?? '';

  const withConfirmation = (simulate: (l: DayLog) => DayLog, commit: () => void) => {
    const simulatedLogs = logs.map((l) => (l.dayIndex === dayIndex ? simulate(l) : l));
    const before = evaluateAttempt(active.config, logs);
    const after = evaluateAttempt(active.config, simulatedLogs);
    const message = consequenceMessage(before, after);
    if (!message) {
      commit();
      return;
    }
    Alert.alert('Heads up', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Save anyway', style: 'destructive', onPress: commit },
    ]);
  };

  const toggleItem = (itemId: string) => {
    const willBeDone = !done.has(itemId);
    withConfirmation(
      (l) => ({
        ...l,
        completedItemIds: willBeDone
          ? [...l.completedItemIds, itemId]
          : l.completedItemIds.filter((id) => id !== itemId),
      }),
      () => {
        Haptics.impactAsync(willBeDone ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
        repo.setItemDone(active.attemptId, dayIndex, itemId, willBeDone);
      },
    );
  };

  const toggleTravel = (isTravel: boolean) => {
    withConfirmation(
      (l) => ({ ...l, isTravel }),
      () => {
        Haptics.selectionAsync();
        repo.setDayMeta(active.attemptId, dayIndex, { isTravel });
      },
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: `Day ${dayIndex + 1} · ${log.localDate}`,
          headerStyle: { backgroundColor: p.bg },
          headerTintColor: p.ink,
          headerShadowVisible: false,
        }}
      />
      <ScrollView
        style={{ backgroundColor: p.bg }}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 16,
        }}
      >
        <View style={[card, styles.summary]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[t.h1, { color: p.ink, fontSize: 22 }]}>{outcome}</Text>
            <Text style={[t.stat, { color: p.ink }]}>{Math.round(score.pct)}%</Text>
          </View>
          <Text style={{ fontSize: 12.5, color: p.sub, marginTop: 4 }}>
            {score.completedRegular} / {score.totalRegular} items
            {score.completedBonus > 0 ? ` · +${score.completedBonus} bonus` : ''}
          </Text>
          {score.violations.length > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 }}>
              <Ionicons name="alert-circle-outline" size={13} color={p.sienna} />
              <Text style={{ fontSize: 12.5, color: p.sienna }}>
                Missed {score.violations.length} item{score.violations.length === 1 ? '' : 's'} two
                days in a row
              </Text>
            </View>
          )}
        </View>

        <View style={[card, styles.section]}>
          <Text style={[t.cardTitle, { color: p.ink, marginBottom: 4 }]}>Items</Text>
          {active.items.map((it) => (
            <CheckRow
              key={it.id}
              label={it.label}
              categoryName={categoryName(it.categoryId)}
              done={done.has(it.id)}
              isBonus={it.isBonus}
              isAvoidance={it.isAvoidance}
              missedYesterday={false}
              palette={p}
              onToggle={() => toggleItem(it.id)}
            />
          ))}
        </View>

        <View style={[card, styles.section]}>
          <Text style={[t.cardTitle, { color: p.ink, marginBottom: 6 }]}>Day log</Text>
          <RatingScale
            label="Satisfaction"
            value={log.satisfaction}
            palette={p}
            onChange={(v) => repo.setDayMeta(active.attemptId, dayIndex, { satisfaction: v })}
          />
          <RatingScale
            label="Mood"
            value={log.mood}
            palette={p}
            onChange={(v) => repo.setDayMeta(active.attemptId, dayIndex, { mood: v })}
          />
          <View style={[styles.travel, { borderTopColor: p.line }]}>
            <Text style={{ fontSize: 13.5, color: p.sub }}>Travel day</Text>
            <Switch
              value={log.isTravel}
              onValueChange={toggleTravel}
              trackColor={{ true: p.mint, false: p.card2 }}
              thumbColor={p.card}
              accessibilityLabel="Travel day"
            />
          </View>
          <TextInput
            style={[styles.notes, { backgroundColor: p.card2, color: p.ink }]}
            placeholder="Notes…"
            placeholderTextColor={p.sub}
            multiline
            defaultValue={log.notes ?? ''}
            onEndEditing={(e) => repo.setDayMeta(active.attemptId, dayIndex, { notes: e.nativeEvent.text })}
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  summary: { padding: 16, marginBottom: 14 },
  section: { padding: 16, marginBottom: 14 },
  travel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderTopWidth: 1,
    marginTop: 6,
  },
  notes: {
    marginTop: 10,
    borderRadius: radius.notes,
    padding: 12,
    fontSize: 13.5,
    minHeight: 60,
    textAlignVertical: 'top',
  },
});
