import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { initDataStore } from '@/data/store';
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
  // Wire the data store's lifecycle triggers: widget publishing (launch + every
  // write), and the foreground/midnight version bumps that keep date-dependent UI
  // (the "move on" banner) honest without any screen doing its own bookkeeping.
  useEffect(() => initDataStore(), []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Root />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
