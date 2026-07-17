import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { scoreDay } from '@engine';
import { useActiveChallenge } from '@/data/useActiveChallenge';
import { usePalette, radius, type as t } from '@/theme/tokens';

const OUTCOME_LABEL: Record<string, string> = {
  success: 'Success',
  fail: 'Failed',
  pending: 'Open',
};

/** Read-only day detail. Editing a past day arrives in M6 (with restart-confirmation UI). */
export default function DayDetailScreen() {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const { dayIndex: dayIndexParam } = useLocalSearchParams<{ dayIndex: string }>();
  const dayIndex = Number(dayIndexParam);
  const { active, logs } = useActiveChallenge();
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
            {log.isTravel ? ' · travel day' : ''}
          </Text>
          {score.violations.length > 0 && (
            <Text style={{ fontSize: 12.5, color: p.sienna, marginTop: 6 }}>
              ⚠ Missed {score.violations.length} item{score.violations.length === 1 ? '' : 's'} two
              days in a row
            </Text>
          )}
        </View>

        <View style={[card, styles.section]}>
          <Text style={[t.cardTitle, { color: p.ink, marginBottom: 8 }]}>Items</Text>
          {active.items.map((it) => (
            <View key={it.id} style={styles.itemRow}>
              <Text style={{ fontSize: 13.5, color: done.has(it.id) ? p.mint : p.sub }}>
                {done.has(it.id) ? '✓' : '·'}
              </Text>
              <Text style={{ flex: 1, fontSize: 13.5, color: done.has(it.id) ? p.ink : p.sub }}>
                {it.label}
              </Text>
              <Text style={{ fontSize: 9.5, fontWeight: '700', color: p.sub, letterSpacing: 0.5 }}>
                {categoryName(it.categoryId).toUpperCase()}
              </Text>
            </View>
          ))}
        </View>

        {(log.satisfaction || log.mood || log.notes) && (
          <View style={[card, styles.section]}>
            <Text style={[t.cardTitle, { color: p.ink, marginBottom: 8 }]}>Day log</Text>
            {log.satisfaction && (
              <Text style={{ fontSize: 13, color: p.sub, marginBottom: 4 }}>
                Satisfaction: <Text style={{ color: p.ink, fontWeight: '700' }}>{log.satisfaction}/5</Text>
              </Text>
            )}
            {log.mood && (
              <Text style={{ fontSize: 13, color: p.sub, marginBottom: 4 }}>
                Mood: <Text style={{ color: p.ink, fontWeight: '700' }}>{log.mood}/5</Text>
              </Text>
            )}
            {log.notes && <Text style={{ fontSize: 13, color: p.ink, marginTop: 4 }}>{log.notes}</Text>}
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  summary: { padding: 16, marginBottom: 14 },
  section: { padding: 16, marginBottom: 14 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
});
