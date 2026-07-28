import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Palette, radius } from '@/theme/tokens';

/**
 * Shared form primitives for the builder, edit-challenge, and settings screens —
 * one source of truth for caption/input/toggle styling and alignment.
 */

export function FieldLabel({
  children,
  palette: p,
  reserveTwoLines = false,
  style,
}: {
  children: string;
  palette: Palette;
  /** Reserve two caption lines so side-by-side fields stay aligned when one wraps. */
  reserveTwoLines?: boolean;
  style?: object;
}) {
  return (
    <Text
      style={[
        styles.label,
        { color: p.sub },
        reserveTwoLines && styles.labelTwoLines,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

/**
 * Numeric field that edits a plain string — parse on save, never while typing,
 * so clearing the field doesn't snap to "0" under the user's thumb.
 */
export function NumberField({
  label,
  value,
  onChange,
  palette: p,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  palette: Palette;
}) {
  return (
    <View style={{ flex: 1 }}>
      <FieldLabel palette={p} reserveTwoLines>
        {label}
      </FieldLabel>
      <TextInput
        style={[styles.input, { backgroundColor: p.card2, color: p.ink }]}
        value={value}
        onChangeText={onChange}
        keyboardType="number-pad"
        accessibilityLabel={label}
      />
    </View>
  );
}

export function ToggleRow({
  label,
  hint,
  value,
  onChange,
  palette: p,
}: {
  label: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
  palette: Palette;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13.5, color: p.ink }}>{label}</Text>
        <Text style={{ fontSize: 11, color: p.sub, marginTop: 1, lineHeight: 15 }}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={(v) => {
          Haptics.selectionAsync();
          onChange(v);
        }}
        trackColor={{ true: p.mint, false: p.card2 }}
        thumbColor={p.card}
        accessibilityLabel={`${label}. ${hint}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 11.5, fontWeight: '700', lineHeight: 15, marginBottom: 5 },
  labelTwoLines: { minHeight: 30 },
  input: { borderRadius: radius.notes, padding: 10, fontSize: 13.5, minHeight: 40 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9 },
});
