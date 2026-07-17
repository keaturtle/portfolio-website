import { Alert, Pressable, ScrollView, Text, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { validateConfig } from '@engine';
import { PRESETS } from '@/data/presets';
import { ChallengePreset } from '@/data/repository';
import { confirmAndStart } from '@/data/startFlow';
import { parseTemplateJson, presetToConfig, serializeTemplate } from '@/data/templates';
import { useActiveChallenge } from '@/data/useActiveChallenge';
import { usePalette, radius, type as t } from '@/theme/tokens';

export default function ChallengesScreen() {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const { repo, active, refresh } = useActiveChallenge();
  const card = { backgroundColor: p.card, borderRadius: radius.card };

  const start = (preset: ChallengePreset) => confirmAndStart(repo, active, preset, refresh);

  const importFromFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
    if (result.canceled || !result.assets?.[0]) return;
    try {
      const text = await new File(result.assets[0].uri).text();
      const parsed = parseTemplateJson(text);
      if (!parsed.ok) {
        Alert.alert('Import failed', parsed.error);
        return;
      }
      const errors = validateConfig(presetToConfig(parsed.preset));
      if (errors.length > 0) {
        Alert.alert('Import failed', errors.map((e) => `• ${e.message}`).join('\n'));
        return;
      }
      start(parsed.preset);
    } catch {
      Alert.alert('Import failed', 'Could not read that file.');
    }
  };

  const exportActive = async () => {
    if (!active) return;
    try {
      const preset: ChallengePreset = {
        name: active.name,
        durationDays: active.config.durationDays,
        dailyThresholdPct: active.config.dailyThresholdPct,
        challengeThresholdPct: active.config.challengeThresholdPct,
        strictness: active.config.strictness,
        noRepeatMiss: active.config.noRepeatMiss,
        travelExemption: active.config.travelExemption,
        categories: active.categories,
        items: active.items,
      };
      const json = JSON.stringify(serializeTemplate(preset), null, 2);
      const filename = `${active.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
      const file = new File(Paths.cache, filename);
      if (file.exists) file.delete();
      file.create();
      file.write(json);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, { mimeType: 'application/json', UTI: 'public.json' });
      } else {
        Alert.alert('Exported', `Saved to ${file.uri}`);
      }
    } catch {
      Alert.alert('Export failed', 'Could not create the export file.');
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: p.bg }}
      contentContainerStyle={{
        paddingTop: insets.top + 10,
        paddingBottom: insets.bottom + 40,
        paddingHorizontal: 16,
      }}
    >
      <View style={{ paddingHorizontal: 6, paddingBottom: 16, paddingTop: 10 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 1, color: p.mint }}>EIGHTY</Text>
        <Text style={[t.h1, { color: p.ink, marginTop: 2 }]}>Challenges</Text>
      </View>

      {active && (
        <View style={[card, styles.section]}>
          <Text style={[t.cardTitle, { color: p.ink }]}>Currently running</Text>
          <Text style={{ fontSize: 14, color: p.ink, marginTop: 6, fontWeight: '700' }}>{active.name}</Text>
          <Text style={{ fontSize: 12, color: p.sub, marginTop: 2 }}>
            {active.config.durationDays} days · {active.config.dailyThresholdPct}% daily ·{' '}
            {active.config.strictness}
          </Text>
          <Pressable onPress={exportActive} style={[styles.linkBtn, { backgroundColor: p.mintSoft }]}>
            <Text style={{ color: p.mint, fontSize: 12.5, fontWeight: '700' }}>Export as file</Text>
          </Pressable>
        </View>
      )}

      <Text style={[styles.groupLabel, { color: p.sub }]}>Presets</Text>
      {PRESETS.map((preset) => (
        <View key={preset.name} style={[card, styles.section]}>
          <Text style={[t.cardTitle, { color: p.ink }]}>{preset.name}</Text>
          <Text style={{ fontSize: 12, color: p.sub, marginTop: 4 }}>
            {preset.durationDays} days · {preset.dailyThresholdPct}% daily / {preset.challengeThresholdPct}%
            challenge · {preset.strictness}
            {preset.noRepeatMiss ? ' · no-repeat-miss' : ''}
          </Text>
          <Pressable
            onPress={() => start(preset)}
            style={({ pressed }) => [styles.startBtn, { backgroundColor: p.mint, opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={{ color: p.onAccent, fontWeight: '800', fontSize: 13.5 }}>Start</Text>
          </Pressable>
        </View>
      ))}

      <Text style={[styles.groupLabel, { color: p.sub }]}>Custom</Text>
      <Pressable
        onPress={() => router.push('/builder')}
        style={[card, styles.section, styles.rowBtn]}
      >
        <Text style={{ fontSize: 14, fontWeight: '700', color: p.ink }}>Build a custom challenge</Text>
        <Text style={{ fontSize: 12, color: p.sub, marginTop: 2 }}>
          Pick your own duration, thresholds, and checklist.
        </Text>
      </Pressable>
      <Pressable onPress={importFromFile} style={[card, styles.section, styles.rowBtn]}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: p.ink }}>Import from file</Text>
        <Text style={{ fontSize: 12, color: p.sub, marginTop: 2 }}>
          Load a challenge someone shared with you as a JSON file.
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  section: { padding: 16, marginBottom: 12 },
  groupLabel: { fontSize: 11.5, fontWeight: '700', letterSpacing: 0.6, marginBottom: 8, marginTop: 4, paddingHorizontal: 6 },
  startBtn: { borderRadius: radius.pill, paddingVertical: 10, alignItems: 'center', marginTop: 12 },
  linkBtn: { borderRadius: radius.pill, paddingVertical: 8, alignItems: 'center', marginTop: 12 },
  rowBtn: {},
});
