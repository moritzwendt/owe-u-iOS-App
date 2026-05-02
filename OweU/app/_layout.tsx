import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';

import { AppProvider } from '@/store/app-context';
import { AuthProvider } from '@/store/auth-context';
import { ThemeContextProvider, useTheme } from '@/store/theme-context';
import { darkColors, lightColors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

const NAV_THEMES = {
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: darkColors.bg,
      card: darkColors.bg,
      text: darkColors.textPrimary,
      border: darkColors.border,
      primary: darkColors.textPrimary,
    },
  },
  light: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: lightColors.bg,
      card: lightColors.bg,
      text: lightColors.textPrimary,
      border: lightColors.border,
      primary: lightColors.textPrimary,
    },
  },
} as const;

function ThemedNavigator() {
  const { colorMode, colors } = useTheme();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ThemeProvider value={NAV_THEMES[colorMode]}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.textPrimary,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.bg },
            headerBackTitle: 'Zurück',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style={colorMode === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </View>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <AuthProvider>
        <ThemeContextProvider>
          <ThemedNavigator />
        </ThemeContextProvider>
      </AuthProvider>
    </AppProvider>
  );
}
