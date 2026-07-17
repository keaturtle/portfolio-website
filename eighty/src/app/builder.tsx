import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Strictness, TimeOfDay, validateConfig } from '@engine';
import { EIGHTY_PRESET, HARD_75_PRESET } from '@/data/presets';
import { ChallengePreset, PresetItem } from '@/data/repository';
import { confirmAndStart } from '@/data/startFlow';
import { presetToConfig } from '@/data/templates';
import { useActiveChallenge } from '@/data/useActiveChallenge';
import { usePalette, radius, type as t } from '@/theme/tokens';

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

export default function BuilderScreen() {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const { presetJson } = useLocalSearchParams<{ presetJson?: string }>();
  const { repo, active, refresh } = useActiveChallenge();
  const [draft, setDraft] = useState<ChallengePreset>(() => initialDraft(presetJson));
  const [newCategory, setNewCategory] = useState('');
  const [newItem, setNewItem] = useState<Record<string, { label: string; isBonus: boolean; timeOfDay: TimeOfDay }>>({});
  const card = { backgroundColor: p.card, borderRadius: radius.card };

  const loadPreset = (preset: ChallengePreset) => {
    Haptics.selectionAsync();
    setDraft({ ...preset, categories: [...preset.categories], items: preset.items.map((i) => ({ ...i })) });
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
      timeOfDay: draftItem.timeOfDay,
    };
    setDraft((d) => ({ ...d, items: [...d.items, item] }));
    setNewItem((n) => ({ ...n, [categoryId]: { label: '', isBonus: false, timeOfDay: 'day' } }));
  };

  const removeItem = (id: string) => setDraft((d) => ({ ...d, items: d.items.filter((i) => i.id !== id) }));

  const startDraft = () => {
    const cfg = presetToConfig({ ...draft, name: draft.name.trim() || 'Custom challenge' });
    const errors = validateConfig(cfg);
    if (errors.length > 0) {
      Alert.alert('Fix these first', errors.map((e) => `• ${e.message}`).join('\n'));
      return;
    }
    const finalPreset = { ...draft, name: draft.name.trim() || 'Custom challenge' };
    confirmAndStart(repo, active, finalPreset, refresh);
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
          <FieldLabel p={p}>Name</FieldLabel>
          <TextInput
            style={[styles.input, { backgroundColor: p.card2, color: p.ink }]}
            value={draft.name}
            onChangeText={(v) => setDraft((d) => ({ ...d, name: v }))}
            placeholder="My challenge"
            placeholderTextColor={p.sub}
          />
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <View style={{ flex: 1 }}>
              <FieldLabel p={p}>Duration (days)</FieldLabel>
              <TextInput
                style={[styles.input, { backgroundColor: p.card2, color: p.ink }]}
                value={String(draft.durationDays)}
                onChangeText={(v) => setDraft((d) => ({ ...d, durationDays: Number(v) || 0 }))}
                keyboardType="number-pad"
              />
            </View>
            <View style={{ flex: 1 }}>
              <FieldLabel p={p}>Daily threshold %</FieldLabel>
              <TextInput
                style={[styles.input, { backgroundColor: p.card2, color: p.ink }]}
                value={String(draft.dailyThresholdPct)}
                onChangeText={(v) => setDraft((d) => ({ ...d, dailyThresholdPct: Number(v) || 0 }))}
                keyboardType="number-pad"
              />
            </View>
            <View style={{ flex: 1 }}>
              <FieldLabel p={p}>Challenge threshold %</FieldLabel>
              <TextInput
                style={[styles.input, { backgroundColor: p.card2, color: p.ink }]}
                value={String(draft.challengeThresholdPct)}
                onChangeText={(v) => setDraft((d) => ({ ...d, challengeThresholdPct: Number(v) || 0 }))}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <FieldLabel p={p} style={{ marginTop: 12 }}>
            Strictness
          </FieldLabel>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {STRICTNESS_OPTIONS.map((opt) => {
              const sel = draft.strictness === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => setDraft((d) => ({ ...d, strictness: opt.key }))}
                  style={[styles.pill, { backgroundColor: sel ? p.mint : p.card2 }]}
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
            hint="Never fail the same item two days in a row"
            value={draft.noRepeatMiss}
            onChange={(v) => setDraft((d) => ({ ...d, noRepeatMiss: v }))}
            p={p}
          />
          <ToggleRow
            label="Travel exemption"
            hint="Travel days relax the no-repeat rule"
            value={draft.travelExemption}
            onChange={(v) => setDraft((d) => ({ ...d, travelExemption: v }))}
            p={p}
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
                  <Pressable onPress={() => removeItem(i.id)}>
                    <Ionicons name="close" size={16} color={p.sub} />
                  </Pressable>
                </View>
              ))}
            <View style={{ marginTop: 8 }}>
              <TextInput
                style={[styles.input, { backgroundColor: p.card2, color: p.ink }]}
                placeholder="New item label…"
                placeholderTextColor={p.sub}
                value={newItem[cat.id]?.label ?? ''}
                onChangeText={(v) =>
                  setNewItem((n) => ({
                    ...n,
                    [cat.id]: { label: v, isBonus: n[cat.id]?.isBonus ?? false, timeOfDay: n[cat.id]?.timeOfDay ?? 'day' },
                  }))
                }
              />
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 8, alignItems: 'center' }}>
                {TIME_OPTIONS.map((opt) => {
                  const sel = (newItem[cat.id]?.timeOfDay ?? 'day') === opt.key;
                  return (
                    <Pressable
                      key={opt.key}
                      onPress={() =>
                        setNewItem((n) => ({
                          ...n,
                          [cat.id]: { label: n[cat.id]?.label ?? '', isBonus: n[cat.id]?.isBonus ?? false, timeOfDay: opt.key },
                        }))
                      }
                      style={[styles.tinyPill, { backgroundColor: sel ? p.mint : p.card2 }]}
                    >
                      <Text style={{ fontSize: 10.5, fontWeight: '700', color: sel ? p.onAccent : p.sub }}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
                <Pressable
                  onPress={() =>
                    setNewItem((n) => ({
                      ...n,
                      [cat.id]: { label: n[cat.id]?.label ?? '', isBonus: !(n[cat.id]?.isBonus ?? false), timeOfDay: n[cat.id]?.timeOfDay ?? 'day' },
                    }))
                  }
                  style={[styles.tinyPill, { backgroundColor: newItem[cat.id]?.isBonus ? p.sienna : p.card2 }]}
                >
                  <Text style={{ fontSize: 10.5, fontWeight: '700', color: newItem[cat.id]?.isBonus ? p.onAccent : p.sub }}>
                    Bonus
                  </Text>
                </Pressable>
                <Pressable onPress={() => addItem(cat.id)} style={[styles.tinyPill, { backgroundColor: p.mintSoft, marginLeft: 'auto' }]}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: p.mint }}>Add</Text>
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
          onPress={startDraft}
          style={({ pressed }) => [styles.startBtn, { backgroundColor: p.mint, opacity: pressed ? 0.8 : 1 }]}
        >
          <Text style={{ color: p.onAccent, fontWeight: '800', fontSize: 15 }}>Review & start</Text>
        </Pressable>
      </ScrollView>
    </>
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
      <Switch value={value} onValueChange={onChange} trackColor={{ true: p.mint, false: p.card2 }} thumbColor={p.card} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { padding: 16, marginBottom: 14 },
  input: { borderRadius: radius.notes, padding: 10, fontSize: 13.5 },
  pill: { borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 7 },
  tinyPill: { borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 5 },
  quickBtn: { flex: 1, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 10, alignItems: 'center' },
  catHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  removeLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 5 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, marginTop: 4 },
  startBtn: { borderRadius: radius.pill, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
});
