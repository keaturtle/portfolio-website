import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Strictness, TimeOfDay, validateConfig } from '@engine';
import { EIGHTY_PRESET, HARD_75_PRESET } from '@/data/presets';
import { ChallengePreset, PresetItem } from '@/data/repository';
import { presetToConfig } from '@/data/templates';
import { usePalette, radius, type as t } from '@/theme/tokens';
import { FieldLabel, NumberField, ToggleRow } from '@/ui/forms';

const STRICTNESS_OPTIONS: { key: Strictness; label: string }[] = [
  { key: 'flexible', label: 'Flexible' },
  { key: 'strict', label: 'Strict' },
  { key: 'hardcore', label: 'Hardcore' },
];
const TIME_OPTIONS: { key: TimeOfDay; label: string }[] = [
  { key: 'morning', label: 'AM' },
  { key: 'day', label: 'Day' },
  { key: 'evening', label: 'PM' },
  { key: 'bed', label: 'Bed' },
];

function slug(label: string): string {
  const base = label.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return `${base || 'item'}-${Date.now().toString(36).slice(-4)}`;
}

const BLANK: ChallengePreset = {
  name: '',
  durationDays: 80,
  dailyThresholdPct: 80,
  challengeThresholdPct: 80,
  strictness: 'flexible',
  noRepeatMiss: true,
  travelExemption: true,
  categories: [{ id: 'general', name: 'General' }],
  items: [],
};

function initialDraft(presetJson: string | undefined): ChallengePreset {
  if (!presetJson) return BLANK;
  try {
    const parsed = JSON.parse(presetJson);
    if (typeof parsed?.name === 'string' && Array.isArray(parsed?.items)) return parsed as ChallengePreset;
  } catch {
    // fall through to BLANK
  }
  return BLANK;
}

interface NewItemDraft {
  label: string;
  isBonus: boolean;
  isAvoidance: boolean;
  timeOfDay: TimeOfDay;
}

const BLANK_ITEM: NewItemDraft = { label: '', isBonus: false, isAvoidance: false, timeOfDay: 'day' };

export default function BuilderScreen() {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const { presetJson } = useLocalSearchParams<{ presetJson?: string }>();
  const [draft, setDraft] = useState<ChallengePreset>(() => initialDraft(presetJson));
  // Numeric fields edit as strings and parse at review time — typing never fights
  // the user (clearing a field doesn't snap to 0).
  const [numbers, setNumbers] = useState(() => ({
    duration: String(draft.durationDays),
    daily: String(draft.dailyThresholdPct),
    challenge: String(draft.challengeThresholdPct),
  }));
  const [newCategory, setNewCategory] = useState('');
  const [newItem, setNewItem] = useState<Record<string, NewItemDraft>>({});
  const card = { backgroundColor: p.card, borderRadius: radius.card };

  const patchNewItem = (categoryId: string, patch: Partial<NewItemDraft>) =>
    setNewItem((n) => ({ ...n, [categoryId]: { ...BLANK_ITEM, ...n[categoryId], ...patch } }));

  const loadPreset = (preset: ChallengePreset) => {
    Haptics.selectionAsync();
    setDraft({ ...preset, categories: [...preset.categories], items: preset.items.map((i) => ({ ...i })) });
    setNumbers({
      duration: String(preset.durationDays),
      daily: String(preset.dailyThresholdPct),
      challenge: String(preset.challengeThresholdPct),
    });
  };

  const addCategory = () => {
    if (newCategory.trim() === '') return;
    setDraft((d) => ({ ...d, categories: [...d.categories, { id: slug(newCategory), name: newCategory.trim() }] }));
    setNewCategory('');
  };

  const removeCategory = (id: string) => {
    setDraft((d) => ({
      ...d,
      categories: d.categories.filter((c) => c.id !== id),
      items: d.items.filter((i) => i.categoryId !== id),
    }));
  };

  const addItem = (categoryId: string) => {
    const draftItem = newItem[categoryId];
    if (!draftItem || draftItem.label.trim() === '') return;
    const item: PresetItem = {
      id: slug(draftItem.label),
      categoryId,
      label: draftItem.label.trim(),
      isBonus: draftItem.isBonus,
      isAvoidance: draftItem.isAvoidance,
      timeOfDay: draftItem.timeOfDay,
    };
    Haptics.selectionAsync();
    setDraft((d) => ({ ...d, items: [...d.items, item] }));
    setNewItem((n) => ({ ...n, [categoryId]: { ...BLANK_ITEM } }));
  };

  const removeItem = (id: string) => setDraft((d) => ({ ...d, items: d.items.filter((i) => i.id !== id) }));

  // Hands off to the preview screen — the one start path for presets, custom
  // builds, and imports alike, so every challenge gets the start-date picker.
  const reviewDraft = () => {
    const finalPreset: ChallengePreset = {
      ...draft,
      name: draft.name.trim() || 'Custom challenge',
      durationDays: Number(numbers.duration) || 0,
      dailyThresholdPct: Number(numbers.daily) || 0,
      challengeThresholdPct: Number(numbers.challenge) || 0,
    };
    const errors = validateConfig(presetToConfig(finalPreset));
    if (errors.length > 0) {
      Alert.alert('A few things to fix first', errors.map((e) => `• ${e.message}`).join('\n'));
      return;
    }
    router.push({ pathname: '/preview', params: { presetJson: JSON.stringify(finalPreset) } });
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Build a challenge',
          headerStyle: { backgroundColor: p.bg },
          headerTintColor: p.ink,
          headerShadowVisible: false,
        }}
      />
      <ScrollView
        style={{ backgroundColor: p.bg }}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 60 }}
      >
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
          <Pressable
            onPress={() => loadPreset(EIGHTY_PRESET)}
            style={[styles.quickBtn, { backgroundColor: p.card2 }]}
          >
            <Text style={{ color: p.ink, fontSize: 12.5, fontWeight: '700' }}>Start from 80/80/80</Text>
          </Pressable>
          <Pressable
            onPress={() => loadPreset(HARD_75_PRESET)}
            style={[styles.quickBtn, { backgroundColor: p.card2 }]}
          >
            <Text style={{ color: p.ink, fontSize: 12.5, fontWeight: '700' }}>Start from 75 Hard</Text>
          </Pressable>
        </View>

        <View style={[card, styles.section]}>
          <Text style={[t.cardTitle, { color: p.ink, marginBottom: 10 }]}>Basics</Text>
          <FieldLabel palette={p}>Name</FieldLabel>
          <TextInput
            style={[styles.input, { backgroundColor: p.card2, color: p.ink }]}
            value={draft.name}
            onChangeText={(v) => setDraft((d) => ({ ...d, name: v }))}
            placeholder="My challenge"
            placeholderTextColor={p.sub}
            accessibilityLabel="Challenge name"
          />
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <NumberField
              label="Duration (days)"
              value={numbers.duration}
              onChange={(v) => setNumbers((s) => ({ ...s, duration: v }))}
              palette={p}
            />
            <NumberField
              label="Daily threshold %"
              value={numbers.daily}
              onChange={(v) => setNumbers((s) => ({ ...s, daily: v }))}
              palette={p}
            />
            <NumberField
              label="Challenge threshold %"
              value={numbers.challenge}
              onChange={(v) => setNumbers((s) => ({ ...s, challenge: v }))}
              palette={p}
            />
          </View>

          <FieldLabel palette={p} style={{ marginTop: 12 }}>
            Strictness
          </FieldLabel>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {STRICTNESS_OPTIONS.map((opt) => {
              const sel = draft.strictness === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setDraft((d) => ({ ...d, strictness: opt.key }));
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

          <ToggleRow
            label="No-repeat-miss"
            hint="Flags the same item missed two days running (restarts strict/hardcore challenges)"
            value={draft.noRepeatMiss}
            onChange={(v) => setDraft((d) => ({ ...d, noRepeatMiss: v }))}
            palette={p}
          />
          <ToggleRow
            label="Travel exemption"
            hint="Travel days relax the no-repeat rule"
            value={draft.travelExemption}
            onChange={(v) => setDraft((d) => ({ ...d, travelExemption: v }))}
            palette={p}
          />
        </View>

        {draft.categories.map((cat) => (
          <View key={cat.id} style={[card, styles.section]}>
            <View style={styles.catHead}>
              <Text style={[t.cardTitle, { color: p.ink }]}>{cat.name}</Text>
              <Pressable onPress={() => removeCategory(cat.id)} style={styles.removeLink}>
                <Ionicons name="trash-outline" size={13} color={p.sub} />
                <Text style={{ color: p.sub, fontSize: 12 }}>Remove category</Text>
              </Pressable>
            </View>
            {draft.items
              .filter((i) => i.categoryId === cat.id)
              .map((i) => (
                <View key={i.id} style={styles.itemRow}>
                  {i.isBonus && <Ionicons name="sparkles-outline" size={13} color={p.sienna} />}
                  <Text style={{ flex: 1, fontSize: 13.5, color: p.ink }}>{i.label}</Text>
                  {i.isAvoidance && (
                    <Text style={{ fontSize: 9, fontWeight: '800', color: p.mint, letterSpacing: 0.5 }}>
                      AUTO
                    </Text>
                  )}
                  <Pressable
                    onPress={() => removeItem(i.id)}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${i.label}`}
                  >
                    <Ionicons name="close" size={16} color={p.sub} />
                  </Pressable>
                </View>
              ))}
            <View style={{ marginTop: 8 }}>
              <TextInput
                style={[styles.input, { backgroundColor: p.card2, color: p.ink }]}
                placeholder="New item…"
                placeholderTextColor={p.sub}
                value={newItem[cat.id]?.label ?? ''}
                onChangeText={(v) => patchNewItem(cat.id, { label: v })}
                accessibilityLabel={`New item in ${cat.name}`}
                onSubmitEditing={() => addItem(cat.id)}
                returnKeyType="done"
              />
              <View style={styles.pillRow}>
                {TIME_OPTIONS.map((opt) => {
                  const sel = (newItem[cat.id]?.timeOfDay ?? 'day') === opt.key;
                  return (
                    <Pressable
                      key={opt.key}
                      onPress={() => patchNewItem(cat.id, { timeOfDay: opt.key })}
                      style={[styles.tinyPill, { backgroundColor: sel ? p.mint : p.card2 }]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: sel }}
                      accessibilityLabel={`Time of day: ${opt.label}`}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '700', color: sel ? p.onAccent : p.sub }}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.pillRow}>
                <Pressable
                  onPress={() =>
                    patchNewItem(cat.id, {
                      isBonus: !(newItem[cat.id]?.isBonus ?? false),
                      isAvoidance: false,
                    })
                  }
                  style={[styles.tinyPill, { backgroundColor: newItem[cat.id]?.isBonus ? p.sienna : p.card2 }]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: newItem[cat.id]?.isBonus ?? false }}
                  accessibilityLabel="Bonus item — extra credit, never counts against you"
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: newItem[cat.id]?.isBonus ? p.onAccent : p.sub }}>
                    Bonus
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    patchNewItem(cat.id, {
                      isAvoidance: !(newItem[cat.id]?.isAvoidance ?? false),
                      isBonus: false,
                    })
                  }
                  style={[styles.tinyPill, { backgroundColor: newItem[cat.id]?.isAvoidance ? p.mint : p.card2 }]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: newItem[cat.id]?.isAvoidance ?? false }}
                  accessibilityLabel="Counts automatically — tap it on the day only to log a slip"
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '700',
                      color: newItem[cat.id]?.isAvoidance ? p.onAccent : p.sub,
                    }}
                  >
                    Counts by default
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => addItem(cat.id)}
                  style={[styles.addPill, { backgroundColor: p.mintSoft }]}
                  accessibilityRole="button"
                  accessibilityLabel={`Add item to ${cat.name}`}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: p.mint }}>Add</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ))}

        <View style={[card, styles.section, { flexDirection: 'row', gap: 8 }]}>
          <TextInput
            style={[styles.input, { flex: 1, backgroundColor: p.card2, color: p.ink }]}
            placeholder="New category name…"
            placeholderTextColor={p.sub}
            value={newCategory}
            onChangeText={setNewCategory}
          />
          <Pressable onPress={addCategory} style={[styles.quickBtn, { backgroundColor: p.mintSoft }]}>
            <Text style={{ color: p.mint, fontSize: 12.5, fontWeight: '700' }}>Add category</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={reviewDraft}
          style={({ pressed }) => [styles.startBtn, { backgroundColor: p.mint, opacity: pressed ? 0.8 : 1 }]}
          accessibilityRole="button"
        >
          <Text style={{ color: p.onAccent, fontWeight: '800', fontSize: 15 }}>Review & start</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  section: { padding: 16, marginBottom: 14 },
  input: { borderRadius: radius.notes, padding: 10, fontSize: 13.5 },
  pill: { borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 7 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8, alignItems: 'center' },
  tinyPill: { borderRadius: radius.pill, paddingHorizontal: 11, paddingVertical: 7 },
  addPill: { borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 7, marginLeft: 'auto' },
  quickBtn: { flex: 1, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 10, alignItems: 'center' },
  catHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  removeLink: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 4 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 5 },
  startBtn: { borderRadius: radius.pill, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
});
