import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '@/store/theme-context';
import { S, R } from '@/constants/theme';

interface StatusBadgeProps {
  type: 'schuld' | 'forderung';
  settled: boolean;
}

export function StatusBadge({ type, settled }: StatusBadgeProps) {
  const C = useColors();

  if (settled) {
    return (
      <View style={[layout.badge, { backgroundColor: 'rgba(142,142,147,0.15)', borderColor: C.border }]}>
        <Text style={[layout.label, { color: C.textSecondary }]}>
          {type === 'schuld' ? 'BEZAHLT' : 'ERHALTEN'}
        </Text>
      </View>
    );
  }

  const isSchuld = type === 'schuld';
  const bg = isSchuld ? C.negativeMuted : C.positiveMuted;
  const border = isSchuld ? 'rgba(255,92,92,0.3)' : 'rgba(0,200,150,0.3)';
  const textColor = isSchuld ? C.negative : C.positive;

  return (
    <View style={[layout.badge, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[layout.label, { color: textColor }]}>
        {isSchuld ? 'OFFEN' : 'AUSSTEHEND'}
      </Text>
    </View>
  );
}

const layout = StyleSheet.create({
  badge: {
    paddingHorizontal: S.sm,
    paddingVertical: 3,
    borderRadius: R.pill,
    borderWidth: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
