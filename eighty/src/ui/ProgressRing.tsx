import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { Palette, type as t } from '@/theme/tokens';

const R = 52;
const C = 2 * Math.PI * R;

interface Props {
  /** 0–100+, capped visually at 100 */
  pct: number;
  goalPct: number;
  palette: Palette;
  size?: number;
}

/** Day-progress ring with a sienna tick marking the daily-success threshold. */
export function ProgressRing({ pct, goalPct, palette: p, size = 118 }: Props) {
  const shown = Math.min(pct, 100);
  const compact = size < 90;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Circle cx={60} cy={60} r={R} stroke={p.card2} strokeWidth={10} fill="none" />
        <Circle
          cx={60}
          cy={60}
          r={R}
          stroke={p.mint}
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${(shown / 100) * C} ${C}`}
          transform="rotate(-90 60 60)"
        />
        <Line
          x1={60}
          y1={2}
          x2={60}
          y2={14}
          stroke={p.sienna}
          strokeWidth={3}
          strokeLinecap="round"
          transform={`rotate(${goalPct * 3.6} 60 60)`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text style={[t.ringPct, { color: p.ink, fontSize: compact ? size * 0.26 : t.ringPct.fontSize }]}>
          {Math.round(pct)}%
        </Text>
        {!compact && <Text style={{ fontSize: 10.5, fontWeight: '600', color: p.sub }}>goal {goalPct}%</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
