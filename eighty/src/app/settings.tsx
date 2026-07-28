import { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { parseBackupJson } from '@/data/backup';
import { repo } from '@/data/db';
import {
  ensureNotificationPermission,
  getReminderState,
  setEveningReminder,
  setMorningReminder,
} from '@/data/notifications';
import { usePalette, radius, type as t } from '@/theme/tokens';
import { ThemeOverride, useThemeOverride } from '@/theme/ThemeContext';
import { ToggleRow } from '@/ui/forms';

const THEME_OPTIONS: { key: ThemeOverride; label: string }[] = [
  { key: 'auto', label: 'Auto' },
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
];

export default function SettingsScreen() {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const { override, setOverride } = useThemeOverride();
  const [morning, setMorning] = useState(false);
  const [evening, setEvening] = useState(false);
  const card = { backgroundColor: p.card, borderRadius: radius.card };

  useEffect(() => {
    getReminderState().then(({ morning: m, evening: e }) => {
      setMorning(m);
      setEvening(e);
    });
  }, []);

  const toggleMorning = async (v: boolean) => {
    if (v && !(await ensureNotificationPermission())) {
      Alert.alert('Notifications disabled', 'Enable notifications for Eighty in iOS Settings to use reminders.');
      return;
    }
    await setMorningReminder(v);
    setMorning(v);
  };

  const toggleEvening = async (v: boolean) => {
    if (v && !(await ensureNotificationPermission())) {
      Alert.alert('Notifications disabled', 'Enable notifications for Eighty in iOS Settings to use reminders.');
      return;
    }
    await setEveningReminder(v);
    setEvening(v);
  };

  const sendFeedback = () => {
    const subject = 'Eighty beta feedback';
    const body =
      "\n\nWhat's working, what's not, anything missing — all welcome.\n\n—\nSent from Eighty (iOS beta)";
    Linking.openURL(
      `mailto:keatentuttle@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    ).catch(() =>
      Alert.alert('No mail app', 'Email keatentuttle@gmail.com with your feedback — thank you.'),
    );
  };

  const backupAll = async () => {
    try {
      const json = JSON.stringify(repo.exportAllData(), null, 2);
      const file = new File(Paths.cache, `eighty-backup-${Date.now()}.json`);
      if (file.exists) file.delete();
      file.create();
      file.write(json);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, { mimeType: 'application/json', UTI: 'public.json' });
      } else {
        Alert.alert('Backed up', `Saved to ${file.uri}`);
      }
    } catch {
      Alert.alert('Backup failed', 'Could not create the backup file.');
    }
  };

  const restoreAll = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
    if (result.canceled || !result.assets?.[0]) return;
    try {
      const text = await new File(result.assets[0].uri).text();
      const parsed = parseBackupJson(text);
      if (!parsed.ok) {
        Alert.alert('Restore failed', parsed.error);
        return;
      }
      Alert.alert(
        'Replace everything on this device?',
        `This restores ${parsed.data.challenges.length} challenge${parsed.data.challenges.length === 1 ? '' : 's'} from the backup and permanently deletes everything currently here. This can't be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Restore',
            style: 'destructive',
            onPress: () => {
              repo.importAllData(parsed.data);
              router.replace('/');
            },
          },
        ],
      );
    } catch {
      Alert.alert('Restore failed', 'Could not read that file.');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Settings',
          headerStyle: { backgroundColor: p.bg },
          headerTintColor: p.ink,
          headerShadowVisible: false,
        }}
      />
      <ScrollView
        style={{ backgroundColor: p.bg }}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}
      >
        <View style={[card, styles.section]}>
          <Text style={[t.cardTitle, { color: p.ink, marginBottom: 10 }]}>Appearance</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {THEME_OPTIONS.map((opt) => {
              const sel = override === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setOverride(opt.key);
                  }}
                  style={[styles.pill, { backgroundColor: sel ? p.mint : p.card2 }]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: sel }}
                  accessibilityLabel={`${opt.label} theme`}
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
          <Text style={[t.cardTitle, { color: p.ink, marginBottom: 4 }]}>Reminders</Text>
          <Text style={{ fontSize: 11.5, color: p.sub, marginBottom: 8 }}>
            Local notifications only — nothing leaves your phone.
          </Text>
          <ToggleRow
            label="Morning kickoff"
            hint="Every day at 8:00 AM — wrap up yesterday and move on to the new day"
            value={morning}
            onChange={toggleMorning}
            palette={p}
          />
          <ToggleRow
            label="Evening check-in"
            hint="Every day at 9:00 PM — a nudge to close anything still open before bed"
            value={evening}
            onChange={toggleEvening}
            palette={p}
          />
        </View>

        <Pressable onPress={sendFeedback} style={[card, styles.section]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="chatbubble-ellipses-outline" size={16} color={p.mint} />
            <Text style={{ fontSize: 14, fontWeight: '700', color: p.ink }}>Send feedback</Text>
          </View>
          <Text style={{ fontSize: 12, color: p.sub, marginTop: 4 }}>
            One tap to email me — what's off, confusing, or missing. I read every one.
          </Text>
        </Pressable>

        {repo.getActive() && (
          <Pressable onPress={() => router.push('/edit-challenge')} style={[card, styles.section]}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: p.ink }}>Edit current challenge</Text>
            <Text style={{ fontSize: 12, color: p.sub, marginTop: 2 }}>
              Change duration, thresholds, strictness, or rules — your past days recalculate.
            </Text>
          </Pressable>
        )}

        <Pressable onPress={() => router.push('/challenges')} style={[card, styles.section]}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: p.ink }}>Manage challenges</Text>
          <Text style={{ fontSize: 12, color: p.sub, marginTop: 2 }}>
            Switch challenges, export one as a file, or import one.
          </Text>
        </Pressable>

        <View style={[card, styles.section]}>
          <Text style={[t.cardTitle, { color: p.ink, marginBottom: 4 }]}>Backup</Text>
          <Text style={{ fontSize: 11.5, color: p.sub, marginBottom: 10 }}>
            There's no cloud sync yet — this is the only way to protect your history if you lose
            this phone. A backup captures every challenge, attempt, and logged day.
          </Text>
          <Pressable onPress={backupAll} style={[styles.dataBtn, { backgroundColor: p.mintSoft }]}>
            <Ionicons name="cloud-upload-outline" size={15} color={p.mint} />
            <Text style={{ color: p.mint, fontSize: 13, fontWeight: '700' }}>Back up everything</Text>
          </Pressable>
          <Pressable onPress={restoreAll} style={[styles.dataBtn, { backgroundColor: p.siennaSoft, marginTop: 8 }]}>
            <Ionicons name="cloud-download-outline" size={15} color={p.sienna} />
            <Text style={{ color: p.sienna, fontSize: 13, fontWeight: '700' }}>Restore from backup</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => router.push('/onboarding')} style={[card, styles.section]}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: p.ink }}>Replay intro</Text>
          <Text style={{ fontSize: 12, color: p.sub, marginTop: 2 }}>See the welcome walkthrough again.</Text>
        </Pressable>

        <View style={[card, styles.section]}>
          <Text style={[t.cardTitle, { color: p.ink }]}>About</Text>
          <Text style={{ fontSize: 12.5, color: p.sub, marginTop: 6 }}>Eighty · v1.0.0</Text>
          <Text style={{ fontSize: 12, color: p.sub, marginTop: 4, lineHeight: 17 }}>
            All data stays on this device. No account, no cloud, no tracking.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  section: { padding: 16, marginBottom: 14 },
  pill: { borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 9 },
  dataBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    borderRadius: radius.pill,
    paddingVertical: 10,
  },
});
