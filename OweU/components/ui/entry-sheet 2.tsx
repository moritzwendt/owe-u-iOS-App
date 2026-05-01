import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/store/theme-context';
import { S, R } from '@/constants/theme';

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

function today(): string {
  return new Date().toISOString().split('T')[0];
}

export function EntrySheet({ visible, mode, onClose, onSave }: EntrySheetProps) {
  const C = useColors();
  const [person, setPerson] = useState('');
  const [betrag, setBetrag] = useState('');
  const [beschreibung, setBeschreibung] = useState('');
  const [error, setError] = useState('');

  const isSchuld = mode === 'schuld';
  const title = isSchuld ? 'Neue Schuld' : 'Neue Forderung';
  const personPlaceholder = isSchuld ? 'Name eingeben' : 'Wer schuldet dir?';

  function reset() {
    setPerson(''); setBetrag(''); setBeschreibung(''); setError('');
  }

  function handleClose() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    reset();
    onClose();
  }

  function handleSave() {
    const betragNum = parseFloat(betrag.replace(',', '.'));
    if (!person.trim()) {
      setError('Name ist erforderlich');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (!betrag || isNaN(betragNum) || betragNum <= 0) {
      setError('Gültiger Betrag erforderlich');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSave({ person: person.trim(), betrag: betragNum, beschreibung: beschreibung.trim(), datum: today() });
    reset();
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <TouchableOpacity style={layout.overlay} activeOpacity={1} onPress={handleClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={layout.sheetWrap}>
        <View style={[layout.sheet, { backgroundColor: C.surfaceElevated, borderColor: C.border }]}>
          <View style={[layout.handle, { backgroundColor: C.border }]} />

          <Text style={[layout.title, { color: C.textPrimary }]}>{title}</Text>

          <View style={layout.field}>
            <Text style={[layout.fieldLabel, { color: C.textSecondary }]}>PERSON</Text>
            <TextInput
              style={[layout.input, { backgroundColor: C.bg, borderColor: C.border, color: C.textPrimary }]}
              placeholder={personPlaceholder}
              placeholderTextColor={C.textDim}
              value={person}
              onChangeText={t => { setPerson(t); setError(''); }}
              autoFocus
              autoCapitalize="words"
            />
          </View>

          <View style={layout.field}>
            <Text style={[layout.fieldLabel, { color: C.textSecondary }]}>BETRAG</Text>
            <TextInput
              style={[layout.input, { backgroundColor: C.bg, borderColor: C.border, color: C.textPrimary }]}
              placeholder="0,00 €"
              placeholderTextColor={C.textDim}
              value={betrag}
              onChangeText={t => { setBetrag(t); setError(''); }}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={layout.field}>
            <Text style={[layout.fieldLabel, { color: C.textSecondary }]}>BESCHREIBUNG (OPTIONAL)</Text>
            <TextInput
              style={[layout.input, { backgroundColor: C.bg, borderColor: C.border, color: C.textPrimary }]}
              placeholder="Wofür?"
              placeholderTextColor={C.textDim}
              value={beschreibung}
              onChangeText={setBeschreibung}
            />
          </View>

          {error ? <Text style={[layout.error, { color: C.error }]}>{error}</Text> : null}

          <View style={layout.btnRow}>
            <Pressable style={[layout.btnSecondary, { borderColor: C.border }]} onPress={handleClose}>
              <Text style={[layout.btnSecondaryText, { color: C.textSecondary }]}>Abbrechen</Text>
            </Pressable>
            <Pressable style={[layout.btnPrimary, { backgroundColor: C.accent }]} onPress={handleSave}>
              <Text style={[layout.btnPrimaryText, { color: C.textOnAccent }]}>Speichern</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const layout = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheetWrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  sheet: { borderTopLeftRadius: R.sheet, borderTopRightRadius: R.sheet, borderTopWidth: 1, padding: S.xxl, paddingBottom: 48, gap: S.base },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: S.sm },
  title: { fontSize: 22, fontWeight: '700', marginBottom: S.sm, letterSpacing: -0.3 },
  field: { gap: S.xs },
  fieldLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1.2 },
  input: { borderWidth: 1, borderRadius: R.sm, padding: S.base, fontSize: 15 },
  error: { fontSize: 12, marginTop: -S.xs },
  btnRow: { flexDirection: 'row', gap: S.sm, marginTop: S.xs },
  btnPrimary: { flex: 1, paddingVertical: S.base, borderRadius: R.sm, alignItems: 'center', minHeight: 44, justifyContent: 'center' },
  btnPrimaryText: { fontSize: 15, fontWeight: '700' },
  btnSecondary: { flex: 1, borderWidth: 1, paddingVertical: S.base, borderRadius: R.sm, alignItems: 'center', minHeight: 44, justifyContent: 'center' },
  btnSecondaryText: { fontSize: 15, fontWeight: '600' },
});
