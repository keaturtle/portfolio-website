import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { evaluateAttempt, itemStats } from '@engine';
import { useActiveChallenge } from '@/data/useActiveChallenge';
import { usePalette, radius, type as t } from '@/theme/tokens';
import { ProgressRing } from '@/ui/ProgressRing';
import { HeatGrid } from '@/ui/HeatGrid';
import { ItemStatRow } from '@/ui/ItemStatRow';

const STATUS_LABEL: Record<string, string> = {
  active: 'In progress',
  succeeded: 'Succeeded 🎉',
  failed: 'Failed',
  'restart-required': 'Restart required',
};

export default function DashboardScreen() {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const { active, logs } = useActiveChallenge();
  const card = { backgroundColor: p.card, borderRadius: radius.card };

  if (!active) {
    return (
      <View style={[styles.empty, { backgroundColor: p.bg }]}>
        <Text style={[t.h1, { color: p.ink, textAlign: 'center' }]}>No active challenge</Text>
        <Text style={{ color: p.sub, marginTop: 8, textAlign: 'center' }}>
          Start one from the Today tab to see your dashboard here.
        </Text>
      </View>
    );
  }

  const { config } = active;
  const state = evaluateAttempt(config, logs);
  const stats = itemStats(config, logs).sort((a, b) => b.pct - a.pct);
  const travelByDayIndex = new Set(logs.filter((l) => l.isTravel).map((l) => l.dayIndex));
  const closedDays = logs.filter((l) => l.closed).length;
  const itemLabel = (id: string) => active.items.find((it) => it.id === id);
  const categoryName = (id: string) => active.categories.find((c) => c.id === id)?.name ?? '';

  return (
    <ScrollView
      style={{ backgroundColor: p.bg }}
      contentContainerStyle={{
        paddingTop: insets.top + 10,
        paddingBottom: insets.bottom + 40,
        paddingHorizontal: 16,
      }}
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 6, paddingBottom: 16, paddingTop: 10 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 1, color: p.mint }}>
          EIGHTY
        </Text>
        <Text style={[t.h1, { color: p.ink, marginTop: 2 }]}>Dashboard</Text>
        <Text style={{ fontSize: 13, color: p.sub, marginTop: 2 }}>
          {active.name} · {STATUS_LABEL[state.status]}
          {state.restartReason ? ` (${state.restartReason})` : ''}
        </Text>
      </View>

      {state.mathematicallyImpossible && state.status !== 'succeeded' && (
        <View style={[styles.banner, { backgroundColor: p.siennaSoft }]}>
          <Text style={{ fontSize: 18 }}>⚠️</Text>
          <Text style={{ flex: 1, fontSize: 13.5, lineHeight: 18, color: p.ink }}>
            <Text style={{ fontWeight: '700', color: p.sienna }}>Success is out of reach</Text> at
            the current pace. You can restart or keep logging — stats keep computing either way.
          </Text>
        </View>
      )}

      {/* Ring + headline stats */}
      <View style={[card, styles.hero]}>
        <ProgressRing pct={state.rollingPct} goalPct={config.challengeThresholdPct} palette={p} />
        <View style={{ flex: 1, gap: 9 }}>
          <Stat label="Success days" value={`${state.successDays} of ${closedDays}`} p={p} />
          <Stat label="Days elapsed" value={`${state.daysElapsed} of ${config.durationDays}`} p={p} />
          <Stat label="Still needed" value={`${state.successDaysNeeded} days`} p={p} />
          <Stat label="Margin left" value={`${state.marginForError} days`} p={p} />
        </View>
      </View>

      {/* Secondary stats */}
      <View style={[card, styles.statsGrid]}>
        <StatBlock label="Projected finish" value={state.projectedEndLocalDate ?? '—'} p={p} />
        <StatBlock
          label="Avg satisfaction"
          value={state.avgSatisfaction ? state.avgSatisfaction.toFixed(1) : '—'}
          p={p}
        />
        <StatBlock label="Avg mood" value={state.avgMood ? state.avgMood.toFixed(1) : '—'} p={p} />
        <StatBlock label="Days remaining" value={`${state.daysRemaining}`} p={p} />
      </View>

      {/* 80-day heat grid */}
      <View style={[card, styles.section]}>
        <Text style={[t.cardTitle, { color: p.ink, marginBottom: 10 }]}>Challenge calendar</Text>
        <HeatGrid
          durationDays={config.durationDays}
          dayScores={state.dayScores}
          travelByDayIndex={travelByDayIndex}
          palette={p}
          onDayPress={(dayIndex) =>
            router.push({ pathname: '/day/[dayIndex]', params: { dayIndex: String(dayIndex) } })
          }
        />
        <View style={styles.legend}>
          <LegendDot color={p.mint} label="Success" p={p} />
          <LegendDot color={p.sienna} label="Fail" p={p} />
          <LegendDot color={p.card2} border={p.mint} label="Open" p={p} />
          <LegendDot color={p.card2} border={p.line} label="Upcoming" p={p} />
        </View>
      </View>

      {/* Habit leaderboard */}
      <View style={[card, styles.section]}>
        <Text style={[t.cardTitle, { color: p.ink, marginBottom: 4 }]}>Habit leaderboard</Text>
        <Text style={{ fontSize: 11.5, color: p.sub, marginBottom: 4 }}>
          Completion rate over {closedDays} closed day{closedDays === 1 ? '' : 's'}.
        </Text>
        {stats.map((s) => {
          const item = itemLabel(s.itemId);
          if (!item) return null;
          return (
            <ItemStatRow
              key={s.itemId}
              label={item.label}
              categoryName={categoryName(item.categoryId)}
              pct={s.pct}
              isBonus={item.isBonus}
              palette={p}
            />
          );
        })}
      </View>
    </ScrollView>
  );
}

function Stat({ label, value, p }: { label: string; value: string; p: ReturnType<typeof usePalette> }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <Text style={{ fontSize: 12.5, color: p.sub }}>{label}</Text>
      <Text style={[t.stat, { color: p.ink }]}>{value}</Text>
    </View>
  );
}

function StatBlock({ label, value, p }: { label: string; value: string; p: ReturnType<typeof usePalette> }) {
  return (
    <View style={styles.statBlock}>
      <Text style={{ fontSize: 17, fontWeight: '800', color: p.ink }}>{value}</Text>
      <Text style={{ fontSize: 11, color: p.sub, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function LegendDot({
  color,
  border,
  label,
  p,
}: {
  color: string;
  border?: string;
  label: string;
  p: ReturnType<typeof usePalette>;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 3,
          backgroundColor: color,
          borderWidth: border ? 1.5 : 0,
          borderColor: border,
        }}
      />
      <Text style={{ fontSize: 11, color: p.sub }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  banner: {
    borderRadius: radius.banner,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  hero: { padding: 20, flexDirection: 'row', gap: 18, alignItems: 'center', marginBottom: 14 },
  statsGrid: {
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  statBlock: { width: '45%' },
  section: { padding: 16, marginBottom: 14 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 14 },
});
