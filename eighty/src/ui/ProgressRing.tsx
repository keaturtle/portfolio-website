import { useEffect, useRef } from 'react';
import { Animated, Easing, View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { Palette, type as t } from '@/theme/tokens';
import { useReducedMotion } from './useReducedMotion';

const R = 52;
const C = 2 * Math.PI * R;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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
  const rounded = Math.round(pct);
  const reduced = useReducedMotion();

  // Animate the arc fill: dash offset C = empty, C*(1 - shown/100) = filled.
  const targetOffset = C * (1 - shown / 100);
  const offset = useRef(new Animated.Value(C)).current;
  useEffect(() => {
    if (reduced) {
      offset.setValue(targetOffset);
      return;
    }
    Animated.timing(offset, {
      toValue: targetOffset,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // SVG props can't run on the native driver
    }).start();
  }, [targetOffset, reduced, offset]);

  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Today's progress: ${rounded} percent complete, goal ${goalPct} percent.${
        pct >= goalPct ? ' Goal met.' : ''
      }`}
    >
      <Svg width={size} height={size} viewBox="0 0 120 120">
        {/* Decorative — the parent View owns the accessible label. */}
        <Circle cx={60} cy={60} r={R} stroke={p.card2} strokeWidth={10} fill="none" />
        <AnimatedCircle
          cx={60}
          cy={60}
          r={R}
          stroke={p.mint}
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
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
