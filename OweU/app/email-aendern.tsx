import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useColors } from '@/store/theme-context';
import { S, R } from '@/constants/theme';

const CURRENT_EMAIL = 'max@oweyou.app';

export default function EmailAendernScreen() {
  const C = useColors();
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSave() {
    if (!newEmail.trim() || !newEmail.includes('@')) { Alert.alert('Ungültige E-Mail'); return; }
    if (!password) { Alert.alert('Passwort erforderlich', 'Bitte bestätige deine Identität.'); return; }
    Alert.alert('Bestätigungsmail gesendet', `Wir haben eine Mail an ${newEmail} gesendet.`);
  }

  return (
    <>
      <Stack.Screen options={{ title: 'E-Mail ändern' }} />
      <ScrollView style={[layout.scroll, { backgroundColor: C.bg }]} contentContainerStyle={layout.content} keyboardShouldPersistTaps="handled">
        <View style={[layout.currentBox, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[layout.currentLabel, { color: C.textSecondary }]}>AKTUELLE E-MAIL</Text>
          <Text style={[layout.currentEmail, { color: C.textPrimary }]}>{CURRENT_EMAIL}</Text>
        </View>

        <Text style={[layout.sectionLabel, { color: C.textSecondary }]}>NEUE E-MAIL</Text>
        <View style={[layout.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <TextInput style={[layout.fieldInput, { color: C.textPrimary }]} value={newEmail} onChangeText={setNewEmail} placeholder="neue@email.de" placeholderTextColor={C.textDim} keyboardType="email-address" autoCapitalize="none" autoFocus />
        </View>

        <Text style={[layout.sectionLabel, { color: C.textSecondary }]}>PASSWORT BESTÄTIGEN</Text>
        <View style={[layout.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <TextInput style={[layout.fieldInput, { color: C.textPrimary }]} value={password} onChangeText={setPassword} placeholder="Dein aktuelles Passwort" placeholderTextColor={C.textDim} secureTextEntry autoCapitalize="none" />
        </View>

        <View style={[layout.infoBox, { backgroundColor: C.accentMuted, borderColor: 'rgba(98,89,232,0.2)' }]}>
          <Text style={[layout.infoText, { color: C.textSecondary }]}>
            Du erhältst eine Bestätigungsmail an deine neue Adresse. Die Änderung wird wirksam, sobald du auf den Link klickst.
          </Text>
        </View>

        <Pressable style={({ pressed }) => [layout.btn, { backgroundColor: C.accent }, pressed && { opacity: 0.85 }]} onPress={handleSave}>
          <Text style={[layout.btnText, { color: C.textOnAccent }]}>E-Mail ändern</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const layout = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: S.screenPad, paddingTop: S.xl, paddingBottom: S.section, gap: S.sm },
  currentBox: { borderRadius: R.md, borderWidth: 1, padding: S.base, gap: S.xs, marginBottom: S.sm },
  currentLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1.2 },
  currentEmail: { fontSize: 15, fontWeight: '500' },
  sectionLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1.2, marginTop: S.md, paddingHorizontal: S.xs },
  card: { borderRadius: R.md, borderWidth: 1, overflow: 'hidden' },
  fieldInput: { paddingHorizontal: S.base, paddingVertical: S.md, fontSize: 15 },
  infoBox: { borderRadius: R.sm, padding: S.base, borderWidth: 1, marginTop: S.sm },
  infoText: { fontSize: 12, lineHeight: 18 },
  btn: { borderRadius: R.md, paddingVertical: S.base, alignItems: 'center', marginTop: S.md, minHeight: 50, justifyContent: 'center' },
  btnText: { fontSize: 15, fontWeight: '700' },
});
