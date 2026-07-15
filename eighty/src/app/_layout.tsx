import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { usePalette } from '@/theme/tokens';

export default function RootLayout() {
  const p = usePalette();
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: p.bg },
        }}
      />
    </>
  );
}
