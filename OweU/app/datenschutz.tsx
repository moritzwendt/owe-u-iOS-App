import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useColors } from '@/store/theme-context';
import { S, R } from '@/constants/theme';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const C = useColors();
  return (
    <View style={layout.section}>
      <Text style={[layout.sectionTitle, { color: C.textPrimary }]}>{title}</Text>
      <View style={[layout.sectionCard, { backgroundColor: C.surface, borderColor: C.border }]}>{children}</View>
    </View>
  );
}

function Para({ children }: { children: string }) {
  const C = useColors();
  return <Text style={[layout.para, { color: C.textSecondary }]}>{children}</Text>;
}

export default function DatenschutzScreen() {
  const C = useColors();
  return (
    <>
      <Stack.Screen options={{ title: 'Datenschutz' }} />
      <ScrollView style={[layout.scroll, { backgroundColor: C.bg }]} contentContainerStyle={layout.content}>
        <Text style={[layout.updated, { color: C.textDim }]}>Zuletzt aktualisiert: April 2025</Text>
        <Section title="1. Verantwortlicher">
          <Para>Verantwortlicher für die Verarbeitung personenbezogener Daten ist das OweYou-Team.</Para>
          <Para>Kontakt: datenschutz@oweyou.app</Para>
        </Section>
        <Section title="2. Datenerhebung">
          <Para>OweYou speichert ausschließlich Daten, die du selbst eingibst: Namen, Beträge und optionale Beschreibungen. Diese werden lokal auf deinem Gerät gespeichert.</Para>
          <Para>Mit Supabase-Integration werden Daten verschlüsselt in der Cloud synchronisiert.</Para>
        </Section>
        <Section title="3. Verwendung der Daten">
          <Para>Deine Daten werden ausschließlich zur Darstellung deiner Schulden und Forderungen verwendet. Kein Verkauf, keine Weitergabe zu Werbezwecken.</Para>
        </Section>
        <Section title="4. Datenweitergabe">
          <Para>Wir geben deine Daten nicht an Dritte weiter, außer:</Para>
          <Para>• Supabase (Datenbankinfrastruktur, Serverstandort EU)</Para>
          <Para>• Apple (App Store) gemäß Apple-Datenschutzrichtlinie</Para>
        </Section>
        <Section title="5. Deine Rechte">
          <Para>Du hast das Recht auf Auskunft, Berichtigung, Löschung und Übertragbarkeit deiner Daten. Konto und Daten löschbar über Profil → Konto löschen.</Para>
          <Para>Anfragen: datenschutz@oweyou.app</Para>
        </Section>
        <Section title="6. Datensicherheit">
          <Para>Verbindungen zur Supabase-Infrastruktur sind TLS-verschlüsselt. Passwörter werden ausschließlich als bcrypt-Hash gespeichert.</Para>
        </Section>
        <Section title="7. Kontakt">
          <Para>Bei Fragen zum Datenschutz: datenschutz@oweyou.app</Para>
        </Section>
      </ScrollView>
    </>
  );
}

const layout = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: S.screenPad, paddingTop: S.xl, paddingBottom: S.section, gap: S.md },
  updated: { fontSize: 12, marginBottom: S.sm },
  section: { gap: S.sm },
  sectionTitle: { fontSize: 14, fontWeight: '700', paddingHorizontal: S.xs },
  sectionCard: { borderRadius: R.md, borderWidth: 1, padding: S.base, gap: S.sm },
  para: { fontSize: 14, lineHeight: 22 },
});
