import { StyleSheet } from 'react-native';
import { S, R } from '@/constants/theme';

export const cardLayout = StyleSheet.create({
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

export const cardSub = StyleSheet.create({
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
