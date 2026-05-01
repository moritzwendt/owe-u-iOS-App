import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  Share,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useColors, useTheme, type ThemePreference } from '@/store/theme-context';
import { S, R } from '@/constants/theme';

// MARK: - App Version

const APP_VERSION = '1.0.1';

const MOCK_USER = {
  name: 'Max Mustermann',
  email: 'max@oweyou.app',
  initials: 'MM',
  memberSince: 'April 2025',
};

// MARK: - Components

function SectionLabel({ label }: { label: string }) {
  const C = useColors();
  return <Text style={[layout.sectionLabel, { color: C.textSecondary }]}>{label}</Text>;
}

function NavRow({ label, sublabel, onPress, last }: { label: string; sublabel?: string; onPress: () => void; last?: boolean }) {
  const C = useColors();
  return (
    <Pressable
      style={({ pressed }) => [
        layout.row,
        !last && { borderBottomWidth: 1, borderBottomColor: C.borderSubtle },
        pressed && { backgroundColor: C.surfaceElevated },
      ]}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
    >
      <View style={layout.rowLeft}>
        <Text style={[layout.rowLabel, { color: C.textPrimary }]}>{label}</Text>
        {sublabel ? <Text style={[layout.rowSublabel, { color: C.textSecondary }]}>{sublabel}</Text> : null}
      </View>
      <Text style={[layout.chevron, { color: C.textDim }]}>›</Text>
    </Pressable>
  );
}

function ToggleRow({ label, sublabel, value, onToggle, last }: { label: string; sublabel?: string; value: boolean; onToggle: (v: boolean) => void; last?: boolean }) {
  const C = useColors();
  return (
    <View style={[layout.row, !last && { borderBottomWidth: 1, borderBottomColor: C.borderSubtle }]}>
      <View style={layout.rowLeft}>
        <Text style={[layout.rowLabel, { color: C.textPrimary }]}>{label}</Text>
        {sublabel ? <Text style={[layout.rowSublabel, { color: C.textSecondary }]}>{sublabel}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={v => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onToggle(v); }}
        trackColor={{ false: C.border, true: C.accent }}
        ios_backgroundColor={C.border}
      />
    </View>
  );
}

function ValueRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  const C = useColors();
  return (
    <View style={[layout.row, !last && { borderBottomWidth: 1, borderBottomColor: C.borderSubtle }]}>
      <Text style={[layout.rowLabel, { color: C.textPrimary }]}>{label}</Text>
      <Text style={[layout.rowValue, { color: C.textSecondary }]}>{value}</Text>
    </View>
  );
}

function WarnRow({ label, onPress, last }: { label: string; onPress: () => void; last?: boolean }) {
  const C = useColors();
  return (
    <Pressable
      style={({ pressed }) => [
        layout.row,
        !last && { borderBottomWidth: 1, borderBottomColor: C.borderSubtle },
        pressed && { backgroundColor: C.surfaceElevated },
      ]}
      onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); onPress(); }}
    >
      <Text style={[layout.rowLabel, { color: C.negative }]}>{label}</Text>
    </Pressable>
  );
}

function ThemeSegment({ current, onChange }: { current: ThemePreference; onChange: (t: ThemePreference) => void }) {
  const C = useColors();
  const options: { key: ThemePreference; label: string }[] = [
    { key: 'system', label: 'System' },
    { key: 'hell', label: 'Hell' },
    { key: 'dunkel', label: 'Dunkel' },
  ];
  return (
    <View style={[layout.row, { borderBottomWidth: 1, borderBottomColor: C.borderSubtle }]}>
      <Text style={[layout.rowLabel, { color: C.textPrimary }]}>App-Design</Text>
      <View style={[layout.segmented, { backgroundColor: C.bg }]}>
        {options.map(opt => (
          <Pressable
            key={opt.key}
            style={[layout.segBtn, current === opt.key && { backgroundColor: C.surface }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onChange(opt.key); }}
          >
            <Text style={[
              layout.segLabel,
              { color: current === opt.key ? C.textPrimary : C.textSecondary },
              current === opt.key && { fontWeight: '600' },
            ]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function ProfileHeader() {
  const C = useColors();
  return (
    <View style={[layout.profileCard, { backgroundColor: C.surface, borderColor: C.border }]}>
      <View style={[layout.avatar, { backgroundColor: C.accentMuted, borderColor: C.accent }]}>
        <Text style={[layout.avatarInitials, { color: C.accent }]}>{MOCK_USER.initials}</Text>
      </View>
      <View style={layout.profileTexts}>
        <Text style={[layout.profileName, { color: C.textPrimary }]}>{MOCK_USER.name}</Text>
        <Text style={[layout.profileEmail, { color: C.textSecondary }]}>{MOCK_USER.email}</Text>
        <Text style={[layout.profileMeta, { color: C.textDim }]}>Mitglied seit {MOCK_USER.memberSince}</Text>
      </View>
    </View>
  );
}

// MARK: - Screen

type CommitInfo = { message: string; author: string; date: string };

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'gerade eben';
  if (mins < 60) return `vor ${mins} Min.`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  const days = Math.floor(hours / 24);
  return `vor ${days} Tag${days === 1 ? '' : 'en'}`;
}

export default function ProfilScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const { preference, setPreference } = useTheme();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [commit, setCommit] = useState<CommitInfo | null>(null);

  useEffect(() => {
    fetch('https://api.github.com/repos/moritzwendt/owe-u-iOS-App/commits?per_page=1')
      .then(r => r.json())
      .then(data => {
        const c = data[0];
        setCommit({
          message: c.commit.message.split('\n')[0],
          author: c.commit.author.name,
          date: c.commit.author.date,
        });
      })
      .catch(() => {});
  }, []);

  function handleExportData() {
    Alert.alert('Daten exportieren', 'Deine Einträge werden als CSV-Datei exportiert.', [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Exportieren', onPress: () => Alert.alert('Export gestartet', 'Deine Daten werden vorbereitet.') },
    ]);
  }

  function handleResetData() {
    Alert.alert('Alle Einträge löschen', 'Schulden und Forderungen werden unwiderruflich gelöscht.', [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Löschen', style: 'destructive', onPress: () => Alert.alert('Einträge gelöscht') },
    ]);
  }

  function handleLogout() {
    Alert.alert('Abmelden', 'Du wirst auf diesem Gerät abgemeldet.', [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Abmelden', style: 'destructive', onPress: () => Alert.alert('Abgemeldet', 'Auf Wiedersehen!') },
    ]);
  }

  function handleDeleteAccount() {
    Alert.alert('Konto löschen', 'Dein Konto und alle Daten werden unwiderruflich gelöscht.', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Endgültig löschen', style: 'destructive',
        onPress: () => Alert.alert('Bist du sicher?', 'Diese Aktion ist permanent.', [
          { text: 'Abbrechen', style: 'cancel' },
          { text: 'Konto löschen', style: 'destructive', onPress: () => Alert.alert('Konto gelöscht') },
        ]),
      },
    ]);
  }

  return (
    <View style={[layout.safe, { backgroundColor: C.bg }]}>
      <ScrollView style={layout.scroll} contentContainerStyle={[layout.content, { paddingTop: insets.top + S.xl }]} showsVerticalScrollIndicator={false}>
        <Text style={[layout.screenTitle, { color: C.textPrimary }]}>Profil</Text>

        <ProfileHeader />

        <SectionLabel label="ERSCHEINUNG" />
        <View style={[layout.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <ThemeSegment current={preference} onChange={setPreference} />
          <NavRow
            label="App-Icon" sublabel="Standard"
            onPress={() => Alert.alert('App-Icon', 'Alternative Icons kommen in einem zukünftigen Update.')}
            last
          />
        </View>

        <SectionLabel label="BENACHRICHTIGUNGEN" />
        <View style={[layout.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <ToggleRow label="Push-Benachrichtigungen" value={pushEnabled} onToggle={setPushEnabled} />
          <ToggleRow label="Erinnerungen" sublabel="Bei offenen Schulden & Forderungen" value={reminderEnabled} onToggle={setReminderEnabled} last />
        </View>

        <SectionLabel label="DATEN & PRIVATSPHÄRE" />
        <View style={[layout.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <NavRow label="Daten exportieren" sublabel="Als CSV-Datei" onPress={handleExportData} />
          <WarnRow label="Alle Einträge zurücksetzen" onPress={handleResetData} last />
        </View>

        <SectionLabel label="ACCOUNT" />
        <View style={[layout.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <ValueRow label="Angemeldet als" value={MOCK_USER.email} />
          <NavRow label="Passwort ändern" onPress={() => router.push('/passwort-aendern')} />
          <NavRow label="E-Mail ändern" onPress={() => router.push('/email-aendern')} />
          <WarnRow label="Abmelden" onPress={handleLogout} last />
        </View>

        <SectionLabel label="OweYou EMPFEHLEN" />
        <View style={[layout.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <NavRow
            label="App empfehlen" sublabel="Freunden weiterempfehlen"
            onPress={() => Share.share({ message: 'OweYou – tracke wer wem was schuldet.' })}
          />
          <NavRow label="Feedback senden" sublabel="Wünsche & Verbesserungen" onPress={() => router.push('/feedback')} last />
        </View>

        <SectionLabel label="RECHTLICHES" />
        <View style={[layout.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <NavRow label="Datenschutzerklärung" onPress={() => router.push('/datenschutz')} />
          <NavRow label="Nutzungsbedingungen" onPress={() => router.push('/nutzungsbedingungen')} last />
        </View>

        <Pressable
          style={({ pressed }) => [
            layout.deleteBtn,
            { backgroundColor: C.negativeMuted, borderColor: 'rgba(255,92,92,0.25)' },
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); handleDeleteAccount(); }}
        >
          <Text style={[layout.deleteBtnText, { color: C.negative }]}>Konto löschen</Text>
        </Pressable>

        <View style={layout.footer}>
          <View style={layout.footerGitHub}>
            <Ionicons name="logo-github" size={13} color={C.textDim} />
            <Text style={[layout.footerVersion, { color: C.textDim }]}>OweYou {APP_VERSION}</Text>
          </View>
          {commit ? (
            <>
              <Text style={[layout.footerCommit, { color: C.textDim }]} numberOfLines={1}>{commit.message}</Text>
              <Text style={[layout.footerText, { color: C.textDim }]}>{commit.author} · {timeAgo(commit.date)}</Text>
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

// MARK: - Styles

const layout = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: S.screenPad, paddingBottom: S.section, gap: S.xs },
  screenTitle: { fontSize: 30, fontWeight: '700', letterSpacing: -0.5, marginBottom: S.md },
  profileCard: { borderRadius: R.md, borderWidth: 1, padding: S.base, flexDirection: 'row', alignItems: 'center', gap: S.base, marginBottom: S.md },
  avatar: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarInitials: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  profileTexts: { flex: 1, gap: 2 },
  profileName: { fontSize: 16, fontWeight: '600' },
  profileEmail: { fontSize: 13 },
  profileMeta: { fontSize: 11, marginTop: 1 },
  sectionLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1.2, marginTop: S.md, marginBottom: S.xs, paddingHorizontal: S.xs },
  card: { borderRadius: R.md, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: S.base, paddingVertical: S.md, minHeight: 50, gap: S.sm },
  rowLeft: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 15 },
  rowSublabel: { fontSize: 12 },
  rowValue: { fontSize: 14, flexShrink: 1, maxWidth: '50%', textAlign: 'right' },
  chevron: { fontSize: 20, lineHeight: 22 },
  segmented: { flexDirection: 'row', borderRadius: R.xs, padding: 3, gap: 2 },
  segBtn: { paddingHorizontal: S.md, paddingVertical: 5, borderRadius: R.xs - 1 },
  segLabel: { fontSize: 12, fontWeight: '500' },
  deleteBtn: { borderRadius: R.md, borderWidth: 1, paddingVertical: S.base, alignItems: 'center', marginTop: S.xl },
  deleteBtnText: { fontSize: 15, fontWeight: '600' },
  footer: { alignItems: 'center', gap: 4, marginTop: S.xl, paddingBottom: S.sm },
  footerGitHub: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  footerText: { fontSize: 11 },
  footerCommit: { fontSize: 11, fontWeight: '500' },
  footerVersion: { fontSize: 12, fontWeight: '500', marginBottom: 2 },
});
