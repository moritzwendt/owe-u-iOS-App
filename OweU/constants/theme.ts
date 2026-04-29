import { Platform } from 'react-native';

// ─── Color Scheme Type ────────────────────────────────────────────────────────

export type ColorScheme = {
  bg: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  borderSubtle: string;
  positive: string;
  positiveMuted: string;
  negative: string;
  negativeMuted: string;
  accent: string;
  accentMuted: string;
  settled: string;
  textPrimary: string;
  textSecondary: string;
  textDim: string;
  textOnAccent: string;
  error: string;
};

// ─── Dark Palette ─────────────────────────────────────────────────────────────

export const darkColors: ColorScheme = {
  bg: '#0F0F14',
  surface: '#161620',
  surfaceElevated: '#1E1E2C',
  border: '#26263A',
  borderSubtle: '#1C1C2E',
  positive: '#00C896',
  positiveMuted: 'rgba(0,200,150,0.12)',
  negative: '#FF5C5C',
  negativeMuted: 'rgba(255,92,92,0.12)',
  accent: '#7C6AF7',
  accentMuted: 'rgba(124,106,247,0.15)',
  settled: '#44445A',
  textPrimary: '#F0F0F8',
  textSecondary: '#8888AA',
  textDim: '#44445A',
  textOnAccent: '#FFFFFF',
  error: '#FF5C5C',
};

// ─── Light Palette ────────────────────────────────────────────────────────────

export const lightColors: ColorScheme = {
  bg: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceElevated: '#F2F2F7',
  border: '#E5E5EA',
  borderSubtle: '#F0F0F5',
  positive: '#00A374',
  positiveMuted: 'rgba(0,163,116,0.10)',
  negative: '#D94040',
  negativeMuted: 'rgba(217,64,64,0.08)',
  accent: '#6259E8',
  accentMuted: 'rgba(98,89,232,0.10)',
  settled: '#8E8E93',
  textPrimary: '#1C1C1E',
  textSecondary: '#6C6C70',
  textDim: '#AEAEB2',
  textOnAccent: '#FFFFFF',
  error: '#D94040',
};

export function getColors(mode: 'dark' | 'light'): ColorScheme {
  return mode === 'dark' ? darkColors : lightColors;
}

// Static dark alias — for legacy imports that haven't been migrated yet
export const C = darkColors;

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const S = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  section: 40,
  screenPad: 20,
};

// ─── Border Radius ────────────────────────────────────────────────────────────

export const R = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  sheet: 24,
  pill: 9999,
};

// ─── Fonts ────────────────────────────────────────────────────────────────────

export const F = Platform.select({
  ios: { system: undefined as unknown as string },
  default: { system: undefined as unknown as string },
})!;

// ─── Legacy compatibility exports ─────────────────────────────────────────────

export const Colors = {
  light: {
    text: lightColors.textPrimary,
    background: lightColors.bg,
    tint: lightColors.accent,
    icon: lightColors.textSecondary,
    tabIconDefault: lightColors.textDim,
    tabIconSelected: lightColors.accent,
  },
  dark: {
    text: darkColors.textPrimary,
    background: darkColors.bg,
    tint: darkColors.accent,
    icon: darkColors.textSecondary,
    tabIconDefault: darkColors.textDim,
    tabIconSelected: darkColors.accent,
  },
};

export const Fonts = {
  rounded: undefined as unknown as string,
  mono: 'Courier New',
};
