import React, { createContext, useContext, useState, useMemo } from 'react';
import { useColorScheme, Settings } from 'react-native';
import { ColorScheme, darkColors, lightColors } from '@/constants/theme';

export type ThemePreference = 'system' | 'hell' | 'dunkel';
export type ColorMode = 'dark' | 'light';

const SETTINGS_KEY = 'themePreference';

function loadPreference(): ThemePreference {
  const stored = Settings.get(SETTINGS_KEY) as ThemePreference | null;
  if (stored === 'hell' || stored === 'dunkel' || stored === 'system') return stored;
  return 'system';
}

interface ThemeContextType {
  preference: ThemePreference;
  colorMode: ColorMode;
  colors: ColorScheme;
  setPreference: (p: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  preference: 'system',
  colorMode: 'dark',
  colors: darkColors,
  setPreference: () => {},
});

export function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>(loadPreference);

  const colorMode: ColorMode = useMemo(() => {
    if (preference === 'hell') return 'light';
    if (preference === 'dunkel') return 'dark';
    return systemScheme === 'light' ? 'light' : 'dark';
  }, [preference, systemScheme]);

  const colors = colorMode === 'dark' ? darkColors : lightColors;

  function setPreference(p: ThemePreference) {
    Settings.set({ [SETTINGS_KEY]: p });
    setPreferenceState(p);
  }

  return (
    <ThemeContext.Provider value={{ preference, colorMode, colors, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function useColors(): ColorScheme {
  return useContext(ThemeContext).colors;
}
