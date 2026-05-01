import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { S, R } from '@/constants/theme';
import { useColors } from '@/store/theme-context';
import { useApp, type Schuld } from '@/store/app-context';
import { StatusBadge } from '@/components/ui/status-badge';
import { EntrySheet } from '@/components/ui/entry-sheet';

function fmt(n: number): string {
  return `${Math.abs(n).toFixed(2).replace('.', ',')} €`;
}

// MARK: - Component

function DebtCard({
  item,
  index,
  onToggle,
}: {
  item: Schuld;
  index: number;
  onToggle: () => void;
}) {
  const C = useColors();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);
  useEffect(() => {
    opacity.value = withDelay(index * 60, withSpring(1, { stiffness: 120, damping: 20 }));
    translateY.value = withDelay(index * 60, withSpring(0, { stiffness: 120, damping: 20 }));
  }, []);
  const anim = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const accentBorder = item.bezahlt ? C.settled : C.negative;

  return (
    <Animated.View
      style={[
        layout.card,
        item.bezahlt && layout.cardSettled,
        { backgroundColor: C.surface, borderColor: C.border, borderLeftColor: accentBorder },
        anim,
      ]}
    >
      <View style={layout.cardTop}>
        <View style={layout.cardInfo}>
          <Text style={[layout.cardPerson, { color: item.bezahlt ? C.textDim : C.textPrimary }]}>
            {item.person}
          </Text>
          {item.beschreibung ? (
            <Text style={[layout.cardDesc, { color: C.textSecondary }]}>{item.beschreibung}</Text>
          ) : null}
          <Text style={[layout.cardDate, { color: C.textDim }]}>{item.datum}</Text>
        </View>
        <View style={layout.cardMeta}>
          <Text style={[layout.cardAmount, { color: item.bezahlt ? C.textDim : C.negative }]}>
            {fmt(item.betrag)}
          </Text>
          <StatusBadge type="schuld" settled={item.bezahlt} />
        </View>
      </View>

      <Pressable
        style={[layout.toggleRow, { borderTopColor: C.borderSubtle }]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onToggle(); }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={[layout.toggleText, { color: item.bezahlt ? C.textDim : C.accent }]}>
          {item.bezahlt ? 'Als offen markieren' : 'Als bezahlt markieren'}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// MARK: - Screen

export default function SchuldenScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const { schulden, addSchuld, toggleBezahlt } = useApp();
  const [showSheet, setShowSheet] = useState(false);

  const openTotal = schulden.filter(s => !s.bezahlt).reduce((sum, s) => sum + s.betrag, 0);
  const open = schulden.filter(s => !s.bezahlt);
  const settled = schulden.filter(s => s.bezahlt);

  return (
    <View style={[layout.safe, { backgroundColor: C.bg }]}>
      <ScrollView
        style={layout.scroll}
        contentContainerStyle={[layout.content, { paddingTop: insets.top + S.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={layout.header}>
          <View style={layout.headerText}>
            <Text style={[layout.screenTitle, { color: C.textPrimary }]}>Schulden</Text>
            <Text style={[layout.screenSub, { color: C.textSecondary }]}>
              Du schuldest{' '}
              <Text style={{ color: C.negative }}>{fmt(openTotal)}</Text>
              {' '}insgesamt
            </Text>
          </View>
          <Pressable style={[layout.addBtn, { backgroundColor: C.accent }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowSheet(true); }}>
            <Text style={[layout.addBtnText, { color: C.textOnAccent }]}>+ Neu</Text>
          </Pressable>
        </View>

        {schulden.length === 0 ? (
          <Text style={[layout.empty, { color: C.textDim }]}>Alles beglichen — keine offenen Schulden.</Text>
        ) : (
          <>
            {open.map((s, i) => (
              <DebtCard key={s.id} item={s} index={i} onToggle={() => toggleBezahlt(s.id)} />
            ))}
            {settled.length > 0 && open.length > 0 && (
              <Text style={[layout.dividerLabel, { color: C.textDim }]}>BEZAHLT</Text>
            )}
            {settled.map((s, i) => (
              <DebtCard key={s.id} item={s} index={open.length + i} onToggle={() => toggleBezahlt(s.id)} />
            ))}
          </>
        )}
      </ScrollView>

      <EntrySheet
        visible={showSheet}
        mode="schuld"
        onClose={() => setShowSheet(false)}
        onSave={data => addSchuld({ ...data, bezahlt: false })}
      />
    </View>
  );
}

// MARK: - Styles

const layout = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: S.screenPad, paddingBottom: S.section, gap: S.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: S.sm },
  headerText: { flex: 1, gap: 3 },
  screenTitle: { fontSize: 30, fontWeight: '700', letterSpacing: -0.5 },
  screenSub: { fontSize: 13 },
  addBtn: { paddingHorizontal: S.base, paddingVertical: S.sm, borderRadius: R.sm, minHeight: 44, justifyContent: 'center', marginTop: 2 },
  addBtnText: { fontSize: 13, fontWeight: '700' },
  dividerLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1.2, marginTop: S.sm, marginBottom: -S.xs, paddingHorizontal: S.xs },
  card: { borderRadius: R.md, borderWidth: 1, borderLeftWidth: 3, overflow: 'hidden' },
  cardSettled: { opacity: 0.65 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: S.base, gap: S.md },
  cardInfo: { flex: 1, gap: 3 },
  cardPerson: { fontSize: 16, fontWeight: '600' },
  cardDesc: { fontSize: 13 },
  cardDate: { fontSize: 11, marginTop: 2 },
  cardMeta: { alignItems: 'flex-end', gap: 6 },
  cardAmount: { fontSize: 17, fontWeight: '700', fontVariant: ['tabular-nums'], letterSpacing: -0.3 },
  toggleRow: { borderTopWidth: 1, paddingVertical: S.md, paddingHorizontal: S.base, alignItems: 'center' },
  toggleText: { fontSize: 13, fontWeight: '600' },
  empty: { fontSize: 14, textAlign: 'center', paddingVertical: S.section },
});
