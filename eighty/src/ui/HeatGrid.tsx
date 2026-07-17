import { Pressable, Text, View, StyleSheet } from 'react-native';
import { DayScore } from '@engine';
import { Palette } from '@/theme/tokens';

interface Props {
  durationDays: number;
  dayScores: DayScore[];
  travelByDayIndex: Set<number>;
  palette: Palette;
  onDayPress: (dayIndex: number) => void;
}

const CELL = 28;

/** 80-day heat grid: one cell per day, colored by outcome, tap for detail. */
export function HeatGrid({ durationDays, dayScores, travelByDayIndex, palette: p, onDayPress }: Props) {
  const byIndex = new Map(dayScores.map((s) => [s.dayIndex, s]));

  return (
    <View style={styles.grid}>
      {Array.from({ length: durationDays }, (_, dayIndex) => {
        const score = byIndex.get(dayIndex);
        const isTravel = travelByDayIndex.has(dayIndex);
        const { bg, border, text } = cellColors(score, p);
        return (
          <Pressable
            key={dayIndex}
            onPress={() => score && onDayPress(dayIndex)}
            disabled={!score}
            style={[styles.cell, { backgroundColor: bg, borderColor: border }]}
            accessibilityRole={score ? 'button' : undefined}
            accessibilityLabel={`Day ${dayIndex + 1}${score ? `, ${score.outcome}` : ', not started'}`}
          >
            <Text style={{ fontSize: 9, fontWeight: '700', color: text }}>{dayIndex + 1}</Text>
            {isTravel && <View style={[styles.travelDot, { backgroundColor: p.sub }]} />}
          </Pressable>
        );
      })}
    </View>
  );
}

function cellColors(
  score: DayScore | undefined,
  p: Palette,
): { bg: string; border: string; text: string } {
  if (!score) return { bg: p.card2, border: p.line, text: p.sub };
  if (score.outcome === 'success') return { bg: p.mint, border: p.mint, text: p.onAccent };
  if (score.outcome === 'fail') return { bg: p.sienna, border: p.sienna, text: p.onAccent };
  return { bg: p.card2, border: p.mint, text: p.ink }; // pending: currently open day
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cell: {
    width: CELL,
    height: CELL,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  travelDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
