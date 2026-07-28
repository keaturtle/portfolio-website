import { Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Palette } from '@/theme/tokens';

/**
 * The one way into Settings from every tab — same placement, same 44pt target.
 * `floating` pins it top-right for empty states that have no header row.
 */
export function SettingsGear({ palette, floating = false, top }: { palette: Palette; floating?: boolean; top?: number }) {
  return (
    <Pressable
      onPress={() => router.push('/settings')}
      style={[styles.btn, floating && styles.floating, floating && top !== undefined && { top }]}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel="Settings"
    >
      <Ionicons name="settings-outline" size={22} color={palette.sub} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { padding: 11 },
  floating: { position: 'absolute', top: 16, right: 10, zIndex: 10 },
});
