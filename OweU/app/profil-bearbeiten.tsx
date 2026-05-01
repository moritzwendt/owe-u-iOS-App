import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useColors } from '@/store/theme-context';
import { S, R } from '@/constants/theme';

const MOCK_USER = { name: 'Max Mustermann', email: 'max@oweyou.app', initials: 'MM' };

export default function ProfilBearbeitenScreen() {
  const C = useColors();
  const [name, setName] = useState(MOCK_USER.name);
  const [email, setEmail] = useState(MOCK_USER.email);

  function handleSave() {
    if (!name.trim()) { Alert.alert('Pflichtfeld', 'Bitte gib deinen Namen ein.'); return; }
    Alert.alert('Gespeichert', 'Dein Profil wurde aktualisiert.', [{ text: 'OK' }]);
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Profil bearbeiten' }} />
      <ScrollView style={[layout.scroll, { backgroundColor: C.bg }]} contentContainerStyle={layout.content} keyboardShouldPersistTaps="handled">
        <Pressable style={layout.avatarSection} onPress={() => Alert.alert('Profilfoto', 'Foto-Upload wird mit Supabase-Integration verfügbar.')}>
          <View style={[layout.avatar, { backgroundColor: C.accentMuted, borderColor: C.accent }]}>
            <Text style={[layout.avatarInitials, { color: C.accent }]}>{MOCK_USER.initials}</Text>
          </View>
          <Text style={[layout.avatarChange, { color: C.accent }]}>Foto ändern</Text>
        </Pressable>

        <Text style={[layout.sectionLabel, { color: C.textSecondary }]}>ANGABEN</Text>
        <View style={[layout.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={layout.fieldWrap}>
            <Text style={[layout.fieldLabel, { color: C.textSecondary }]}>NAME</Text>
            <TextInput style={[layout.input, { color: C.textPrimary }]} value={name} onChangeText={setName} placeholder="Dein Name" placeholderTextColor={C.textDim} autoCapitalize="words" />
          </View>
          <View style={[layout.fieldWrap, layout.fieldBorderTop, { borderTopColor: C.borderSubtle }]}>
            <Text style={[layout.fieldLabel, { color: C.textSecondary }]}>E-MAIL</Text>
            <TextInput style={[layout.input, { color: C.textPrimary }]} value={email} onChangeText={setEmail} placeholder="deine@email.de" placeholderTextColor={C.textDim} keyboardType="email-address" autoCapitalize="none" />
          </View>
        </View>

        <View style={[layout.infoBox, { backgroundColor: C.accentMuted, borderColor: 'rgba(98,89,232,0.2)' }]}>
          <Text style={[layout.infoText, { color: C.textSecondary }]}>
            Änderungen werden lokal gespeichert. Supabase-Synchronisation folgt in Kürze.
          </Text>
        </View>

        <Pressable style={({ pressed }) => [layout.btn, { backgroundColor: C.accent }, pressed && { opacity: 0.85 }]} onPress={handleSave}>
          <Text style={[layout.btnText, { color: C.textOnAccent }]}>Speichern</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const layout = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: S.screenPad, paddingTop: S.xl, paddingBottom: S.section, gap: S.sm },
  avatarSection: { alignItems: 'center', gap: S.sm, paddingVertical: S.xl },
  avatar: { width: 88, height: 88, borderRadius: 44, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontSize: 32, fontWeight: '700', letterSpacing: -0.5 },
  avatarChange: { fontSize: 14, fontWeight: '600' },
  sectionLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1.2, marginTop: S.sm, paddingHorizontal: S.xs },
  card: { borderRadius: R.md, borderWidth: 1, overflow: 'hidden' },
  fieldWrap: { paddingHorizontal: S.base, paddingVertical: S.md, gap: S.xs },
  fieldBorderTop: { borderTopWidth: 1 },
  fieldLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1.2 },
  input: { fontSize: 15, paddingVertical: S.xs },
  infoBox: { borderRadius: R.sm, padding: S.base, borderWidth: 1, marginTop: S.sm },
  infoText: { fontSize: 12, lineHeight: 18 },
  btn: { borderRadius: R.md, paddingVertical: S.base, alignItems: 'center', marginTop: S.md, minHeight: 50, justifyContent: 'center' },
  btnText: { fontSize: 15, fontWeight: '700' },
});
