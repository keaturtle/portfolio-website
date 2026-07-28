import { useColorScheme } from 'react-native';
import { useThemeOverride } from './ThemeContext';

/**
 * "Midnight Indigo" design tokens — Obsidian navy base, Electric-blue accent
 * (success), Persimmon warn (miss). Dark is the native scheme; light is the
 * derived variant. Both are tuned to clear WCAG AA (see eighty/QA.md § contrast).
 *
 * NOTE: the token names `mint` (accent / success) and `sienna` (warn / fail) are
 * kept for stability across the app — the *values* are blue / persimmon now, not
 * green / terracotta. Rename is a future cleanup, not worth touching every screen.
 */
export const palettes = {
  dark: {
    bg: '#08090f',
    card: '#10131f',
    card2: '#191d2e',
    ink: '#e8eaf2',
    sub: '#8d93a6',
    mint: '#5b9dff', // Electric blue — success / accent
    mintSoft: '#14223d',
    sienna: '#ff6b45', // Persimmon — fail / warn
    siennaSoft: '#331711',
    line: '#212636',
    onAccent: '#08090f',
  },
  light: {
    // Blue/persimmon light variant; sub/mint/sienna darkened to clear AA on the
    // lightest surfaces (card, chips).
    bg: '#eef1f6',
    card: '#f9fbfd',
    card2: '#e6eaf2',
    ink: '#131a2b',
    sub: '#586074',
    mint: '#245ec9', // Electric blue, darkened for light backgrounds
    mintSoft: '#dce7fb',
    sienna: '#b0461f', // Persimmon, darkened for light backgrounds
    siennaSoft: '#f7e2da',
    line: '#dce2ec',
    onAccent: '#ffffff',
  },
} as const;

export type Palette = { [K in keyof (typeof palettes)['dark']]: string };

export function usePalette(): Palette {
  const { override } = useThemeOverride();
  const system = useColorScheme();
  const scheme = override === 'auto' ? system : override;
  return scheme === 'light' ? palettes.light : palettes.dark;
}

/** Shape scale: cards 20, banners 16, pills 99, notes 14, checks are circles. */
export const radius = { card: 20, banner: 16, pill: 99, notes: 14, chk: 9 } as const;

/** Type scale (SF system font; heavy weights carry the numeric identity). */
export const type = {
  h1: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  stat: { fontSize: 16, fontWeight: '800' as const },
  ringPct: { fontSize: 29, fontWeight: '800' as const, letterSpacing: -0.5 },
  body: { fontSize: 14 },
  small: { fontSize: 12.5 },
  cardTitle: { fontSize: 13, fontWeight: '700' as const },
} as const;
