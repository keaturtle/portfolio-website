import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { usePalette } from '@/theme/tokens';
import { ErrorBoundary } from '@/ui/ErrorBoundary';

export default function RootLayout() {
  const p = usePalette();
  return (
    <ErrorBoundary>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: p.bg },
        }}
      />
    </ErrorBoundary>
  );
}
