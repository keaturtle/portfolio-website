import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { repo } from '@/data/db';
import { subscribeData } from '@/data/events';

export type ThemeOverride = 'auto' | 'light' | 'dark';
const SETTING_KEY = 'themeOverride';

interface ThemeCtxValue {
  override: ThemeOverride;
  setOverride: (v: ThemeOverride) => void;
}

const ThemeCtx = createContext<ThemeCtxValue>({ override: 'auto', setOverride: () => {} });

function isThemeOverride(v: string | null): v is ThemeOverride {
  return v === 'auto' || v === 'light' || v === 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [override, setOverrideState] = useState<ThemeOverride>(() => {
    const stored = repo.getSetting(SETTING_KEY);
    return isThemeOverride(stored) ? stored : 'auto';
  });

  // Restoring a backup replaces settings wholesale — re-read so the restored
  // theme applies without an app restart.
  useEffect(
    () =>
      subscribeData(() => {
        const stored = repo.getSetting(SETTING_KEY);
        setOverrideState(isThemeOverride(stored) ? stored : 'auto');
      }),
    [],
  );

  const setOverride = (v: ThemeOverride) => {
    repo.setSetting(SETTING_KEY, v);
    setOverrideState(v);
  };

  return <ThemeCtx.Provider value={{ override, setOverride }}>{children}</ThemeCtx.Provider>;
}

export function useThemeOverride(): ThemeCtxValue {
  return useContext(ThemeCtx);
}
