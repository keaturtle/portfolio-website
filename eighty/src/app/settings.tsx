import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
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
                  onPress={() => setOverride(opt.key)}
                  style={[styles.pill, { backgroundColor: sel ? p.mint : p.card2 }]}
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
            label="Morning close-out"
            hint="8:00 AM — nudge to close out yesterday"
            value={morning}
            onChange={toggleMorning}
            p={p}
          />
          <ToggleRow
            label="Evening check-in"
            hint="9:00 PM — nudge for unchecked items today"
            value={evening}
            onChange={toggleEvening}
            p={p}
          />
        </View>

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

        <View style={[card, styles.section]}>
          <Text style={[t.cardTitle, { color: p.ink }]}>About</Text>
          <Text style={{ fontSize: 12.5, color: p.sub, marginTop: 6 }}>Eighty · v0.1.0</Text>
          <Text style={{ fontSize: 12, color: p.sub, marginTop: 4, lineHeight: 17 }}>
            All data stays on this device. No account, no cloud, no tracking.
          </Text>
        </View>
      </ScrollView>
    </>
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
  pill: { borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 9 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9 },
  dataBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    borderRadius: radius.pill,
    paddingVertical: 10,
  },
});
