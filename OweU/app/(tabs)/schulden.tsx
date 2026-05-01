import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { S, R } from '@/constants/theme';
import { useColors } from '@/store/theme-context';
import { useApp, type Schuld } from '@/store/app-context';
import { StatusBadge } from '@/components/ui/status-badge';
import { EntrySheet } from '@/components/ui/entry-sheet';

// MARK: - Helpers

function fmt(n: number): string {
  return `${Math.abs(n).toFixed(2).replace('.', ',')} €`;
}

function fmtPaidAt(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const hour = d.getHours().toString().padStart(2, '0');
  const min = d.getMinutes().toString().padStart(2, '0');
  return `${day}.${month}. ${hour}:${min}`;
}

const expandEase = Easing.bezier(0.4, 0, 0.2, 1);

// MARK: - Group types & helpers

type OpenGroup = { person: string; items: Schuld[]; total: number };
type PaidGroup = { key: string; person: string; items: Schuld[]; total: number; bezahltAm: string };

function groupOpenByPerson(items: Schuld[]): OpenGroup[] {
  const map = new Map<string, Schuld[]>();
  for (const s of items) {
    const arr = map.get(s.person) ?? [];
    arr.push(s);
    map.set(s.person, arr);
  }
  return Array.from(map.values()).map(items => ({
    person: items[0].person,
    items,
    total: items.reduce((sum, i) => sum + i.betrag, 0),
  }));
}

function groupPaidByMinute(items: Schuld[]): PaidGroup[] {
  const map = new Map<string, Schuld[]>();
  for (const s of items) {
    const minuteKey = s.bezahltAm ? s.bezahltAm.slice(0, 16) : `solo_${s.id}`;
    const key = `${s.person}_${minuteKey}`;
    const arr = map.get(key) ?? [];
    arr.push(s);
    map.set(key, arr);
  }
  return Array.from(map.entries())
    .sort(([, a], [, b]) => (b[0].bezahltAm ?? '').localeCompare(a[0].bezahltAm ?? ''))
    .map(([key, items]) => ({
      key,
      person: items[0].person,
      items,
      total: items.reduce((sum, i) => sum + i.betrag, 0),
      bezahltAm: items[0].bezahltAm ?? items[0].datum,
    }));
}

// MARK: - DebtCard

function DebtCard({ item, index, onToggle }: { item: Schuld; index: number; onToggle: () => void }) {
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

  const paidLabel = item.bezahltAm ? `Bezahlt: ${fmtPaidAt(item.bezahltAm)}` : item.datum;

  return (
    <Animated.View style={[layout.card, item.bezahlt && layout.cardSettled, { backgroundColor: C.surface, borderColor: C.border, borderLeftColor: item.bezahlt ? C.settled : C.negative }, anim]}>
      <View style={layout.cardTop}>
        <View style={layout.cardInfo}>
          <Text style={[layout.cardPerson, { color: item.bezahlt ? C.textDim : C.textPrimary }]}>{item.person}</Text>
          {item.beschreibung ? <Text style={[layout.cardDesc, { color: C.textSecondary }]}>{item.beschreibung}</Text> : null}
          <Text style={[layout.cardDate, { color: C.textDim }]}>{item.bezahlt ? paidLabel : item.datum}</Text>
        </View>
        <View style={layout.cardMeta}>
          <Text style={[layout.cardAmount, { color: item.bezahlt ? C.textDim : C.negative }]}>{fmt(item.betrag)}</Text>
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

// MARK: - GroupedDebtCard (open)

function GroupedDebtCard({ group, index, onToggleOne, onToggleAll }: {
  group: OpenGroup; index: number; onToggleOne: (id: string) => void; onToggleAll: () => void;
}) {
  const C = useColors();
  const [expanded, setExpanded] = useState(false);
  const [naturalHeight, setNaturalHeight] = useState(0);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);
  const expandAnim = useSharedValue(0);
  const chevronAnim = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(index * 60, withSpring(1, { stiffness: 120, damping: 20 }));
    translateY.value = withDelay(index * 60, withSpring(0, { stiffness: 120, damping: 20 }));
  }, []);

  useEffect(() => {
    if (expanded) {
      expandAnim.value = withTiming(naturalHeight, { duration: 220, easing: expandEase });
    }
  }, [naturalHeight, expanded]);

  const enterAnim = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const bodyStyle = useAnimatedStyle(() => ({
    height: Math.max(0, expandAnim.value),
    overflow: 'hidden' as const,
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(chevronAnim.value, [0, 1], [0, 180])}deg` }],
  }));

  function toggle() {
    const next = !expanded;
    setExpanded(next);
    expandAnim.value = withTiming(next ? naturalHeight : 0, { duration: 220, easing: expandEase });
    chevronAnim.value = withTiming(next ? 1 : 0, { duration: 180, easing: expandEase });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  const subItems = group.items.map(item => (
    <View key={item.id} style={[sub.item, { borderTopColor: C.borderSubtle }]}>
      <View style={sub.row}>
        <View style={[sub.dot, { backgroundColor: C.negative }]} />
        <View style={sub.info}>
          <Text style={[sub.desc, { color: item.beschreibung ? C.textPrimary : C.textDim }]}>
            {item.beschreibung || 'Kein Grund angegeben'}
          </Text>
          <Text style={[sub.date, { color: C.textDim }]}>{item.datum}</Text>
        </View>
        <Text style={[sub.amount, { color: C.negative }]}>{fmt(item.betrag)}</Text>
        <Pressable
          style={[sub.check, { borderColor: C.border }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onToggleOne(item.id); }}
          hitSlop={8}
        >
          <Text style={[sub.checkIcon, { color: C.accent }]}>✓</Text>
        </Pressable>
      </View>
    </View>
  ));

  return (
    <Animated.View style={[layout.card, { backgroundColor: C.surface, borderColor: C.border, borderLeftColor: C.negative }, enterAnim]}>
      <View style={layout.cardTop}>
        <View style={layout.cardInfo}>
          <Text style={[layout.cardPerson, { color: C.textPrimary }]}>{group.person}</Text>
          <Text style={[layout.cardDesc, { color: C.textSecondary }]}>{group.items.length} offene Einträge</Text>
        </View>
        <View style={layout.cardMeta}>
          <Text style={[layout.cardAmount, { color: C.negative }]}>{fmt(group.total)}</Text>
          <StatusBadge type="schuld" settled={false} />
        </View>
      </View>

      <View>
        <View
          pointerEvents="none"
          style={{ position: 'absolute', opacity: 0, left: 0, right: 0 }}
          onLayout={e => { const h = e.nativeEvent.layout.height; if (h > 0) setNaturalHeight(h); }}
        >
          {subItems}
        </View>
        <Animated.View style={bodyStyle}>{subItems}</Animated.View>
      </View>

      <View style={[layout.groupFooter, { borderTopColor: C.borderSubtle }]}>
        <Pressable onPress={toggle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <View style={layout.expandBtnContent}>
            <Animated.View style={chevronStyle}>
              <Text style={[layout.chevron, { color: C.textSecondary }]}>▼</Text>
            </Animated.View>
            <Text style={[layout.expandBtnText, { color: C.textSecondary }]}>
              {expanded ? 'Einklappen' : 'Ausklappen'}
            </Text>
          </View>
        </Pressable>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onToggleAll(); }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[layout.allPaidText, { color: C.accent }]}>Alle bezahlen</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

// MARK: - PaidGroupCard (settled, same-minute)

function PaidGroupCard({ group, index, onToggleAll }: {
  group: PaidGroup; index: number; onToggleAll: () => void;
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

  return (
    <Animated.View style={[layout.card, layout.cardSettled, { backgroundColor: C.surface, borderColor: C.border, borderLeftColor: C.settled }, anim]}>
      <View style={layout.cardTop}>
        <View style={layout.cardInfo}>
          <Text style={[layout.cardPerson, { color: C.textDim }]}>{group.person}</Text>
          <Text style={[layout.cardDesc, { color: C.textSecondary }]}>
            {group.items.length} Einträge · Bezahlt {fmtPaidAt(group.bezahltAm)}
          </Text>
        </View>
        <View style={layout.cardMeta}>
          <Text style={[layout.cardAmount, { color: C.textDim }]}>{fmt(group.total)}</Text>
          <StatusBadge type="schuld" settled={true} />
        </View>
      </View>

      {group.items.map(item => (
        <View key={item.id} style={[sub.item, { borderTopColor: C.borderSubtle }]}>
          <View style={sub.row}>
            <View style={[sub.dot, { backgroundColor: C.settled }]} />
            <View style={sub.info}>
              <Text style={[sub.desc, { color: C.textDim }]}>{item.beschreibung || 'Kein Grund angegeben'}</Text>
              <Text style={[sub.date, { color: C.textDim }]}>{item.datum}</Text>
            </View>
            <Text style={[sub.amount, { color: C.textDim }]}>{fmt(item.betrag)}</Text>
          </View>
        </View>
      ))}

      <Pressable
        style={[layout.toggleRow, { borderTopColor: C.borderSubtle }]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onToggleAll(); }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={[layout.toggleText, { color: C.textDim }]}>Alle als offen markieren</Text>
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

  const open = schulden.filter(s => !s.bezahlt);
  const settled = schulden.filter(s => s.bezahlt);
  const openTotal = open.reduce((sum, s) => sum + s.betrag, 0);
  const openGroups = groupOpenByPerson(open);
  const paidGroups = groupPaidByMinute(settled);

  function toggleAllForPerson(person: string) {
    open.filter(s => s.person === person).forEach(s => toggleBezahlt(s.id));
  }

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
          <Pressable
            style={[layout.addBtn, { backgroundColor: C.accent }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowSheet(true); }}
          >
            <Text style={[layout.addBtnText, { color: C.textOnAccent }]}>+ Neu</Text>
          </Pressable>
        </View>

        {schulden.length === 0 ? (
          <Text style={[layout.empty, { color: C.textDim }]}>Alles beglichen — keine offenen Schulden.</Text>
        ) : (
          <>
            {openGroups.map((group, i) =>
              group.items.length === 1
                ? <DebtCard key={group.items[0].id} item={group.items[0]} index={i} onToggle={() => toggleBezahlt(group.items[0].id)} />
                : <GroupedDebtCard key={group.person + '-group'} group={group} index={i} onToggleOne={toggleBezahlt} onToggleAll={() => toggleAllForPerson(group.person)} />
            )}
            {settled.length > 0 && open.length > 0 && (
              <Text style={[layout.dividerLabel, { color: C.textDim }]}>BEZAHLT</Text>
            )}
            {paidGroups.map((group, i) =>
              group.items.length === 1
                ? <DebtCard key={group.items[0].id} item={group.items[0]} index={openGroups.length + i} onToggle={() => toggleBezahlt(group.items[0].id)} />
                : <PaidGroupCard key={group.key} group={group} index={openGroups.length + i} onToggleAll={() => group.items.forEach(s => toggleBezahlt(s.id))} />
            )}
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
  empty: { fontSize: 14, textAlign: 'center', paddingVertical: S.section },

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

  groupFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, paddingVertical: S.md, paddingHorizontal: S.base },
  expandBtnContent: { flexDirection: 'row', alignItems: 'center', gap: S.xs },
  chevron: { fontSize: 11 },
  expandBtnText: { fontSize: 13, fontWeight: '600' },
  allPaidText: { fontSize: 13, fontWeight: '600' },
});

const sub = StyleSheet.create({
  item: { borderTopWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: S.base, paddingVertical: S.sm, gap: S.sm },
  dot: { width: 6, height: 6, borderRadius: 3, flexShrink: 0 },
  info: { flex: 1, gap: 2 },
  desc: { fontSize: 14, fontWeight: '500' },
  date: { fontSize: 11 },
  amount: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  check: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  checkIcon: { fontSize: 13, fontWeight: '700' },
});
