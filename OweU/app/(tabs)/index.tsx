import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';

import { S, R } from '@/constants/theme';
import { useColors } from '@/store/theme-context';
import { useApp } from '@/store/app-context';

// MARK: - Helpers

function fmt(n: number): string {
  return `${Math.abs(n).toFixed(2).replace('.', ',')} €`;
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return 'Heute';
  if (diff === 1) return 'Gestern';
  if (diff < 7) return `Vor ${diff} Tagen`;
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

function useFadeSlide(delay: number) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(18);
  useEffect(() => {
    opacity.value = withDelay(delay, withSpring(1, { stiffness: 120, damping: 20 }));
    translateY.value = withDelay(delay, withSpring(0, { stiffness: 120, damping: 20 }));
  }, []);
  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
}

// MARK: - Components

function NettoCard({ netto }: { netto: number }) {
  const C = useColors();
  const anim = useFadeSlide(80);

  const isPositive = netto > 0;
  const isNeutral = netto === 0;
  const accentColor = isPositive ? C.positive : isNeutral ? C.settled : C.negative;
  const label = isPositive
    ? `Du bist ${fmt(netto)} im Plus`
    : isNeutral
    ? 'Alles ausgeglichen'
    : `Du schuldest noch ${fmt(Math.abs(netto))}`;

  return (
    <Animated.View
      style={[
        layout.nettoCard,
        { backgroundColor: C.surface, borderColor: C.border, borderLeftColor: accentColor },
        anim,
      ]}
    >
      <Text style={[layout.nettoEyebrow, { color: C.textSecondary }]}>AKTUELLER STAND</Text>
      <Text style={[layout.nettoAmount, { color: accentColor }]}>
        {isPositive ? '+' : isNeutral ? '' : '–'}{fmt(netto)}
      </Text>
      <Text style={[layout.nettoLabel, { color: C.textSecondary }]}>{label}</Text>
    </Animated.View>
  );
}

function SummaryChip({
  label,
  value,
  color,
  delay,
}: {
  label: string;
  value: number;
  color: string;
  delay: number;
}) {
  const C = useColors();
  const anim = useFadeSlide(delay);
  return (
    <Animated.View style={[layout.chip, { backgroundColor: C.surface, borderColor: C.border }, anim]}>
      <Text style={[layout.chipValue, { color }]}>{fmt(value)}</Text>
      <Text style={[layout.chipLabel, { color: C.textSecondary }]}>{label}</Text>
    </Animated.View>
  );
}

function TransactionRow({
  person,
  beschreibung,
  betrag,
  type,
  datum,
}: {
  person: string;
  beschreibung: string;
  betrag: number;
  type: 'schuld' | 'forderung';
  datum: string;
}) {
  const C = useColors();
  const isForderung = type === 'forderung';
  const dotColor = isForderung ? C.positive : C.negative;
  const amountColor = isForderung ? C.positive : C.negative;

  return (
    <View style={[layout.txRow, { backgroundColor: C.surface, borderColor: C.border }]}>
      <View style={[layout.txDot, { backgroundColor: dotColor }]} />
      <View style={layout.txMid}>
        <Text style={[layout.txPerson, { color: C.textPrimary }]}>{person}</Text>
        {beschreibung ? <Text style={[layout.txDesc, { color: C.textSecondary }]}>{beschreibung}</Text> : null}
      </View>
      <View style={layout.txRight}>
        <Text style={[layout.txAmount, { color: amountColor }]}>
          {isForderung ? '+' : '–'}{fmt(betrag)}
        </Text>
        <Text style={[layout.txDate, { color: C.textDim }]}>{fmtDate(datum)}</Text>
      </View>
    </View>
  );
}

// MARK: - Screen

export default function UebersichtScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const { schulden, forderungen } = useApp();

  const openSchulden = schulden.filter(s => !s.bezahlt).reduce((sum, s) => sum + s.betrag, 0);
  const openForderungen = forderungen.filter(f => !f.erhalten).reduce((sum, f) => sum + f.betrag, 0);
  const netto = openForderungen - openSchulden;

  const activity = [
    ...schulden.map(s => ({ ...s, type: 'schuld' as const })),
    ...forderungen.map(f => ({ ...f, type: 'forderung' as const })),
  ]
    .sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime())
    .slice(0, 5);

  const sectionAnim = useFadeSlide(360);

  return (
    <View style={[layout.safe, { backgroundColor: C.bg }]}>
      <ScrollView
        style={layout.scroll}
        contentContainerStyle={[layout.content, { paddingTop: insets.top + S.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[layout.screenTitle, { color: C.textPrimary }]}>OweYou</Text>

        <NettoCard netto={netto} />

        <View style={layout.chipsRow}>
          <SummaryChip label="SCHULDEN" value={openSchulden} color={C.negative} delay={200} />
          <SummaryChip label="FORDERUNGEN" value={openForderungen} color={C.positive} delay={270} />
          <SummaryChip label="NETTO" value={Math.abs(netto)} color={netto >= 0 ? C.positive : C.negative} delay={340} />
        </View>

        <Animated.View style={[layout.section, sectionAnim]}>
          <Text style={[layout.sectionTitle, { color: C.textPrimary }]}>Letzte Aktivitäten</Text>
          <View style={layout.txList}>
            {activity.length === 0 ? (
              <Text style={[layout.empty, { color: C.textDim }]}>Noch keine Einträge</Text>
            ) : (
              activity.map(item => (
                <TransactionRow
                  key={`${item.type}-${item.id}`}
                  person={item.person}
                  beschreibung={item.beschreibung}
                  betrag={item.betrag}
                  type={item.type}
                  datum={item.datum}
                />
              ))
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// MARK: - Styles

const layout = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: S.screenPad, paddingBottom: S.section, gap: S.base },
  screenTitle: { fontSize: 30, fontWeight: '700', letterSpacing: -0.5, marginBottom: S.xs },
  nettoCard: { borderRadius: R.lg, padding: S.xl, borderWidth: 1, borderLeftWidth: 3, gap: S.xs },
  nettoEyebrow: { fontSize: 10, fontWeight: '600', letterSpacing: 1.2 },
  nettoAmount: { fontSize: 48, fontWeight: '700', letterSpacing: -1, lineHeight: 56, fontVariant: ['tabular-nums'] },
  nettoLabel: { fontSize: 14, marginTop: S.xs },
  chipsRow: { flexDirection: 'row', gap: S.sm },
  chip: { flex: 1, borderRadius: R.md, borderWidth: 1, padding: S.base, gap: 4 },
  chipValue: { fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'], letterSpacing: -0.2 },
  chipLabel: { fontSize: 9, fontWeight: '600', letterSpacing: 0.8 },
  section: { gap: S.md, marginTop: S.sm },
  sectionTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.2 },
  txList: { gap: S.sm },
  txRow: { flexDirection: 'row', alignItems: 'center', borderRadius: R.md, borderWidth: 1, padding: S.base, gap: S.md },
  txDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  txMid: { flex: 1, gap: 2 },
  txPerson: { fontSize: 14, fontWeight: '600' },
  txDesc: { fontSize: 12 },
  txRight: { alignItems: 'flex-end', gap: 3 },
  txAmount: { fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
  txDate: { fontSize: 10 },
  empty: { fontSize: 14, textAlign: 'center', paddingVertical: S.xl },
});
