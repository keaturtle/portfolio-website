import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Strictness, validateConfig } from '@engine';
import { useActiveChallenge } from '@/data/useActiveChallenge';
import { usePalette, radius, type as t } from '@/theme/tokens';

const STRICTNESS_OPTIONS: { key: Strictness; label: string }[] = [
  { key: 'flexible', label: 'Flexible' },
  { key: 'strict', label: 'Strict' },
  { key: 'hardcore', label: 'Hardcore' },
];

/**
 * Edits an active challenge's config in place. Because every stat recomputes from
 * raw logs, changes re-score all past days: the immediate toggles (no-repeat-miss,
 * travel) apply on tap; the riskier fields (duration, thresholds, strictness) are
 * held in a draft and saved behind a "this recalculates your past days" confirm.
 */
export default function EditChallengeScreen() {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const { repo, active, refresh } = useActiveChallenge();
  const card = { backgroundColor: p.card, borderRadius: radius.card };

  const cfg = active?.config;
  const [name, setName] = useState(active?.name ?? '');
  const [durationDays, setDurationDays] = useState(String(cfg?.durationDays ?? ''));
  const [dailyPct, setDailyPct] = useState(String(cfg?.dailyThresholdPct ?? ''));
  const [challengePct, setChallengePct] = useState(String(cfg?.challengeThresholdPct ?? ''));
  const [strictness, setStrictness] = useState<Strictness>(cfg?.strictness ?? 'flexible');

  const header = (
    <Stack.Screen
      options={{
        headerShown: true,
        title: 'Edit challenge',
        headerStyle: { backgroundColor: p.bg },
        headerTintColor: p.ink,
        headerShadowVisible: false,
      }}
    />
  );

  if (!active || !cfg) {
    return (
      <>
        {header}
        <View style={[styles.empty, { backgroundColor: p.bg }]}>
          <Text style={{ color: p.sub }}>No active challenge to edit.</Text>
        </View>
      </>
    );
  }

  const setToggle = (field: 'noRepeatMiss' | 'travelExemption', value: boolean) => {
    Haptics.selectionAsync();
    repo.updateChallengeConfig(active.challengeId, { [field]: value });
    refresh();
  };

  const save = () => {
    const nextDuration = Number(durationDays) || 0;
    const nextDaily = Number(dailyPct) || 0;
    const nextChallenge = Number(challengePct) || 0;
    const nextConfig = {
      ...cfg,
      durationDays: nextDuration,
      dailyThresholdPct: nextDaily,
      challengeThresholdPct: nextChallenge,
      strictness,
    };
    const errors = validateConfig(nextConfig);
    if (errors.length > 0) {
      Alert.alert('Fix these first', errors.map((e) => `• ${e.message}`).join('\n'));
      return;
    }
    const riskyChanged =
      nextDuration !== cfg.durationDays ||
      nextDaily !== cfg.dailyThresholdPct ||
      nextChallenge !== cfg.challengeThresholdPct ||
      strictness !== cfg.strictness;

    const commit = () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      repo.updateChallengeConfig(active.challengeId, {
        name: name.trim() || active.name,
        durationDays: nextDuration,
        dailyThresholdPct: nextDaily,
        challengeThresholdPct: nextChallenge,
        strictness,
      });
      refresh();
      router.back();
    };

    if (riskyChanged) {
      Alert.alert(
        'Recalculate past days?',
        'This recalculates all your past days with the new settings. A stricter setting can retroactively fail days or trigger a restart.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save & recalculate', style: 'destructive', onPress: commit },
        ],
      );
    } else {
      commit();
    }
  };

  return (
    <>
      {header}
      <ScrollView
        style={{ backgroundColor: p.bg }}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 60 }}
      >
        <View style={[card, styles.section]}>
          <Text style={[t.cardTitle, { color: p.ink, marginBottom: 10 }]}>Basics</Text>
          <FieldLabel p={p}>Name</FieldLabel>
          <TextInput
            style={[styles.input, { backgroundColor: p.card2, color: p.ink }]}
            value={name}
            onChangeText={setName}
            placeholder={active.name}
            placeholderTextColor={p.sub}
          />
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <NumberField label="Duration (days)" value={durationDays} onChange={setDurationDays} p={p} />
            <NumberField label="Daily threshold %" value={dailyPct} onChange={setDailyPct} p={p} />
            <NumberField label="Challenge threshold %" value={challengePct} onChange={setChallengePct} p={p} />
          </View>

          <FieldLabel p={p} style={{ marginTop: 12 }}>
            Strictness
          </FieldLabel>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {STRICTNESS_OPTIONS.map((opt) => {
              const sel = strictness === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setStrictness(opt.key);
                  }}
                  style={[styles.pill, { backgroundColor: sel ? p.mint : p.card2 }]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: sel }}
                  accessibilityLabel={`${opt.label} strictness`}
                >
                  <Text style={{ fontSize: 12.5, fontWeight: '700', color: sel ? p.onAccent : p.sub }}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={[card, styles.section]}>
          <Text style={[t.cardTitle, { color: p.ink, marginBottom: 4 }]}>Rules</Text>
          <Text style={{ fontSize: 11.5, color: p.sub, marginBottom: 4 }}>
            These apply right away and re-score your past days.
          </Text>
          <ToggleRow
            label="No-repeat-miss"
            hint="Never fail the same item two days in a row"
            value={cfg.noRepeatMiss}
            onChange={(v) => setToggle('noRepeatMiss', v)}
            p={p}
          />
          <ToggleRow
            label="Travel exemption"
            hint="Travel days relax the no-repeat rule"
            value={cfg.travelExemption}
            onChange={(v) => setToggle('travelExemption', v)}
            p={p}
          />
        </View>

        <Pressable
          onPress={save}
          style={({ pressed }) => [styles.saveBtn, { backgroundColor: p.mint, opacity: pressed ? 0.8 : 1 }]}
        >
          <Text style={{ color: p.onAccent, fontWeight: '800', fontSize: 15 }}>Save changes</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

function NumberField({
  label,
  value,
  onChange,
  p,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  p: ReturnType<typeof usePalette>;
}) {
  return (
    <View style={{ flex: 1 }}>
      <FieldLabel p={p}>{label}</FieldLabel>
      <TextInput
        style={[styles.input, { backgroundColor: p.card2, color: p.ink }]}
        value={value}
        onChangeText={onChange}
        keyboardType="number-pad"
      />
    </View>
  );
}

function FieldLabel({ children, p, style }: { children: string; p: ReturnType<typeof usePalette>; style?: object }) {
  return (
    <Text style={[{ fontSize: 11.5, fontWeight: '700', color: p.sub, marginBottom: 5 }, style]}>{children}</Text>
  );
}

function ToggleRow({
  label,
  hint,
  value,
  onChange,
  p,
}: {
  label: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
  p: ReturnType<typeof usePalette>;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13.5, color: p.ink }}>{label}</Text>
        <Text style={{ fontSize: 11, color: p.sub, marginTop: 1 }}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: p.mint, false: p.card2 }}
        thumbColor={p.card}
        accessibilityLabel={`${label}. ${hint}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  section: { padding: 16, marginBottom: 14 },
  input: { borderRadius: radius.notes, padding: 10, fontSize: 13.5 },
  pill: { borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 7 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, marginTop: 4 },
  saveBtn: { borderRadius: radius.pill, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
});
