import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  TimeOfDay,
  atRiskItems,
  evaluateAttempt,
  localDateLabel,
  requiredItems,
  scoreDay,
} from '@engine';
import { EIGHTY_PRESET } from '@/data/presets';
import { useActiveChallenge } from '@/data/useActiveChallenge';
import { usePalette, radius, type as t } from '@/theme/tokens';
import { ProgressRing } from '@/ui/ProgressRing';
import { CheckRow } from '@/ui/CheckRow';
import { RatingScale } from '@/ui/RatingScale';

const SECTIONS: { key: TimeOfDay; title: string; hint?: string }[] = [
  { key: 'morning', title: '🌅 Morning', hint: 'within an hour of waking' },
  { key: 'day', title: '☀️ During the day' },
  { key: 'evening', title: '🌆 Evening', hint: 'before winding down' },
  { key: 'bed', title: '🛏 Bed', hint: 'logged tonight or tomorrow morning' },
];

function todayLabel(): string {
  return localDateLabel(Date.now(), Intl.DateTimeFormat().resolvedOptions().timeZone);
}

export default function TodayScreen() {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const { repo, active, logs, refresh } = useActiveChallenge();

  if (!active) {
    return (
      <View style={[styles.startWrap, { backgroundColor: p.bg }]}>
        <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 1, color: p.mint }}>
          EIGHTY
        </Text>
        <Text style={[t.h1, { color: p.ink, marginTop: 6, textAlign: 'center' }]}>
          The 80/80/80 Challenge
        </Text>
        <Text style={{ fontSize: 14, color: p.sub, textAlign: 'center', marginTop: 10, lineHeight: 21 }}>
          Hit 80% of your checklist on 80% of days over 80 days.{'\n'}Miss days, not habits — never
          the same item twice in a row.
        </Text>
        <Pressable
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            repo.startChallenge(EIGHTY_PRESET, todayLabel());
            refresh();
          }}
          style={({ pressed }) => [
            styles.startBtn,
            { backgroundColor: p.mint, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={{ color: p.onAccent, fontWeight: '800', fontSize: 16 }}>
            Start day 1 today
          </Text>
        </Pressable>
      </View>
    );
  }

  const openDay = logs.find((l) => !l.closed);
  const { config } = active;

  if (!openDay) {
    return (
      <View style={[styles.startWrap, { backgroundColor: p.bg }]}>
        <Text style={[t.h1, { color: p.ink }]}>Challenge complete</Text>
        <Text style={{ color: p.sub, marginTop: 8 }}>Check the Dashboard tab for the full picture.</Text>
      </View>
    );
  }

  const today = todayLabel();
  const needsCloseout = openDay.localDate < today;
  const yesterday = logs.find((l) => l.dayIndex === openDay.dayIndex - 1);
  const atRisk = new Set(atRiskItems(config, yesterday, openDay.isTravel));
  const score = scoreDay(config, openDay, yesterday);
  const state = evaluateAttempt(config, logs);
  const done = new Set(openDay.completedItemIds);
  const required = requiredItems(config);
  const credit = score.completedRegular + score.completedBonus;
  const itemsToGo = Math.max(0, required - credit);
  const closedDays = logs.filter((l) => l.closed).length;
  const categoryName = (id: string) =>
    active.categories.find((c) => c.id === id)?.name ?? '';

  const card = { backgroundColor: p.card, borderRadius: radius.card };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: p.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 10,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 16,
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 1, color: p.mint }}>
              EIGHTY
            </Text>
            <Text style={[t.h1, { color: p.ink, marginTop: 2 }]}>Today</Text>
            <Text style={{ fontSize: 13, color: p.sub, marginTop: 2 }}>
              {openDay.localDate} · {active.name}
            </Text>
          </View>
          <View style={[styles.dayChip, { backgroundColor: p.mint }]}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: p.onAccent }}>
              {openDay.dayIndex + 1}
            </Text>
            <Text style={{ fontSize: 10, fontWeight: '600', color: p.onAccent, opacity: 0.75 }}>
              of {config.durationDays}
            </Text>
          </View>
        </View>

        {/* Close-out banner */}
        {needsCloseout && (
          <View style={[styles.closeout, { backgroundColor: p.siennaSoft }]}>
            <Text style={{ fontSize: 18 }}>🌙</Text>
            <Text style={{ flex: 1, fontSize: 13.5, lineHeight: 18, color: p.ink }}>
              <Text style={{ fontWeight: '700', color: p.sienna }}>
                {openDay.localDate} is still open.
              </Text>{' '}
              Log sleep &amp; bedtime items, then close it out.
            </Text>
            <Pressable
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                repo.closeDay(active.attemptId, openDay.dayIndex, today);
                refresh();
              }}
              style={({ pressed }) => [
                styles.closeBtn,
                { backgroundColor: p.sienna, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={{ color: p.onAccent, fontSize: 12.5, fontWeight: '700' }}>
                Close out
              </Text>
            </Pressable>
          </View>
        )}

        {/* Hero: ring + stats */}
        <View style={[card, styles.hero]}>
          <ProgressRing pct={score.pct} goalPct={config.dailyThresholdPct} palette={p} />
          <View style={{ flex: 1, gap: 9 }}>
            <Stat label="Items done" value={`${score.completedRegular} / ${score.totalRegular}`} p={p} />
            <Stat label="Bonus earned" value={`+${score.completedBonus}`} good p={p} />
            <Stat label="Success days" value={`${state.successDays} of ${closedDays}`} p={p} />
            <Stat label="Margin left" value={`${state.marginForError} days`} p={p} />
            <View style={{ borderTopWidth: 1, borderTopColor: p.line, paddingTop: 8 }}>
              <Text style={{ fontSize: 12.5, color: p.sub }}>
                {itemsToGo > 0 ? (
                  <>
                    <Text style={{ color: p.sienna, fontWeight: '700' }}>
                      {itemsToGo} more item{itemsToGo === 1 ? '' : 's'}
                    </Text>{' '}
                    makes today a success
                  </>
                ) : (
                  <Text style={{ color: p.mint, fontWeight: '700' }}>
                    Today is a success — keep stacking ✓
                  </Text>
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Checklist by time of day */}
        {SECTIONS.map(({ key, title, hint }) => {
          const items = active.items.filter((it) => !it.isBonus && it.timeOfDay === key);
          if (items.length === 0) return null;
          const doneCount = items.filter((it) => done.has(it.id)).length;
          return (
            <View key={key} style={[card, styles.cat]}>
              <View style={styles.catHead}>
                <Text style={[t.cardTitle, { color: p.ink }]}>
                  {title}
                  {hint ? <Text style={{ fontSize: 11, fontWeight: '500', color: p.sub }}>  {hint}</Text> : null}
                </Text>
                <View style={[styles.pill, { backgroundColor: p.mintSoft }]}>
                  <Text style={{ fontSize: 11.5, fontWeight: '700', color: p.mint }}>
                    {doneCount}/{items.length}
                  </Text>
                </View>
              </View>
              {items.map((it) => (
                <CheckRow
                  key={it.id}
                  label={it.label}
                  categoryName={categoryName(it.categoryId)}
                  done={done.has(it.id)}
                  isBonus={false}
                  missedYesterday={atRisk.has(it.id)}
                  palette={p}
                  onToggle={() => {
                    repo.setItemDone(active.attemptId, openDay.dayIndex, it.id, !done.has(it.id));
                    refresh();
                  }}
                />
              ))}
            </View>
          );
        })}

        {/* Bonus */}
        <View style={[styles.cat, styles.bonus, { borderColor: p.sienna }]}>
          <View style={styles.catHead}>
            <Text style={[t.cardTitle, { color: p.sienna }]}>✨ Bonus · Extra credit</Text>
            <View style={[styles.pill, { backgroundColor: p.siennaSoft }]}>
              <Text style={{ fontSize: 11.5, fontWeight: '700', color: p.sienna }}>
                +{score.completedBonus}
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 11.5, color: p.sub, paddingBottom: 10 }}>
            Counts toward your %, never against it.
          </Text>
          {active.items
            .filter((it) => it.isBonus)
            .map((it) => (
              <CheckRow
                key={it.id}
                label={it.label}
                categoryName=""
                done={done.has(it.id)}
                isBonus
                missedYesterday={false}
                palette={p}
                onToggle={() => {
                  repo.setItemDone(active.attemptId, openDay.dayIndex, it.id, !done.has(it.id));
                  refresh();
                }}
              />
            ))}
        </View>

        {/* Day log */}
        <View style={[card, styles.daylog]}>
          <Text style={[t.cardTitle, { color: p.ink, marginBottom: 6 }]}>Day log</Text>
          <RatingScale
            label="Satisfaction"
            value={openDay.satisfaction}
            palette={p}
            onChange={(v) => {
              repo.setDayMeta(active.attemptId, openDay.dayIndex, { satisfaction: v });
              refresh();
            }}
          />
          <RatingScale
            label="Mood"
            value={openDay.mood}
            palette={p}
            onChange={(v) => {
              repo.setDayMeta(active.attemptId, openDay.dayIndex, { mood: v });
              refresh();
            }}
          />
          <View style={[styles.travel, { borderTopColor: p.line }]}>
            <Text style={{ fontSize: 13.5, color: p.sub }}>Travel day</Text>
            <Switch
              value={openDay.isTravel}
              onValueChange={(v) => {
                Haptics.selectionAsync();
                repo.setDayMeta(active.attemptId, openDay.dayIndex, { isTravel: v });
                refresh();
              }}
              trackColor={{ true: p.mint, false: p.card2 }}
              thumbColor={p.card}
            />
          </View>
          <TextInput
            style={[styles.notes, { backgroundColor: p.card2, color: p.ink }]}
            placeholder="Notes…"
            placeholderTextColor={p.sub}
            multiline
            defaultValue={openDay.notes ?? ''}
            onEndEditing={(e) => {
              repo.setDayMeta(active.attemptId, openDay.dayIndex, {
                notes: e.nativeEvent.text,
              });
              refresh();
            }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Stat({
  label,
  value,
  good,
  p,
}: {
  label: string;
  value: string;
  good?: boolean;
  p: ReturnType<typeof usePalette>;
}) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <Text style={{ fontSize: 12.5, color: p.sub }}>{label}</Text>
      <Text style={[t.stat, { color: good ? p.mint : p.ink }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  startWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  startBtn: { marginTop: 28, borderRadius: radius.pill, paddingHorizontal: 26, paddingVertical: 14 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 6,
    paddingBottom: 16,
    paddingTop: 10,
  },
  dayChip: { borderRadius: 14, paddingHorizontal: 13, paddingVertical: 8, alignItems: 'center' },
  closeout: {
    borderRadius: radius.banner,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  closeBtn: { borderRadius: radius.pill, paddingHorizontal: 13, paddingVertical: 7 },
  hero: { padding: 20, flexDirection: 'row', gap: 18, alignItems: 'center', marginBottom: 14 },
  cat: { paddingVertical: 6, paddingHorizontal: 16, marginBottom: 12 },
  catHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 13,
    paddingBottom: 7,
    paddingHorizontal: 2,
  },
  pill: { borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 3 },
  bonus: { borderWidth: 1.5, borderStyle: 'dashed', borderRadius: radius.card },
  daylog: { padding: 16, marginBottom: 12 },
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
