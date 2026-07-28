import { useEffect } from 'react';
import { AppState } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { publishActiveWidget } from '@/data/widget';
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
  // Keep the home/lock-screen widget fresh on launch and every time the app returns to
  // the foreground, straight from the repo (independent of which screen is mounted).
  useEffect(() => {
    publishActiveWidget();
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') publishActiveWidget();
    });
    return () => sub.remove();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Root />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
