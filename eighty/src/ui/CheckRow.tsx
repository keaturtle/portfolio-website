import { Pressable, Text, View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Palette } from '@/theme/tokens';

interface Props {
  label: string;
  categoryName: string;
  done: boolean;
  isBonus: boolean;
  missedYesterday: boolean;
  palette: Palette;
  onToggle: () => void;
}

export function CheckRow({
  label,
  categoryName,
  done,
  isBonus,
  missedYesterday,
  palette: p,
  onToggle,
}: Props) {
  const accent = isBonus ? p.sienna : p.mint;
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(
          done ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium,
        );
        onToggle();
      }}
      style={({ pressed }) => [
        styles.row,
        { borderTopColor: p.line, opacity: pressed ? 0.6 : 1 },
      ]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={label}
    >
      <View
        style={[
          styles.tick,
          { borderColor: done ? accent : p.line, backgroundColor: done ? accent : p.card2 },
          isBonus && { borderRadius: 9 },
        ]}
      >
        {done && <Ionicons name="checkmark" size={15} color={p.onAccent} style={{ fontWeight: '700' }} />}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, lineHeight: 19, color: done ? p.sub : p.ink }}>
          {label}
          {'  '}
          <Text style={{ fontSize: 9.5, fontWeight: '700', color: p.sub, letterSpacing: 0.8 }}>
            {categoryName.toUpperCase()}
          </Text>
        </Text>
        {missedYesterday && !done && (
          <View style={[styles.flag, { backgroundColor: p.siennaSoft }]}>
            <Ionicons name="alert-circle-outline" size={12} color={p.sienna} />
            <Text style={{ fontSize: 11.5, fontWeight: '600', color: p.sienna }}>
              missed yesterday — don’t miss twice
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 11,
    paddingHorizontal: 2,
    borderTopWidth: 1,
  },
  tick: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
  },
});
