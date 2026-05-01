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
import { useApp, type Forderung } from '@/store/app-context';
import { StatusBadge } from '@/components/ui/status-badge';
import { EntrySheet } from '@/components/ui/entry-sheet';

// MARK: - Helpers

function fmt(n: number): string {
  return `${Math.abs(n).toFixed(2).replace('.', ',')} €`;
}

function fmtReceivedAt(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const hour = d.getHours().toString().padStart(2, '0');
  const min = d.getMinutes().toString().padStart(2, '0');
  return `${day}.${month}. ${hour}:${min}`;
}

const expandEase = Easing.bezier(0.4, 0, 0.2, 1);

// MARK: - Group types & helpers

type OpenGroup = { person: string; items: Forderung[]; total: number };
type ReceivedGroup = { key: string; person: string; items: Forderung[]; total: number; erhaltenAm: string };

function groupOpenByPerson(items: Forderung[]): OpenGroup[] {
  const map = new Map<string, Forderung[]>();
  for (const f of items) {
    const arr = map.get(f.person) ?? [];
    arr.push(f);
    map.set(f.person, arr);
  }
  return Array.from(map.values()).map(items => ({
    person: items[0].person,
    items,
    total: items.reduce((sum, i) => sum + i.betrag, 0),
  }));
}

function groupReceivedByMinute(items: Forderung[]): ReceivedGroup[] {
  const map = new Map<string, Forderung[]>();
  for (const f of items) {
    const minuteKey = f.erhaltenAm ? f.erhaltenAm.slice(0, 16) : `solo_${f.id}`;
    const key = `${f.person}_${minuteKey}`;
    const arr = map.get(key) ?? [];
    arr.push(f);
    map.set(key, arr);
  }
  return Array.from(map.entries())
    .sort(([, a], [, b]) => (b[0].erhaltenAm ?? '').localeCompare(a[0].erhaltenAm ?? ''))
    .map(([key, items]) => ({
      key,
      person: items[0].person,
      items,
      total: items.reduce((sum, i) => sum + i.betrag, 0),
      erhaltenAm: items[0].erhaltenAm ?? items[0].datum,
    }));
}

// MARK: - ClaimCard

function ClaimCard({ item, index, onToggle }: { item: Forderung; index: number; onToggle: () => void }) {
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

  const receivedLabel = item.erhaltenAm ? `Erhalten: ${fmtReceivedAt(item.erhaltenAm)}` : item.datum;

  return (
    <Animated.View style={[layout.card, item.erhalten && layout.cardSettled, { backgroundColor: C.surface, borderColor: C.border, borderLeftColor: item.erhalten ? C.settled : C.positive }, anim]}>
      <View style={layout.cardTop}>
        <View style={layout.cardInfo}>
          <Text style={[layout.cardPerson, { color: item.erhalten ? C.textDim : C.textPrimary }]}>{item.person}</Text>
          {item.beschreibung ? <Text style={[layout.cardDesc, { color: C.textSecondary }]}>{item.beschreibung}</Text> : null}
          <Text style={[layout.cardDate, { color: C.textDim }]}>{item.erhalten ? receivedLabel : item.datum}</Text>
        </View>
        <View style={layout.cardMeta}>
          <Text style={[layout.cardAmount, { color: item.erhalten ? C.textDim : C.positive }]}>+{fmt(item.betrag)}</Text>
          <StatusBadge type="forderung" settled={item.erhalten} />
        </View>
      </View>
      <Pressable
        style={[layout.toggleRow, { borderTopColor: C.borderSubtle }]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onToggle(); }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={[layout.toggleText, { color: item.erhalten ? C.textDim : C.accent }]}>
          {item.erhalten ? 'Als ausstehend markieren' : 'Als erhalten markieren'}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// MARK: - GroupedClaimCard (open)

function GroupedClaimCard({ group, index, onToggleOne, onToggleAll }: {
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
        <View style={[sub.dot, { backgroundColor: C.positive }]} />
        <View style={sub.info}>
          <Text style={[sub.desc, { color: item.beschreibung ? C.textPrimary : C.textDim }]}>
            {item.beschreibung || 'Kein Grund angegeben'}
          </Text>
          <Text style={[sub.date, { color: C.textDim }]}>{item.datum}</Text>
        </View>
        <Text style={[sub.amount, { color: C.positive }]}>+{fmt(item.betrag)}</Text>
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
    <Animated.View style={[layout.card, { backgroundColor: C.surface, borderColor: C.border, borderLeftColor: C.positive }, enterAnim]}>
      <View style={layout.cardTop}>
        <View style={layout.cardInfo}>
          <Text style={[layout.cardPerson, { color: C.textPrimary }]}>{group.person}</Text>
          <Text style={[layout.cardDesc, { color: C.textSecondary }]}>{group.items.length} offene Einträge</Text>
        </View>
        <View style={layout.cardMeta}>
          <Text style={[layout.cardAmount, { color: C.positive }]}>+{fmt(group.total)}</Text>
          <StatusBadge type="forderung" settled={false} />
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
          <Text style={[layout.allPaidText, { color: C.accent }]}>Alle erhalten</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

// MARK: - ReceivedGroupCard (settled, same-minute)

function ReceivedGroupCard({ group, index, onToggleAll }: {
  group: ReceivedGroup; index: number; onToggleAll: () => void;
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
            {group.items.length} Einträge · Erhalten {fmtReceivedAt(group.erhaltenAm)}
          </Text>
        </View>
        <View style={layout.cardMeta}>
          <Text style={[layout.cardAmount, { color: C.textDim }]}>+{fmt(group.total)}</Text>
          <StatusBadge type="forderung" settled={true} />
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
            <Text style={[sub.amount, { color: C.textDim }]}>+{fmt(item.betrag)}</Text>
          </View>
        </View>
      ))}

      <Pressable
        style={[layout.toggleRow, { borderTopColor: C.borderSubtle }]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onToggleAll(); }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={[layout.toggleText, { color: C.textDim }]}>Alle als ausstehend markieren</Text>
      </Pressable>
    </Animated.View>
  );
}

// MARK: - Screen

export default function ForderungenScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const { forderungen, addForderung, toggleErhalten } = useApp();
  const [showSheet, setShowSheet] = useState(false);

  const open = forderungen.filter(f => !f.erhalten);
  const received = forderungen.filter(f => f.erhalten);
  const openTotal = open.reduce((sum, f) => sum + f.betrag, 0);
  const openGroups = groupOpenByPerson(open);
  const receivedGroups = groupReceivedByMinute(received);

  function toggleAllForPerson(person: string) {
    open.filter(f => f.person === person).forEach(f => toggleErhalten(f.id));
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
            <Text style={[layout.screenTitle, { color: C.textPrimary }]}>Forderungen</Text>
            <Text style={[layout.screenSub, { color: C.textSecondary }]}>
              Du bekommst{' '}
              <Text style={{ color: C.positive }}>{fmt(openTotal)}</Text>
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

        {forderungen.length === 0 ? (
          <Text style={[layout.empty, { color: C.textDim }]}>Keine offenen Forderungen.</Text>
        ) : (
          <>
            {openGroups.map((group, i) =>
              group.items.length === 1
                ? <ClaimCard key={group.items[0].id} item={group.items[0]} index={i} onToggle={() => toggleErhalten(group.items[0].id)} />
                : <GroupedClaimCard key={group.person + '-group'} group={group} index={i} onToggleOne={toggleErhalten} onToggleAll={() => toggleAllForPerson(group.person)} />
            )}
            {received.length > 0 && open.length > 0 && (
              <Text style={[layout.dividerLabel, { color: C.textDim }]}>ERHALTEN</Text>
            )}
            {receivedGroups.map((group, i) =>
              group.items.length === 1
                ? <ClaimCard key={group.items[0].id} item={group.items[0]} index={openGroups.length + i} onToggle={() => toggleErhalten(group.items[0].id)} />
                : <ReceivedGroupCard key={group.key} group={group} index={openGroups.length + i} onToggleAll={() => group.items.forEach(f => toggleErhalten(f.id))} />
            )}
          </>
        )}
      </ScrollView>

      <EntrySheet
        visible={showSheet}
        mode="forderung"
        onClose={() => setShowSheet(false)}
        onSave={data => addForderung({ ...data, erhalten: false })}
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
