import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useColors } from '@/store/theme-context';
import { S, R } from '@/constants/theme';

function Requirement({ met, label }: { met: boolean; label: string }) {
  const C = useColors();
  return (
    <View style={layout.reqRow}>
      <Text style={[layout.reqDot, { color: met ? C.positive : C.textDim }]}>{met ? '✓' : '○'}</Text>
      <Text style={[layout.reqLabel, { color: met ? C.positive : C.textDim }]}>{label}</Text>
    </View>
  );
}

export default function PasswortAendernScreen() {
  const C = useColors();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');

  const hasLength = next.length >= 8;
  const hasMixed = /[a-z]/.test(next) && /[A-Z]/.test(next);
  const hasNumber = /\d/.test(next);
  const passwordsMatch = next.length > 0 && next === confirm;

  function handleSave() {
    if (!current) { Alert.alert('Pflichtfeld', 'Bitte gib dein aktuelles Passwort ein.'); return; }
    if (!hasLength || !hasMixed || !hasNumber) { Alert.alert('Schwaches Passwort', 'Bitte erfülle alle Anforderungen.'); return; }
    if (!passwordsMatch) { Alert.alert('Passwörter stimmen nicht überein'); return; }
    Alert.alert('Gespeichert', 'Dein Passwort wurde erfolgreich geändert.');
  }

  const inputStyle = [layout.input, { backgroundColor: C.bg, borderColor: C.border, color: C.textPrimary }];

  return (
    <>
      <Stack.Screen options={{ title: 'Passwort ändern' }} />
      <ScrollView style={[layout.scroll, { backgroundColor: C.bg }]} contentContainerStyle={layout.content} keyboardShouldPersistTaps="handled">
        <Text style={[layout.sectionLabel, { color: C.textSecondary }]}>AKTUELLES PASSWORT</Text>
        <View style={[layout.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <TextInput style={[layout.fieldInput, { color: C.textPrimary }]} value={current} onChangeText={setCurrent} placeholder="Aktuelles Passwort" placeholderTextColor={C.textDim} secureTextEntry autoCapitalize="none" />
        </View>

        <Text style={[layout.sectionLabel, { color: C.textSecondary }]}>NEUES PASSWORT</Text>
        <View style={[layout.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <TextInput style={[layout.fieldInput, { color: C.textPrimary }]} value={next} onChangeText={setNext} placeholder="Neues Passwort" placeholderTextColor={C.textDim} secureTextEntry autoCapitalize="none" />
          <View style={[layout.fieldDivider, { borderTopColor: C.borderSubtle }]}>
            <TextInput style={[layout.fieldInput, { color: C.textPrimary }]} value={confirm} onChangeText={setConfirm} placeholder="Passwort wiederholen" placeholderTextColor={C.textDim} secureTextEntry autoCapitalize="none" />
          </View>
        </View>

        <View style={[layout.reqBox, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[layout.reqTitle, { color: C.textSecondary }]}>ANFORDERUNGEN</Text>
          <Requirement met={hasLength} label="Mindestens 8 Zeichen" />
          <Requirement met={hasMixed} label="Groß- und Kleinbuchstaben" />
          <Requirement met={hasNumber} label="Mindestens eine Zahl" />
          <Requirement met={passwordsMatch} label="Passwörter stimmen überein" />
        </View>

        <Pressable style={({ pressed }) => [layout.btn, { backgroundColor: C.accent }, pressed && { opacity: 0.85 }]} onPress={handleSave}>
          <Text style={[layout.btnText, { color: C.textOnAccent }]}>Passwort ändern</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const layout = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: S.screenPad, paddingTop: S.xl, paddingBottom: S.section, gap: S.sm },
  sectionLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1.2, marginTop: S.md, paddingHorizontal: S.xs },
  card: { borderRadius: R.md, borderWidth: 1, overflow: 'hidden' },
  fieldInput: { paddingHorizontal: S.base, paddingVertical: S.md, fontSize: 15 },
  fieldDivider: { borderTopWidth: 1 },
  input: { borderWidth: 1, borderRadius: R.sm, padding: S.base, fontSize: 15 },
  reqBox: { borderRadius: R.md, borderWidth: 1, padding: S.base, gap: S.sm, marginTop: S.sm },
  reqTitle: { fontSize: 10, fontWeight: '600', letterSpacing: 1.2, marginBottom: S.xs },
  reqRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  reqDot: { fontSize: 13, fontWeight: '700', width: 16, textAlign: 'center' },
  reqLabel: { fontSize: 13 },
  btn: { borderRadius: R.md, paddingVertical: S.base, alignItems: 'center', marginTop: S.md, minHeight: 50, justifyContent: 'center' },
  btnText: { fontSize: 15, fontWeight: '700' },
});
