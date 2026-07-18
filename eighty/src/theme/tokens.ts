import { useColorScheme } from 'react-native';
import { useThemeOverride } from './ThemeContext';

/**
 * "Night Fir" design tokens — C palette on B card structure (Phase 1 approved).
 * Dark is the native scheme; light is the derived variant.
 */
export const palettes = {
  dark: {
    bg: '#0d1411',
    card: '#141d18',
    card2: '#1a2620',
    ink: '#edf3ee',
    sub: '#8da399',
    mint: '#7fdcb2',
    mintSoft: '#1c332a',
    sienna: '#e0805a',
    siennaSoft: '#33231b',
    line: '#22302a',
    onAccent: '#0d1411',
  },
  light: {
    // Text/accent colors tuned to clear WCAG AA (4.5:1) on their backgrounds;
    // see eighty/QA.md § contrast. sub/mint/sienna were darkened slightly from
    // the original draft to pass on the lightest surfaces (card, chips).
    bg: '#eef1ee',
    card: '#f8faf8',
    card2: '#e6ebe7',
    ink: '#17241d',
    sub: '#586a60',
    mint: '#156c4a',
    mintSoft: '#d9eae1',
    sienna: '#a54c26',
    siennaSoft: '#f3e3d9',
    line: '#dde3de',
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
