import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { useColors } from '@/store/theme-context';
import { S, R } from '@/constants/theme';

type Kategorie = 'bug' | 'idee' | 'lob' | 'sonstiges';
const KATEGORIEN: { key: Kategorie; label: string; emoji: string }[] = [
  { key: 'bug', label: 'Bug', emoji: '🐛' },
  { key: 'idee', label: 'Idee', emoji: '💡' },
  { key: 'lob', label: 'Lob', emoji: '🙌' },
  { key: 'sonstiges', label: 'Sonstiges', emoji: '💬' },
];

export default function FeedbackScreen() {
  const C = useColors();
  const [kategorie, setKategorie] = useState<Kategorie>('idee');
  const [nachricht, setNachricht] = useState('');

  function handleSend() {
    if (!nachricht.trim()) { Alert.alert('Leere Nachricht', 'Bitte schreib uns etwas!'); return; }
    Alert.alert('Feedback gesendet ✓', 'Vielen Dank! Wir lesen jede Nachricht persönlich.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Feedback' }} />
      <ScrollView
        style={[layout.scroll, { backgroundColor: C.bg }]}
        contentContainerStyle={layout.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[layout.headline, { color: C.textPrimary }]}>Wie können wir{'\n'}OweYou besser machen?</Text>
        <Text style={[layout.sub, { color: C.textSecondary }]}>
          Egal ob Bug, Idee oder Lob — wir lesen jede Nachricht persönlich.
        </Text>

        <Text style={[layout.sectionLabel, { color: C.textSecondary }]}>KATEGORIE</Text>
        <View style={layout.kategorieRow}>
          {KATEGORIEN.map(k => (
            <Pressable
              key={k.key}
              style={[
                layout.kategorieBtn,
                { backgroundColor: C.surface, borderColor: kategorie === k.key ? C.accent : C.border },
                kategorie === k.key && { backgroundColor: C.accentMuted },
              ]}
              onPress={() => setKategorie(k.key)}
            >
              <Text style={layout.kategorieEmoji}>{k.emoji}</Text>
              <Text style={[layout.kategorieLabel, { color: kategorie === k.key ? C.accent : C.textSecondary }]}>
                {k.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[layout.sectionLabel, { color: C.textSecondary }]}>DEINE NACHRICHT</Text>
        <View style={[layout.textAreaCard, { backgroundColor: C.surface, borderColor: C.border }]}>
          <TextInput
            style={[layout.textArea, { color: C.textPrimary }]}
            value={nachricht}
            onChangeText={setNachricht}
            placeholder="Beschreib uns dein Anliegen..."
            placeholderTextColor={C.textDim}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <View style={[layout.infoBox, { backgroundColor: C.accentMuted, borderColor: 'rgba(98,89,232,0.2)' }]}>
          <Text style={[layout.infoText, { color: C.textSecondary }]}>
            Deine Nachricht wird direkt an das OweYou-Team gesendet. Wir antworten in der Regel innerhalb von 48 Stunden.
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [layout.btn, { backgroundColor: C.accent }, pressed && { opacity: 0.85 }]}
          onPress={handleSend}
        >
          <Text style={[layout.btnText, { color: C.textOnAccent }]}>Feedback senden</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const layout = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: S.screenPad, paddingTop: S.xl, paddingBottom: S.section, gap: S.sm },
  headline: { fontSize: 26, fontWeight: '700', letterSpacing: -0.5, lineHeight: 32, marginBottom: S.xs },
  sub: { fontSize: 14, lineHeight: 20, marginBottom: S.md },
  sectionLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1.2, marginTop: S.md, paddingHorizontal: S.xs },
  kategorieRow: { flexDirection: 'row', gap: S.sm },
  kategorieBtn: { flex: 1, borderRadius: R.md, borderWidth: 1, paddingVertical: S.md, alignItems: 'center', gap: S.xs },
  kategorieEmoji: { fontSize: 20 },
  kategorieLabel: { fontSize: 11, fontWeight: '600' },
  textAreaCard: { borderRadius: R.md, borderWidth: 1, padding: S.base, minHeight: 140 },
  textArea: { fontSize: 15, lineHeight: 22, minHeight: 120 },
  infoBox: { borderRadius: R.sm, padding: S.base, borderWidth: 1, marginTop: S.sm },
  infoText: { fontSize: 12, lineHeight: 18 },
  btn: { borderRadius: R.md, paddingVertical: S.base, alignItems: 'center', marginTop: S.md, minHeight: 50, justifyContent: 'center' },
  btnText: { fontSize: 15, fontWeight: '700' },
});
