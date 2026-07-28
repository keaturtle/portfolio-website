import { View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';

interface Props {
  values: number[];
  min: number;
  max: number;
  color: string;
  width?: number;
  height?: number;
  /** Screen-reader name for the series, e.g. "Satisfaction". */
  label?: string;
}

/** Minimal polyline chart over already-filtered (gap-free) values. */
export function Sparkline({ values, min, max, color, width = 280, height = 56, label }: Props) {
  if (values.length === 0) {
    return (
      <View
        style={{ width, height }}
        accessible
        accessibilityLabel={label ? `${label}: no data yet` : undefined}
      />
    );
  }
  const latest = values[values.length - 1]!;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const a11yLabel = label
    ? `${label} trend over ${values.length} day${values.length === 1 ? '' : 's'}: latest ${latest}, ranging ${lo} to ${hi}.`
    : undefined;
  const stepX = values.length > 1 ? width / (values.length - 1) : 0;
  const range = max - min || 1;
  const points = values.map((v, i) => {
    const x = values.length > 1 ? i * stepX : width / 2;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  });
  const [lastX, lastY] = points[points.length - 1]!.split(',').map(Number);

  return (
    <View accessible accessibilityLabel={a11yLabel}>
      <Svg width={width} height={height}>
        <Polyline
          points={points.join(' ')}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx={lastX} cy={lastY} r={3.5} fill={color} />
      </Svg>
    </View>
  );
}
