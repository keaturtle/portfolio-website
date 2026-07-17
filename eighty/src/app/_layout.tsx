import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { usePalette } from '@/theme/tokens';
import { ThemeProvider } from '@/theme/ThemeContext';
import { ErrorBoundary } from '@/ui/ErrorBoundary';

function Root() {
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

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Root />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
