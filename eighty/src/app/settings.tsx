import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
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
            Switch challenges, export a backup, or import one.
          </Text>
        </Pressable>

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
});
