import { Pressable, Text, View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Rating } from '@engine';
import { Palette } from '@/theme/tokens';

interface Props {
  label: string;
  value: Rating | undefined;
  palette: Palette;
  onChange: (v: Rating) => void;
}

const RATINGS: Rating[] = [1, 2, 3, 4, 5];

export function RatingScale({ label, value, palette: p, onChange }: Props) {
  return (
    <View style={styles.row}>
      <Text style={{ fontSize: 13.5, color: p.sub }}>{label}</Text>
      <View style={{ flexDirection: 'row', gap: 7 }}>
        {RATINGS.map((n) => {
          const sel = value === n;
          return (
            <Pressable
              key={n}
              onPress={() => {
                Haptics.selectionAsync();
                onChange(n);
              }}
              hitSlop={6}
              style={[styles.dot, { backgroundColor: sel ? p.mint : p.card2 }]}
              accessibilityRole="button"
              accessibilityLabel={`${label} ${n} of 5`}
              accessibilityState={{ selected: sel }}
            >
              <Text
                maxFontSizeMultiplier={1.2}
                style={{ fontSize: 13.5, fontWeight: '700', color: sel ? p.onAccent : p.sub }}
              >
                {n}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
