import React, { createContext, useContext, useState, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { ColorScheme, darkColors, lightColors } from '@/constants/theme';

export type ThemePreference = 'system' | 'hell' | 'dunkel';
export type ColorMode = 'dark' | 'light';

interface ThemeContextType {
  preference: ThemePreference;
  colorMode: ColorMode;
  colors: ColorScheme;
  setPreference: (p: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  preference: 'dunkel',
  colorMode: 'dark',
  colors: darkColors,
  setPreference: () => {},
});

export function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>('dunkel');

  const colorMode: ColorMode = useMemo(() => {
    if (preference === 'hell') return 'light';
    if (preference === 'dunkel') return 'dark';
    return systemScheme === 'light' ? 'light' : 'dark';
  }, [preference, systemScheme]);

  const colors = colorMode === 'dark' ? darkColors : lightColors;

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
