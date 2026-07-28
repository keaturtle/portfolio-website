import { createContext, ReactNode, useContext, useState } from 'react';
import { repo } from '@/data/db';

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

  const setOverride = (v: ThemeOverride) => {
    repo.setSetting(SETTING_KEY, v);
    setOverrideState(v);
  };

  return <ThemeCtx.Provider value={{ override, setOverride }}>{children}</ThemeCtx.Provider>;
}

export function useThemeOverride(): ThemeCtxValue {
  return useContext(ThemeCtx);
}
