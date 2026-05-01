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

export default function NutzungsbedingungenScreen() {
  const C = useColors();
  return (
    <>
      <Stack.Screen options={{ title: 'Nutzungsbedingungen' }} />
      <ScrollView style={[layout.scroll, { backgroundColor: C.bg }]} contentContainerStyle={layout.content}>
        <Text style={[layout.updated, { color: C.textDim }]}>Zuletzt aktualisiert: April 2025</Text>
        <Section title="1. Geltungsbereich">
          <Para>Diese Nutzungsbedingungen gelten für die Nutzung der iOS-App OweYou. Mit der Installation stimmst du diesen Bedingungen zu.</Para>
        </Section>
        <Section title="2. Leistungsbeschreibung">
          <Para>OweYou ist eine persönliche Finanztracking-App zur Erfassung von Schulden und Forderungen. Sie dient ausschließlich der persönlichen Buchführung.</Para>
          <Para>OweYou ist kein Zahlungsdienstleister und wickelt keine Zahlungen ab.</Para>
        </Section>
        <Section title="3. Nutzungspflichten">
          <Para>Du verpflichtest dich, die App ausschließlich für legale Zwecke zu nutzen. Missbräuchliche Verwendung ist untersagt.</Para>
        </Section>
        <Section title="4. Datensicherung">
          <Para>Ohne Supabase-Synchronisation werden Daten nur lokal gespeichert. Das OweYou-Team übernimmt keine Haftung für Datenverlust.</Para>
          <Para>Wir empfehlen regelmäßige Exporte über die Export-Funktion.</Para>
        </Section>
        <Section title="5. Haftungsausschluss">
          <Para>OweYou stellt keine rechtlich bindende Schuldanerkennung dar. Die App dient nur der persönlichen Übersicht.</Para>
        </Section>
        <Section title="6. Verfügbarkeit">
          <Para>Wir bemühen uns um hohe Verfügbarkeit, übernehmen aber keine Garantie für ununterbrochenen Betrieb.</Para>
        </Section>
        <Section title="7. Änderungen">
          <Para>Wir behalten uns vor, diese Bedingungen jederzeit zu ändern. Änderungen werden in der App kommuniziert.</Para>
        </Section>
        <Section title="8. Kontakt">
          <Para>Bei Fragen: kontakt@oweyou.app</Para>
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
