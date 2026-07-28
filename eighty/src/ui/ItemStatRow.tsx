import { Text, View, StyleSheet } from 'react-native';
import { Palette } from '@/theme/tokens';

interface Props {
  label: string;
  categoryName: string;
  pct: number;
  isBonus: boolean;
  palette: Palette;
}

/** One habit-leaderboard row: label + category + a completion-rate bar. */
export function ItemStatRow({ label, categoryName, pct, isBonus, palette: p }: Props) {
  const accent = isBonus ? p.sienna : p.mint;
  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${label}${categoryName ? `, ${categoryName}` : ''}${
        isBonus ? ', bonus' : ''
      }: completed ${Math.round(pct)} percent of eligible days`}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, color: p.ink }} numberOfLines={1}>
          {label}
        </Text>
        <Text style={{ fontSize: 9.5, fontWeight: '700', color: p.sub, letterSpacing: 0.6, marginTop: 1 }}>
          {categoryName.toUpperCase()}
        </Text>
      </View>
      <View style={[styles.barTrack, { backgroundColor: p.card2 }]}>
        <View
          style={[
            styles.barFill,
            { width: `${Math.min(pct, 100)}%`, backgroundColor: accent },
          ]}
        />
      </View>
      <Text style={{ fontSize: 12, fontWeight: '700', color: p.ink, width: 38, textAlign: 'right' }}>
        {Math.round(pct)}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  barTrack: { width: 64, height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
});
