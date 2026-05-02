import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

import { useColors } from '@/store/theme-context';
import { useAuth } from '@/store/auth-context';
import { S, R } from '@/constants/theme';

type Mode = 'login' | 'register';

// MARK: - Background

function BackgroundGlow() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={glow.blob1} />
      <View style={glow.blob2} />
      <View style={glow.blob3} />
    </View>
  );
}

// MARK: - Mode Toggle

function ModeToggle({ mode, onToggle }: { mode: Mode; onToggle: (m: Mode) => void }) {
  const C = useColors();
  const [w, setW] = useState(0);
  const x = useSharedValue(0);
  const initialized = useRef(false);

  const indicStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  useEffect(() => {
    if (w === 0) return;
    const half = (w - 4) / 2;
    const target = mode === 'login' ? 0 : half;
    if (!initialized.current) {
      x.value = target;
      initialized.current = true;
    } else {
      x.value = withTiming(target, { duration: 220, easing: Easing.inOut(Easing.cubic) });
    }
  }, [mode, w]);

  const slotWidth = Math.max(0, (w - 4) / 2);

  return (
    <View
      style={[tog.wrap, { backgroundColor: C.surface, borderColor: C.border }]}
      onLayout={e => setW(e.nativeEvent.layout.width)}
    >
      <Animated.View
        style={[tog.indicator, { width: slotWidth, backgroundColor: C.surfaceElevated }, indicStyle]}
      />
      {(['login', 'register'] as Mode[]).map(m => (
        <Pressable
          key={m}
          style={tog.btn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onToggle(m);
          }}
        >
          <Text style={[tog.btnText, { color: mode === m ? C.textPrimary : C.textDim }]}>
            {m === 'login' ? 'Anmelden' : 'Registrieren'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

// MARK: - Input Field

function InputField({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry: isSecure,
  keyboardType,
  autoCapitalize,
  autoComplete,
}: {
  icon: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences';
  autoComplete?: 'email' | 'password' | 'new-password';
}) {
  const C = useColors();
  const [showPw, setShowPw] = useState(false);
  const focus = useSharedValue(0);

  const wrapStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focus.value, [0, 1], [C.border, C.accent]),
  }));

  return (
    <Animated.View style={[inp.wrap, { backgroundColor: C.surface }, wrapStyle]}>
      <Ionicons name={icon as any} size={17} color={C.textDim} />
      <TextInput
        style={[inp.input, { color: C.textPrimary }]}
        placeholder={placeholder}
        placeholderTextColor={C.textDim}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={isSecure && !showPw}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize ?? 'sentences'}
        autoComplete={autoComplete}
        autoCorrect={false}
        onFocus={() => { focus.value = withTiming(1, { duration: 180 }); }}
        onBlur={() => { focus.value = withTiming(0, { duration: 180 }); }}
      />
      {isSecure && (
        <Pressable onPress={() => setShowPw(s => !s)} hitSlop={8}>
          <Ionicons name={showPw ? 'eye-outline' : 'eye-off-outline'} size={17} color={C.textDim} />
        </Pressable>
      )}
    </Animated.View>
  );
}

// MARK: - Social Button

function SocialButton({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  const C = useColors();
  return (
    <Pressable
      style={({ pressed }) => [
        soc.btn,
        { backgroundColor: C.surface, borderColor: C.border },
        pressed && { backgroundColor: C.surfaceElevated },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <Ionicons name={icon as any} size={19} color={C.textPrimary} />
      <Text style={[soc.label, { color: C.textPrimary }]}>{label}</Text>
    </Pressable>
  );
}

// MARK: - Screen

export default function AuthScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithApple, isLoading } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(24);

  useEffect(() => {
    contentOpacity.value = withDelay(80, withTiming(1, { duration: 420 }));
    contentY.value = withDelay(80, withTiming(0, { duration: 380, easing: Easing.out(Easing.cubic) }));
  }, []);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));

  function handleModeToggle(m: Mode) {
    setMode(m);
    if (m === 'login') setConfirmPassword('');
  }

  async function handleSubmit() {
    if (!email.trim() || !password) {
      Alert.alert('Eingabe fehlt', 'Bitte E-Mail und Passwort eingeben.');
      return;
    }
    if (mode === 'register' && password !== confirmPassword) {
      Alert.alert('Passwörter stimmen nicht überein', 'Bitte überprüfe deine Eingabe.');
      return;
    }
    try {
      if (mode === 'login') {
        await signInWithEmail(email.trim(), password);
      } else {
        await signUpWithEmail(email.trim(), password);
      }
      router.replace('/(tabs)' as any);
    } catch (err: any) {
      Alert.alert('Fehler', err.message ?? 'Etwas ist schiefgelaufen.');
    }
  }

  const verbLabel = mode === 'login' ? 'anmelden' : 'registrieren';
  const ctaLabel = mode === 'login' ? 'Anmelden' : 'Registrieren';

  return (
    <View style={[sc.root, { backgroundColor: C.bg }]}>
      <BackgroundGlow />

      <ScrollView
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={[
          sc.scroll,
          { paddingTop: insets.top + S.xxl, paddingBottom: insets.bottom + S.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[sc.inner, contentStyle]}>

          {/* Brand */}
          <View style={br.block}>
            <View style={br.wordRow}>
              <Text style={[br.wordAccent, { color: C.accent }]}>Owe</Text>
              <Text style={[br.wordPlain, { color: C.textPrimary }]}>You</Text>
            </View>
            <Text style={[br.tagline, { color: C.textSecondary }]}>Behalte den Überblick.</Text>
          </View>

          {/* Mode toggle */}
          <ModeToggle mode={mode} onToggle={handleModeToggle} />

          {/* Form */}
          <View style={fm.stack}>
            <InputField
              icon="mail-outline"
              placeholder="E-Mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <InputField
              icon="lock-closed-outline"
              placeholder="Passwort"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete={mode === 'login' ? 'password' : 'new-password'}
            />
            {mode === 'register' && (
              <InputField
                icon="lock-closed-outline"
                placeholder="Passwort bestätigen"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
              />
            )}
            {mode === 'login' && (
              <Pressable style={fm.forgotWrap} hitSlop={8}>
                <Text style={[fm.forgotText, { color: C.textSecondary }]}>Passwort vergessen?</Text>
              </Pressable>
            )}
          </View>

          {/* Primary CTA */}
          <Pressable
            style={({ pressed }) => [
              cta.btn,
              { backgroundColor: C.accent },
              (pressed || isLoading) && { opacity: 0.8 },
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={C.textOnAccent} />
            ) : (
              <Text style={[cta.label, { color: C.textOnAccent }]}>{ctaLabel}</Text>
            )}
          </Pressable>

          {/* Divider */}
          <View style={div.row}>
            <View style={[div.line, { backgroundColor: C.border }]} />
            <Text style={[div.text, { color: C.textDim }]}>oder</Text>
            <View style={[div.line, { backgroundColor: C.border }]} />
          </View>

          {/* Social */}
          <View style={soc.stack}>
            <SocialButton
              icon="logo-apple"
              label={`Mit Apple ${verbLabel}`}
              onPress={async () => { await signInWithApple(); router.replace('/(tabs)' as any); }}
            />
            <SocialButton
              icon="logo-google"
              label={`Mit Google ${verbLabel}`}
              onPress={async () => { await signInWithGoogle(); router.replace('/(tabs)' as any); }}
            />
          </View>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

// MARK: - Styles

const glow = StyleSheet.create({
  blob1: {
    position: 'absolute',
    top: -120,
    left: -100,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#7C6AF7',
    opacity: 0.11,
  },
  blob2: {
    position: 'absolute',
    top: 60,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#00C896',
    opacity: 0.07,
  },
  blob3: {
    position: 'absolute',
    bottom: 120,
    left: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#7C6AF7',
    opacity: 0.05,
  },
});

const sc = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: S.screenPad },
  inner: { gap: S.xl },
});

const br = StyleSheet.create({
  block: { alignItems: 'center', gap: S.xs, paddingBottom: S.sm },
  wordRow: { flexDirection: 'row', alignItems: 'baseline' },
  wordAccent: { fontSize: 42, fontWeight: '800', letterSpacing: -1.5 },
  wordPlain: { fontSize: 42, fontWeight: '800', letterSpacing: -1.5 },
  tagline: { fontSize: 15 },
});

const tog = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderRadius: R.pill,
    borderWidth: 1,
    padding: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 2,
    left: 2,
    bottom: 2,
    borderRadius: R.pill,
  },
  btn: { flex: 1, paddingVertical: 11, alignItems: 'center' },
  btnText: { fontSize: 14, fontWeight: '600' },
});

const inp = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: R.md,
    borderWidth: 1,
    paddingHorizontal: S.base,
    gap: S.sm,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: S.base },
});

const fm = StyleSheet.create({
  stack: { gap: S.sm },
  forgotWrap: { alignSelf: 'flex-end' },
  forgotText: { fontSize: 13 },
});

const cta = StyleSheet.create({
  btn: {
    borderRadius: R.md,
    paddingVertical: S.base + 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  label: { fontSize: 16, fontWeight: '700' },
});

const div = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  line: { flex: 1, height: 1 },
  text: { fontSize: 12, fontWeight: '500' },
});

const soc = StyleSheet.create({
  stack: { gap: S.sm },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: R.md,
    borderWidth: 1,
    paddingVertical: S.base,
    gap: S.sm,
    minHeight: 52,
  },
  label: { fontSize: 15, fontWeight: '600' },
});
