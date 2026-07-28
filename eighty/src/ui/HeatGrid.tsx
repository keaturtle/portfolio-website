import { Pressable, Text, View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { DayScore, addDays } from '@engine';
import { Palette } from '@/theme/tokens';

interface Props {
  durationDays: number;
  dayScores: DayScore[];
  travelByDayIndex: Set<number>;
  /** Local date of day 0 — anchors the weekday alignment for every other day. */
  startLocalDate: string;
  palette: Palette;
  onDayPress: (dayIndex: number) => void;
}

interface Cell {
  dayIndex: number;
}

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const GAP = 5;

function weekdayOf(localDate: string): number {
  return new Date(`${localDate}T00:00:00Z`).getUTCDay();
}

/** Real weekday-aligned calendar grid (Sun–Sat columns), like a contribution graph. */
export function HeatGrid({
  durationDays,
  dayScores,
  travelByDayIndex,
  startLocalDate,
  palette: p,
  onDayPress,
}: Props) {
  const byIndex = new Map(dayScores.map((s) => [s.dayIndex, s]));
  const leadingBlanks = weekdayOf(startLocalDate);

  const cells: (Cell | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: durationDays }, (_, dayIndex) => ({ dayIndex })),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: (Cell | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  const endLocalDate = addDays(startLocalDate, durationDays - 1);
  const rangeLabel = `${formatShort(startLocalDate)} – ${formatShort(endLocalDate)}`;

  return (
    <View>
      <Text style={{ fontSize: 11, color: p.sub, marginBottom: 10 }}>{rangeLabel}</Text>
      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label, i) => (
          <Text key={i} style={[styles.weekdayLabel, { color: p.sub }]}>
            {label}
          </Text>
        ))}
      </View>
      {rows.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((cell, ci) => {
            if (!cell) return <View key={ci} style={styles.cell} />;
            const score = byIndex.get(cell.dayIndex);
            const isTravel = travelByDayIndex.has(cell.dayIndex);
            const { bg, border, text } = cellColors(score, p);
            return (
              <Pressable
                key={ci}
                onPress={() => {
                  if (!score) return;
                  Haptics.selectionAsync();
                  onDayPress(cell.dayIndex);
                }}
                disabled={!score}
                style={[styles.cell, styles.cellBox, { backgroundColor: bg, borderColor: border }]}
                accessibilityRole={score ? 'button' : undefined}
                accessibilityLabel={`Day ${cell.dayIndex + 1}${score ? `, ${score.outcome}` : ', not started'}`}
              >
                <Text maxFontSizeMultiplier={1.2} style={{ fontSize: 10, fontWeight: '700', color: text }}>
                  {cell.dayIndex + 1}
                </Text>
                {isTravel && <View style={[styles.travelDot, { backgroundColor: p.sub }]} />}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function formatShort(localDate: string): string {
  const d = new Date(`${localDate}T00:00:00Z`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
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
  weekdayRow: { flexDirection: 'row', gap: GAP, marginBottom: 6 },
  weekdayLabel: { flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '700' },
  row: { flexDirection: 'row', gap: GAP, marginBottom: GAP },
  cell: { flex: 1, aspectRatio: 1 },
  cellBox: {
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  travelDot: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
