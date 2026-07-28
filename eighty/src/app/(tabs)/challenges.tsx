import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, Text, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { evaluateAttempt, validateConfig } from '@engine';
import { ATTEMPT_STATUS_LABEL } from '@/data/attemptStatusLabel';
import { PRESETS } from '@/data/presets';
import { ChallengeListItem, ChallengePreset } from '@/data/repository';
import { parseTemplateJson, presetToConfig, serializeTemplate } from '@/data/templates';
import { useActiveChallenge } from '@/data/useActiveChallenge';
import { usePalette, radius, type as t } from '@/theme/tokens';
import { SettingsGear } from '@/ui/SettingsGear';

function preview(preset: ChallengePreset) {
  router.push({ pathname: '/preview', params: { presetJson: JSON.stringify(preset) } });
}

export default function ChallengesScreen() {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const { repo, active, version } = useActiveChallenge();
  const card = { backgroundColor: p.card, borderRadius: radius.card };

  // Recomputed only when the data version changes — evaluateAttempt walks every
  // challenge's full history, which is too much to redo on unrelated re-renders.
  const history = useMemo(
    () =>
      repo
        .listChallenges()
        .map((c) => {
          const detail = repo.getChallengeDetail(c.challengeId);
          const logs = detail ? repo.getLogs(detail.attemptId) : [];
          const state = detail ? evaluateAttempt(detail.config, logs) : null;
          return { ...c, detail, state };
        })
        .sort((a, b) => (a.status === 'active' ? -1 : b.status === 'active' ? 1 : 0)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version],
  );

  const switchTo = (item: ChallengeListItem) => {
    Alert.alert(
      'Switch challenge?',
      `This archives your current challenge and resumes "${item.name}" right where you left it.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          onPress: () => {
            repo.activateChallenge(item.challengeId);
            router.replace('/');
          },
        },
      ],
    );
  };

  const remove = (item: ChallengeListItem) => {
    Alert.alert('Delete challenge?', `This permanently deletes "${item.name}" and every day logged under it. This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => repo.deleteChallenge(item.challengeId),
      },
    ]);
  };

  const exportChallenge = async (item: ChallengeListItem) => {
    const detail = repo.getChallengeDetail(item.challengeId);
    if (!detail) return;
    try {
      const preset: ChallengePreset = {
        name: detail.name,
        durationDays: detail.config.durationDays,
        dailyThresholdPct: detail.config.dailyThresholdPct,
        challengeThresholdPct: detail.config.challengeThresholdPct,
        strictness: detail.config.strictness,
        noRepeatMiss: detail.config.noRepeatMiss,
        travelExemption: detail.config.travelExemption,
        categories: detail.categories,
        items: detail.items,
      };
      const json = JSON.stringify(serializeTemplate(preset), null, 2);
      const filename = `${detail.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
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
      preview(parsed.preset);
    } catch {
      Alert.alert('Import failed', 'Could not read that file.');
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
      <View style={styles.header}>
        <View>
          <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 1, color: p.mint }}>EIGHTY</Text>
          <Text style={[t.h1, { color: p.ink, marginTop: 2 }]}>Challenges</Text>
        </View>
        <SettingsGear palette={p} />
      </View>

      {history.length > 0 && (
        <>
          <Text style={[styles.groupLabel, { color: p.sub }]}>Your challenges</Text>
          {history.map((item) => {
            const isCurrent = item.status === 'active';
            return (
              <View key={item.challengeId} style={[card, styles.section]}>
                <View style={styles.historyHead}>
                  <View style={{ flex: 1 }}>
                    <Text style={[t.cardTitle, { color: p.ink }]}>{item.name}</Text>
                    <Text style={{ fontSize: 12, color: p.sub, marginTop: 3 }}>
                      {item.state ? ATTEMPT_STATUS_LABEL[item.state.status] : 'Unknown'}
                      {item.detail
                        ? ` · day ${item.state?.daysElapsed ?? 0} of ${item.detail.config.durationDays}`
                        : ''}
                    </Text>
                  </View>
                  {isCurrent && (
                    <View style={[styles.currentPill, { backgroundColor: p.mintSoft }]}>
                      <Text style={{ fontSize: 10.5, fontWeight: '800', color: p.mint }}>CURRENT</Text>
                    </View>
                  )}
                </View>
                <View style={styles.historyActions}>
                  {!isCurrent && (
                    <Pressable
                      onPress={() => switchTo(item)}
                      style={[styles.linkBtn, { backgroundColor: p.mintSoft }]}
                    >
                      <Ionicons name="swap-horizontal-outline" size={14} color={p.mint} />
                      <Text style={{ color: p.mint, fontSize: 12.5, fontWeight: '700' }}>Switch to this</Text>
                    </Pressable>
                  )}
                  <Pressable
                    onPress={() => exportChallenge(item)}
                    style={styles.iconBtn}
                    hitSlop={4}
                    accessibilityRole="button"
                    accessibilityLabel={`Export ${item.name} as a file`}
                  >
                    <Ionicons name="share-outline" size={18} color={p.sub} />
                  </Pressable>
                  <Pressable
                    onPress={() => remove(item)}
                    style={styles.iconBtn}
                    hitSlop={4}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${item.name}`}
                  >
                    <Ionicons name="trash-outline" size={18} color={p.sienna} />
                  </Pressable>
                </View>
              </View>
            );
          })}
        </>
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
            onPress={() => preview(preset)}
            style={({ pressed }) => [styles.startBtn, { backgroundColor: p.mint, opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={{ color: p.onAccent, fontWeight: '800', fontSize: 13.5 }}>Preview & start</Text>
          </Pressable>
        </View>
      ))}

      <Text style={[styles.groupLabel, { color: p.sub }]}>Custom</Text>
      <Pressable onPress={() => router.push('/builder')} style={[card, styles.section, styles.rowBtn]}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: p.ink }}>Build a custom challenge</Text>
          <Text style={{ fontSize: 12, color: p.sub, marginTop: 2 }}>
            Pick your own duration, thresholds, and checklist.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={p.sub} />
      </Pressable>
      <Pressable onPress={importFromFile} style={[card, styles.section, styles.rowBtn]}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: p.ink }}>Import from file</Text>
          <Text style={{ fontSize: 12, color: p.sub, marginTop: 2 }}>
            Load a challenge someone shared with you as a JSON file.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={p.sub} />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 6,
    paddingBottom: 16,
    paddingTop: 10,
  },
  section: { padding: 16, marginBottom: 12 },
  groupLabel: { fontSize: 11.5, fontWeight: '700', letterSpacing: 0.6, marginBottom: 8, marginTop: 4, paddingHorizontal: 6 },
  startBtn: { borderRadius: radius.pill, paddingVertical: 10, alignItems: 'center', marginTop: 12 },
  historyHead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  currentPill: { borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 4 },
  historyActions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  iconBtn: { padding: 11 },
  linkBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.pill,
    paddingVertical: 8,
  },
  rowBtn: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
