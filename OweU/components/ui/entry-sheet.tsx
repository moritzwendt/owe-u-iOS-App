import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/store/theme-context';
import { useApp } from '@/store/app-context';
import { S, R } from '@/constants/theme';

// MARK: - Types

export type EntryFormData = {
  person: string;
  betrag: number;
  beschreibung: string;
  datum: string;
};

interface EntrySheetProps {
  visible: boolean;
  mode: 'schuld' | 'forderung';
  onClose: () => void;
  onSave: (data: EntryFormData) => void;
}

// MARK: - Helpers

const QUICK_STEPS = [-10, -5, 5, 10, 15];

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function parseCents(raw: string): number {
  const val = parseFloat(raw.replace(',', '.'));
  return isNaN(val) ? 0 : Math.round(val * 100);
}

function centsToString(cents: number): string {
  return (cents / 100).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function uniqueOrdered(values: string[]): string[] {
  const seen = new Set<string>();
  return values.filter(v => {
    if (!v.trim() || seen.has(v)) return false;
    seen.add(v);
    return true;
  });
}

// MARK: - SuggestField

interface SuggestFieldProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  suggestions: string[];
  onDeleteSuggestion: (s: string) => void;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

function SuggestField({
  label,
  value,
  onChangeText,
  placeholder,
  suggestions,
  onDeleteSuggestion,
  autoCapitalize = 'sentences',
}: SuggestFieldProps) {
  const C = useColors();
  const inputRef = useRef<TextInput>(null);

  const trimmed = value.trim();

  const filtered = suggestions.filter(s =>
    trimmed === '' || s.toLowerCase().includes(trimmed.toLowerCase())
  );

  function handleXPress(s: string) {
    const isSelected = trimmed === s;
    if (isSelected) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChangeText('');
    } else {
      Alert.alert(
        'Entfernen',
        `Möchtest du "${s}" wirklich aus den Vorschlägen entfernen?`,
        [
          { text: 'Abbrechen', style: 'cancel' },
          {
            text: 'Entfernen',
            style: 'destructive',
            onPress: () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              onDeleteSuggestion(s);
            },
          },
        ]
      );
    }
  }

  function handleChipPress(s: string) {
    const isSelected = trimmed === s;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChangeText(isSelected ? '' : s);
    inputRef.current?.blur();
  }

  return (
    <View style={sf.wrap}>
      <Text style={[sf.label, { color: C.textSecondary }]}>{label}</Text>
      <TextInput
        ref={inputRef}
        style={[sf.input, { backgroundColor: C.bg, borderColor: C.border, color: C.textPrimary }]}
        placeholder={placeholder}
        placeholderTextColor={C.textDim}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize={autoCapitalize}
        returnKeyType="done"
        onSubmitEditing={() => inputRef.current?.blur()}
      />

      {filtered.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={sf.chipRow}
          keyboardShouldPersistTaps="handled"
        >
          {filtered.map(s => {
            const isSelected = trimmed === s;
            return (
              <View
                key={s}
                style={[
                  sf.chip,
                  {
                    backgroundColor: isSelected ? C.accentMuted : C.surface,
                    borderColor: isSelected ? C.accent : C.border,
                  },
                ]}
              >
                <Pressable style={sf.chipBody} onPress={() => handleChipPress(s)}>
                  <Text style={[sf.chipText, { color: isSelected ? C.accent : C.textSecondary }]}>
                    {s}
                  </Text>
                </Pressable>
                <Pressable
                  style={sf.chipX}
                  onPress={() => handleXPress(s)}
                  hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
                >
                  <Text style={[sf.chipXText, { color: isSelected ? C.accent : C.textDim }]}>×</Text>
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const sf = StyleSheet.create({
  wrap: { gap: S.xs },
  label: { fontSize: 10, fontWeight: '600', letterSpacing: 1.2 },
  input: { borderWidth: 1, borderRadius: R.sm, padding: S.base, fontSize: 15 },
  chipRow: { gap: S.xs, paddingVertical: 2 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: R.pill,
    borderWidth: 1,
    overflow: 'hidden',
  },
  chipBody: { paddingLeft: S.md, paddingVertical: 6 },
  chipText: { fontSize: 13, fontWeight: '500' },
  chipX: { paddingHorizontal: S.sm, paddingVertical: 6 },
  chipXText: { fontSize: 16, fontWeight: '400', lineHeight: 18 },
});

// MARK: - EntrySheet

export function EntrySheet({ visible, mode, onClose, onSave }: EntrySheetProps) {
  const C = useColors();
  const {
    schulden, forderungen,
    hiddenPersons, hiddenDescriptions,
    hidePersonSuggestion, hideDescriptionSuggestion,
  } = useApp();

  const [person, setPerson] = useState('');
  const [betragRaw, setBetragRaw] = useState('');
  const [beschreibung, setBeschreibung] = useState('');
  const [error, setError] = useState('');
  const amountRef = useRef<TextInput>(null);

  const isSchuld = mode === 'schuld';
  const title = isSchuld ? 'Neue Schuld' : 'Neue Forderung';
  const accentColor = isSchuld ? C.negative : C.positive;
  const accentMuted = isSchuld ? C.negativeMuted : C.positiveMuted;
  const personPlaceholder = isSchuld ? 'Name eingeben' : 'Wer schuldet dir?';
  const cents = parseCents(betragRaw);

  const allEntries = [...schulden, ...forderungen].sort((a, b) => b.datum.localeCompare(a.datum));
  const personSuggestions = uniqueOrdered(
    allEntries.map(e => e.person).filter(p => !hiddenPersons.includes(p))
  );
  const beschreibungSuggestions = uniqueOrdered(
    allEntries.map(e => e.beschreibung).filter(d => !hiddenDescriptions.includes(d))
  );

  function reset() {
    setPerson('');
    setBetragRaw('');
    setBeschreibung('');
    setError('');
  }

  function handleClose() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    reset();
    onClose();
  }

  function handleSave() {
    if (!person.trim()) {
      setError('Name ist erforderlich');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (cents <= 0) {
      setError('Gültiger Betrag erforderlich');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSave({ person: person.trim(), betrag: cents / 100, beschreibung: beschreibung.trim(), datum: today() });
    reset();
    onClose();
  }

  function handleQuickStep(step: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const nextCents = Math.max(0, cents + step * 100);
    setBetragRaw(nextCents === 0 ? '' : centsToString(nextCents));
    setError('');
  }

  // MARK: - Render

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <TouchableOpacity style={layout.overlay} activeOpacity={1} onPress={handleClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={layout.sheetWrap}>
        <ScrollView
          style={[layout.sheet, { backgroundColor: C.surfaceElevated, borderColor: C.border }]}
          contentContainerStyle={layout.sheetContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[layout.handle, { backgroundColor: C.border }]} />
          <Text style={[layout.title, { color: C.textPrimary }]}>{title}</Text>

          <Pressable
            style={[layout.amountBox, { backgroundColor: accentMuted }]}
            onPress={() => amountRef.current?.focus()}
          >
            <Text style={[layout.amountEuro, { color: accentColor }]}>€</Text>
            <Text
              style={[layout.amountValue, { color: cents > 0 ? C.textPrimary : C.textDim }]}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {cents > 0 ? centsToString(cents) : '0,00'}
            </Text>
          </Pressable>

          <View style={layout.quickRow}>
            {QUICK_STEPS.map(step => (
              <Pressable
                key={step}
                style={({ pressed }) => [
                  layout.quickBtn,
                  {
                    backgroundColor: pressed
                      ? (step < 0 ? C.negativeMuted : C.positiveMuted)
                      : C.surface,
                    borderColor: step < 0 ? C.negative : C.positive,
                  },
                ]}
                onPress={() => handleQuickStep(step)}
              >
                <Text style={[layout.quickBtnText, { color: step < 0 ? C.negative : C.positive }]}>
                  {step > 0 ? `+${step}` : String(step)}
                </Text>
              </Pressable>
            ))}
          </View>

          <SuggestField
            label="PERSON"
            value={person}
            onChangeText={t => { setPerson(t); setError(''); }}
            placeholder={personPlaceholder}
            suggestions={personSuggestions}
            onDeleteSuggestion={hidePersonSuggestion}
            autoCapitalize="words"
          />

          <SuggestField
            label="BESCHREIBUNG (OPTIONAL)"
            value={beschreibung}
            onChangeText={setBeschreibung}
            placeholder="Wofür?"
            suggestions={beschreibungSuggestions}
            onDeleteSuggestion={hideDescriptionSuggestion}
          />

          {error ? <Text style={[layout.error, { color: C.accent }]}>{error}</Text> : null}

          <View style={layout.btnRow}>
            <Pressable style={[layout.btnSecondary, { borderColor: C.border }]} onPress={handleClose}>
              <Text style={[layout.btnSecondaryText, { color: C.textSecondary }]}>Abbrechen</Text>
            </Pressable>
            <Pressable style={[layout.btnPrimary, { backgroundColor: C.accent }]} onPress={handleSave}>
              <Text style={[layout.btnPrimaryText, { color: C.textOnAccent }]}>Speichern</Text>
            </Pressable>
          </View>

          <TextInput
            ref={amountRef}
            style={layout.hiddenInput}
            value={betragRaw}
            onChangeText={t => { setBetragRaw(t); setError(''); }}
            keyboardType="decimal-pad"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// MARK: - Styles

const layout = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheetWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '90%' },
  sheet: {
    borderTopLeftRadius: R.sheet,
    borderTopRightRadius: R.sheet,
    borderTopWidth: 1,
  },
  sheetContent: {
    padding: S.xxl,
    paddingBottom: 48,
    gap: S.base,
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: S.sm },
  title: { fontSize: 22, fontWeight: '700', marginBottom: S.sm, letterSpacing: -0.3 },

  amountBox: {
    borderRadius: R.md,
    paddingVertical: S.xl,
    paddingHorizontal: S.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: S.sm,
  },
  amountEuro: { fontSize: 26, fontWeight: '600', alignSelf: 'flex-start', marginTop: 8 },
  amountValue: { fontSize: 58, fontWeight: '700', letterSpacing: -2, flexShrink: 1 },

  hiddenInput: { position: 'absolute', opacity: 0, width: 1, height: 1 },

  quickRow: { flexDirection: 'row', gap: S.xs },
  quickBtn: {
    flex: 1,
    paddingVertical: S.sm,
    borderRadius: R.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 38,
  },
  quickBtnText: { fontSize: 13, fontWeight: '700' },

  error: { fontSize: 12, marginTop: -S.xs },
  btnRow: { flexDirection: 'row', gap: S.sm, marginTop: S.xs },
  btnPrimary: {
    flex: 1,
    paddingVertical: S.base,
    borderRadius: R.sm,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  btnPrimaryText: { fontSize: 15, fontWeight: '700' },
  btnSecondary: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: S.base,
    borderRadius: R.sm,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  btnSecondaryText: { fontSize: 15, fontWeight: '600' },
});
