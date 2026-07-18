import { useMemo } from 'react';
import { Dimensions, Pressable, ScrollView, Text, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { evaluateAttempt, itemStats } from '@engine';
import { useActiveChallenge } from '@/data/useActiveChallenge';
import { usePalette, radius, type as t } from '@/theme/tokens';
import { Sparkline } from '@/ui/Sparkline';
import { ItemStatRow } from '@/ui/ItemStatRow';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CHART_WIDTH = Dimensions.get('window').width - 64;

function weekdayOf(localDate: string): number {
  return new Date(`${localDate}T00:00:00Z`).getUTCDay();
}

export default function TrendsScreen() {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const { active, logs } = useActiveChallenge();
  const card = { backgroundColor: p.card, borderRadius: radius.card };

  // Memoized so the 80-day walk / per-item stats only recompute when logs change.
  const state = useMemo(
    () => (active ? evaluateAttempt(active.config, logs) : null),
    [active, logs],
  );
  const stats = useMemo(() => (active ? itemStats(active.config, logs) : []), [active, logs]);

  if (!active || !state) {
    return (
      <View style={[styles.empty, { backgroundColor: p.bg }]}>
        <Pressable
          onPress={() => router.push('/settings')}
          style={styles.gearFloating}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <Ionicons name="settings-outline" size={20} color={p.sub} />
        </Pressable>
        <Text style={[t.h1, { color: p.ink, textAlign: 'center' }]}>No active challenge</Text>
        <Text style={{ color: p.sub, marginTop: 8, textAlign: 'center' }}>
          Trends show up once you're logging days.
        </Text>
      </View>
    );
  }

  const closedLogs = logs.filter((l) => l.closed);

  const satisfactionValues = closedLogs.filter((l) => l.satisfaction !== undefined).map((l) => l.satisfaction as number);
  const moodValues = closedLogs.filter((l) => l.mood !== undefined).map((l) => l.mood as number);

  const categoryAgg = new Map<string, { sum: number; count: number }>();
  for (const s of stats) {
    const item = active.items.find((it) => it.id === s.itemId);
    if (!item) continue;
    const agg = categoryAgg.get(item.categoryId) ?? { sum: 0, count: 0 };
    agg.sum += s.pct;
    agg.count += 1;
    categoryAgg.set(item.categoryId, agg);
  }
  const categoryRows = active.categories
    .map((c) => {
      const agg = categoryAgg.get(c.id);
      return { id: c.id, name: c.name, pct: agg ? agg.sum / agg.count : 0 };
    })
    .sort((a, b) => b.pct - a.pct);

  const localDateByIndex = new Map(logs.map((l) => [l.dayIndex, l.localDate]));
  const weekdayBuckets = WEEKDAYS.map(() => ({ success: 0, total: 0 }));
  for (const ds of state.dayScores) {
    if (ds.outcome === 'pending') continue;
    const localDate = localDateByIndex.get(ds.dayIndex);
    if (!localDate) continue;
    const wd = weekdayOf(localDate);
    weekdayBuckets[wd]!.total++;
    if (ds.outcome === 'success') weekdayBuckets[wd]!.success++;
  }

  return (
    <ScrollView
      style={{ backgroundColor: p.bg }}
      contentContainerStyle={{
        paddingTop: insets.top + 10,
        paddingBottom: insets.bottom + 40,
        paddingHorizontal: 16,
      }}
    >
      <View style={styles.header}>
        <View>
          <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 1, color: p.mint }}>EIGHTY</Text>
          <Text style={[t.h1, { color: p.ink, marginTop: 2 }]}>Trends</Text>
          <Text style={{ fontSize: 13, color: p.sub, marginTop: 2 }}>
            Over {closedLogs.length} closed day{closedLogs.length === 1 ? '' : 's'}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/settings')}
          style={styles.gear}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <Ionicons name="settings-outline" size={20} color={p.sub} />
        </Pressable>
      </View>

      <View style={[card, styles.section]}>
        <View style={styles.chartHead}>
          <Text style={[t.cardTitle, { color: p.ink }]}>Satisfaction</Text>
          <Text style={{ fontSize: 13, fontWeight: '800', color: p.mint }}>
            {state.avgSatisfaction ? state.avgSatisfaction.toFixed(1) : '—'}
          </Text>
        </View>
        <Sparkline values={satisfactionValues} min={1} max={5} color={p.mint} width={CHART_WIDTH} label="Satisfaction" />
      </View>

      <View style={[card, styles.section]}>
        <View style={styles.chartHead}>
          <Text style={[t.cardTitle, { color: p.ink }]}>Mood</Text>
          <Text style={{ fontSize: 13, fontWeight: '800', color: p.sienna }}>
            {state.avgMood ? state.avgMood.toFixed(1) : '—'}
          </Text>
        </View>
        <Sparkline values={moodValues} min={1} max={5} color={p.sienna} width={CHART_WIDTH} label="Mood" />
      </View>

      <View style={[card, styles.section]}>
        <Text style={[t.cardTitle, { color: p.ink, marginBottom: 4 }]}>By category</Text>
        <Text style={{ fontSize: 11.5, color: p.sub, marginBottom: 4 }}>Average item completion rate.</Text>
        {categoryRows.map((c) => (
          <ItemStatRow key={c.id} label={c.name} categoryName="" pct={c.pct} isBonus={false} palette={p} />
        ))}
      </View>

      <View style={[card, styles.section]}>
        <Text style={[t.cardTitle, { color: p.ink, marginBottom: 4 }]}>By weekday</Text>
        <Text style={{ fontSize: 11.5, color: p.sub, marginBottom: 4 }}>Success rate on each day of the week.</Text>
        {WEEKDAYS.map((name, i) => {
          const bucket = weekdayBuckets[i]!;
          const pct = bucket.total === 0 ? 0 : (bucket.success / bucket.total) * 100;
          return <ItemStatRow key={name} label={name} categoryName="" pct={pct} isBonus={false} palette={p} />;
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 6,
    paddingBottom: 16,
    paddingTop: 10,
  },
  gear: { padding: 6 },
  gearFloating: { position: 'absolute', top: 16, right: 16, padding: 6 },
  section: { padding: 16, marginBottom: 14 },
  chartHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
});
