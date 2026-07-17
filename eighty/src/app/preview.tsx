import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useActiveChallenge } from '@/data/useActiveChallenge';
import { ChallengePreset } from '@/data/repository';
import { confirmAndStart } from '@/data/startFlow';
import { usePalette, radius, type as t } from '@/theme/tokens';

function parsePreset(json: string | undefined): ChallengePreset | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json);
    if (typeof parsed?.name !== 'string' || !Array.isArray(parsed?.items)) return null;
    return parsed as ChallengePreset;
  } catch {
    return null;
  }
}

export default function PreviewScreen() {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const { presetJson } = useLocalSearchParams<{ presetJson: string }>();
  const { repo, active, refresh } = useActiveChallenge();
  const preset = parsePreset(presetJson);
  const card = { backgroundColor: p.card, borderRadius: radius.card };

  const headerOptions = {
    headerShown: true,
    headerStyle: { backgroundColor: p.bg },
    headerTintColor: p.ink,
    headerShadowVisible: false,
  } as const;

  if (!preset) {
    return (
      <>
        <Stack.Screen options={{ ...headerOptions, title: 'Preview' }} />
        <View style={[styles.empty, { backgroundColor: p.bg }]}>
          <Text style={{ color: p.sub }}>Couldn’t load that challenge.</Text>
        </View>
      </>
    );
  }

  const regularCount = preset.items.filter((i) => !i.isBonus).length;
  const bonusCount = preset.items.length - regularCount;
  const isFlagship = preset.name === '80/80/80';

  const customize = () =>
    router.push({ pathname: '/builder', params: { presetJson: JSON.stringify(preset) } });

  const startAsIs = () => confirmAndStart(repo, active, preset, refresh);

  return (
    <>
      <Stack.Screen options={{ ...headerOptions, title: preset.name }} />
      <ScrollView
        style={{ backgroundColor: p.bg }}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
      >
        <View style={[card, styles.section]}>
          <Text style={[t.h1, { color: p.ink, fontSize: 22 }]}>{preset.name}</Text>
          <Text style={{ fontSize: 13, color: p.sub, marginTop: 4 }}>
            {preset.durationDays} days · {preset.dailyThresholdPct}% daily threshold ·{' '}
            {preset.challengeThresholdPct}% to succeed · {preset.strictness}
          </Text>

          {isFlagship && (
            <View style={[styles.callout, { backgroundColor: p.mintSoft }]}>
              <Ionicons name="person-outline" size={14} color={p.mint} />
              <Text style={{ flex: 1, fontSize: 12.5, color: p.ink, lineHeight: 17 }}>
                This is Keaten’s own ruleset — tweak anything that doesn’t fit your life before you
                start.
              </Text>
            </View>
          )}

          <View style={styles.chipRow}>
            {preset.noRepeatMiss && (
              <Chip icon="repeat-outline" label="No repeat misses" p={p} />
            )}
            {preset.travelExemption && <Chip icon="airplane-outline" label="Travel exemption" p={p} />}
            <Chip icon="shield-outline" label={`${preset.strictness} mode`} p={p} />
          </View>
        </View>

        <View style={[card, styles.section]}>
          <View style={styles.checklistHead}>
            <Text style={[t.cardTitle, { color: p.ink }]}>Checklist</Text>
            <Text style={{ fontSize: 11.5, color: p.sub }}>
              {regularCount} required{bonusCount > 0 ? ` · ${bonusCount} bonus` : ''}
            </Text>
          </View>
          {preset.categories.map((cat) => {
            const items = preset.items.filter((i) => i.categoryId === cat.id);
            if (items.length === 0) return null;
            return (
              <View key={cat.id} style={{ marginTop: 10 }}>
                <Text style={{ fontSize: 10.5, fontWeight: '700', color: p.sub, letterSpacing: 0.6 }}>
                  {cat.name.toUpperCase()}
                </Text>
                {items.map((it) => (
                  <View key={it.id} style={styles.itemRow}>
                    <Ionicons
                      name={it.isBonus ? 'sparkles-outline' : 'checkmark-circle-outline'}
                      size={15}
                      color={it.isBonus ? p.sienna : p.sub}
                    />
                    <Text style={{ flex: 1, fontSize: 13.5, color: p.ink }}>{it.label}</Text>
                  </View>
                ))}
              </View>
            );
          })}
        </View>

        <Pressable
          onPress={startAsIs}
          style={({ pressed }) => [styles.startBtn, { backgroundColor: p.mint, opacity: pressed ? 0.8 : 1 }]}
        >
          <Text style={{ color: p.onAccent, fontWeight: '800', fontSize: 15 }}>Start as-is</Text>
        </Pressable>
        <Pressable
          onPress={customize}
          style={({ pressed }) => [styles.customizeBtn, { borderColor: p.line, opacity: pressed ? 0.7 : 1 }]}
        >
          <Ionicons name="create-outline" size={16} color={p.ink} />
          <Text style={{ color: p.ink, fontWeight: '700', fontSize: 14.5 }}>Customize this</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

function Chip({
  icon,
  label,
  p,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  p: ReturnType<typeof usePalette>;
}) {
  return (
    <View style={[styles.chip, { backgroundColor: p.card2 }]}>
      <Ionicons name={icon} size={12} color={p.sub} />
      <Text style={{ fontSize: 11, fontWeight: '600', color: p.sub }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  section: { padding: 16, marginBottom: 14 },
  callout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.banner,
    padding: 10,
    marginTop: 12,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  checklistHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  startBtn: { borderRadius: radius.pill, paddingVertical: 15, alignItems: 'center' },
  customizeBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingVertical: 13,
    marginTop: 10,
  },
});
