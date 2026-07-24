import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
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
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { TimeOfDay, atRiskItems, evaluateAttempt, requiredItems, scoreDay } from '@engine';
import { EIGHTY_PRESET, HARD_75_PRESET } from '@/data/presets';
import { todayLabel } from '@/data/startFlow';
import { useActiveChallenge } from '@/data/useActiveChallenge';
import { usePalette, radius, type as t } from '@/theme/tokens';
import { ProgressRing } from '@/ui/ProgressRing';
import { CheckRow } from '@/ui/CheckRow';
import { RatingScale } from '@/ui/RatingScale';

type IconName = keyof typeof Ionicons.glyphMap;

const HOW_IT_WORKS = [
  ['Daily threshold', 'Hit a set % of your checklist each day (80% for 80/80/80, 100% for 75 Hard).'],
  ['Challenge threshold', 'Succeed on enough days across the whole challenge, not every single one.'],
  ['Bonus items', 'Extra credit — they help your percentage and never hurt it.'],
  ['No-repeat-miss', "Miss the same item two days running and that second day fails, even if you hit the daily %."],
  ['Strictness', 'Flexible keeps going after a bad day; strict/hardcore restart the attempt on certain misses.'],
] as const;

const SECTIONS: { key: TimeOfDay; title: string; icon: IconName; hint?: string }[] = [
  { key: 'morning', title: 'Morning', icon: 'sunny-outline', hint: 'within an hour of waking' },
  { key: 'day', title: 'During the day', icon: 'partly-sunny-outline' },
  { key: 'evening', title: 'Evening', icon: 'cloudy-night-outline', hint: 'before winding down' },
  { key: 'bed', title: 'Bed', icon: 'bed-outline', hint: 'logged tonight or tomorrow morning' },
];

function startPreset(preset: typeof EIGHTY_PRESET) {
  router.push({ pathname: '/preview', params: { presetJson: JSON.stringify(preset) } });
}

export default function TodayScreen() {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const { repo, active, logs, refresh } = useActiveChallenge();
  const [showInfo, setShowInfo] = useState(false);
  // Memoized so the full-attempt walk doesn't re-run when only local UI state
  // (the info modal, ring animation) changes.
  const state = useMemo(
    () => (active ? evaluateAttempt(active.config, logs) : null),
    [active, logs],
  );

  if (!active || !state) {
    return (
      <View style={[styles.startWrap, { backgroundColor: p.bg }]}>
        <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 1, color: p.mint }}>
          EIGHTY
        </Text>
        <Text style={[t.h1, { color: p.ink, marginTop: 6, textAlign: 'center' }]}>
          Pick your challenge
        </Text>
        <Text style={{ fontSize: 14, color: p.sub, textAlign: 'center', marginTop: 10, lineHeight: 21 }}>
          Check off your checklist daily and hit a threshold to succeed — miss days, not habits.
        </Text>
        <Pressable onPress={() => setShowInfo(true)} style={styles.infoLink}>
          <Ionicons name="information-circle-outline" size={15} color={p.mint} />
          <Text style={{ fontSize: 12.5, color: p.mint, fontWeight: '700' }}>How scoring works</Text>
        </Pressable>

        <Pressable
          onPress={() => startPreset(EIGHTY_PRESET)}
          style={({ pressed }) => [
            styles.startBtn,
            { backgroundColor: p.mint, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={{ color: p.onAccent, fontWeight: '800', fontSize: 16 }}>Start 80/80/80</Text>
        </Pressable>
        <Pressable
          onPress={() => startPreset(HARD_75_PRESET)}
          style={({ pressed }) => [
            styles.secondaryBtn,
            { borderColor: p.line, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={{ color: p.ink, fontWeight: '700', fontSize: 15 }}>Start 75 Hard</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/builder')} style={styles.buildLink}>
          <Text style={{ fontSize: 13, color: p.sub, fontWeight: '600' }}>
            Build your own, or import one someone shared
          </Text>
          <Ionicons name="arrow-forward" size={13} color={p.sub} />
        </Pressable>

        <Modal visible={showInfo} animationType="slide" transparent onRequestClose={() => setShowInfo(false)}>
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCard, { backgroundColor: p.card }]}>
              <Text style={[t.h1, { color: p.ink, fontSize: 20, marginBottom: 12 }]}>How scoring works</Text>
              {HOW_IT_WORKS.map(([label, body]) => (
                <View key={label} style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: p.mint }}>{label}</Text>
                  <Text style={{ fontSize: 13, color: p.sub, marginTop: 2, lineHeight: 18 }}>{body}</Text>
                </View>
              ))}
              <Pressable
                onPress={() => setShowInfo(false)}
                style={[styles.startBtn, { backgroundColor: p.mint, marginTop: 4 }]}
              >
                <Text style={{ color: p.onAccent, fontWeight: '800', fontSize: 15 }}>Got it</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
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
  const dayNum = openDay.dayIndex + 1;
  const nextDayNum = dayNum + 1;
  const isLastDay = dayNum >= config.durationDays;
  const yesterday = logs.find((l) => l.dayIndex === openDay.dayIndex - 1);
  const atRisk = new Set(atRiskItems(config, yesterday, openDay.isTravel));
  const score = scoreDay(config, openDay, yesterday);
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
        {/* Header — lead with the day number */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 1, color: p.mint }}>
              EIGHTY
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 2 }}>
              <Text style={[t.h1, { color: p.ink }]}>Day {dayNum}</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: p.sub, marginLeft: 6 }}>
                of {config.durationDays}
              </Text>
            </View>
            <Text style={{ fontSize: 13, color: p.sub, marginTop: 2 }}>
              {active.name} · {openDay.localDate}
            </Text>
          </View>
        </View>

        {/* Forward CTA — you stay on this day until you choose to move on */}
        {needsCloseout && (
          <View style={[styles.forward, { backgroundColor: p.mintSoft }]}>
            <View style={styles.forwardHead}>
              <Ionicons name="checkmark-done-circle" size={20} color={p.mint} />
              <Text style={{ flex: 1, fontSize: 13.5, lineHeight: 18, color: p.ink }}>
                <Text style={{ fontWeight: '800', color: p.mint }}>You finished Day {dayNum}.</Text>{' '}
                {isLastDay
                  ? 'Log any last sleep & bedtime items first.'
                  : "Still logging last night's sleep? Do that first — you're not on the next day until you tap below."}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                repo.closeDay(active.attemptId, openDay.dayIndex, today);
                refresh();
              }}
              style={({ pressed }) => [
                styles.forwardBtn,
                { backgroundColor: p.mint, opacity: pressed ? 0.85 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={isLastDay ? `Finish Day ${dayNum}` : `Move on to Day ${nextDayNum}`}
            >
              <Text style={{ color: p.onAccent, fontWeight: '800', fontSize: 14.5 }}>
                {isLastDay ? `Finish Day ${dayNum}` : `Move on to Day ${nextDayNum}`}
              </Text>
              <Ionicons name="arrow-forward" size={16} color={p.onAccent} />
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
                    Today is a success — keep stacking
                  </Text>
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Checklist by time of day */}
        {SECTIONS.map(({ key, title, icon, hint }) => {
          const items = active.items.filter((it) => !it.isBonus && it.timeOfDay === key);
          if (items.length === 0) return null;
          const doneCount = items.filter((it) => done.has(it.id)).length;
          return (
            <View key={key} style={[card, styles.cat]}>
              <View style={styles.catHead}>
                <View style={styles.catHeadLeft}>
                  <Ionicons name={icon} size={15} color={p.sub} />
                  <Text style={[t.cardTitle, { color: p.ink }]}>
                    {title}
                    {hint ? <Text style={{ fontSize: 11, fontWeight: '500', color: p.sub }}>  {hint}</Text> : null}
                  </Text>
                </View>
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
            <View style={styles.catHeadLeft}>
              <Ionicons name="sparkles-outline" size={15} color={p.sienna} />
              <Text style={[t.cardTitle, { color: p.sienna }]}>Bonus · Extra credit</Text>
            </View>
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
              accessibilityLabel="Travel day"
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
  infoLink: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  buildLink: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 18 },
  startBtn: { marginTop: 28, borderRadius: radius.pill, paddingHorizontal: 26, paddingVertical: 14 },
  secondaryBtn: {
    marginTop: 12,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingHorizontal: 26,
    paddingVertical: 13,
  },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalCard: { borderTopLeftRadius: radius.card, borderTopRightRadius: radius.card, padding: 22, paddingBottom: 36 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 6,
    paddingBottom: 16,
    paddingTop: 10,
  },
  forward: {
    borderRadius: radius.banner,
    padding: 14,
    marginBottom: 14,
  },
  forwardHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 11 },
  forwardBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    borderRadius: radius.pill,
    paddingVertical: 11,
  },
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
  catHeadLeft: { flexDirection: 'row', alignItems: 'center', gap: 7 },
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
