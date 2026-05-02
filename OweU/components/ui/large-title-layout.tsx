import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/store/theme-context';
import { S } from '@/constants/theme';

type Props = {
  title: string;
  accentPrefix?: string;
  titleFont?: string;
  rightButton?: React.ReactNode;
  children: React.ReactNode;
  scrollRef?: React.RefObject<ScrollView | null>;
  contentGap?: number;
};

export function LargeTitleLayout({
  title,
  accentPrefix,
  titleFont,
  rightButton,
  children,
  scrollRef,
  contentGap = S.base,
}: Props) {
  const C = useColors();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      ref={scrollRef}
      style={[st.root, { backgroundColor: C.bg }]}
      contentContainerStyle={{
        paddingTop: insets.top + S.base,
        paddingHorizontal: S.screenPad,
        paddingBottom: insets.bottom + S.section,
        gap: contentGap,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={st.titleRow}>
        <View style={st.titleTexts}>
          {accentPrefix ? (
            <>
              <Text style={[st.title, { color: C.accent }, titleFont && { fontFamily: titleFont, fontWeight: undefined }]}>{accentPrefix}</Text>
              <Text style={[st.title, { color: C.textPrimary }, titleFont && { fontFamily: titleFont, fontWeight: undefined }]}>{title}</Text>
            </>
          ) : (
            <Text style={[st.title, { color: C.textPrimary }, titleFont && { fontFamily: titleFont, fontWeight: undefined }]}>{title}</Text>
          )}
        </View>
        {rightButton ?? null}
      </View>

      {children}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  root: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: S.xs,
  },
  titleTexts: { flexDirection: 'row' },
  title: { fontSize: 30, fontWeight: '700', letterSpacing: -0.5 },
});
