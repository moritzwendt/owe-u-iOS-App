import React, { createContext, useContext, useState, useEffect } from 'react';
import { Settings } from 'react-native';

// MARK: - Types

export type Schuld = {
  id: string;
  person: string;
  betrag: number;
  beschreibung: string;
  datum: string;
  bezahlt: boolean;
  bezahltAm?: string;
};

export type Forderung = {
  id: string;
  person: string;
  betrag: number;
  beschreibung: string;
  datum: string;
  erhalten: boolean;
  erhaltenAm?: string;
};

// MARK: - Persistence

const KEYS = {
  schulden: 'app_schulden',
  forderungen: 'app_forderungen',
  hiddenPersons: 'app_hiddenPersons',
  hiddenDescriptions: 'app_hiddenDescriptions',
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = Settings.get(key) as string | null;
    if (raw) return JSON.parse(raw) as T;
  } catch {}
  return fallback;
}

function persist(key: string, value: unknown) {
  Settings.set({ [key]: JSON.stringify(value) });
}

// MARK: - Context

type AppContextType = {
  schulden: Schuld[];
  forderungen: Forderung[];
  addSchuld: (s: Omit<Schuld, 'id'>) => void;
  addForderung: (f: Omit<Forderung, 'id'>) => void;
  toggleBezahlt: (id: string) => void;
  toggleErhalten: (id: string) => void;
  hiddenPersons: string[];
  hiddenDescriptions: string[];
  hidePersonSuggestion: (name: string) => void;
  hideDescriptionSuggestion: (desc: string) => void;
  resetAll: () => void;
};

const AppContext = createContext<AppContextType | null>(null);

// MARK: - Provider

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [schulden, setSchulden] = useState<Schuld[]>(() => load(KEYS.schulden, []));
  const [forderungen, setForderungen] = useState<Forderung[]>(() => load(KEYS.forderungen, []));
  const [hiddenPersons, setHiddenPersons] = useState<string[]>(() => load(KEYS.hiddenPersons, []));
  const [hiddenDescriptions, setHiddenDescriptions] = useState<string[]>(() => load(KEYS.hiddenDescriptions, []));

  useEffect(() => { persist(KEYS.schulden, schulden); }, [schulden]);
  useEffect(() => { persist(KEYS.forderungen, forderungen); }, [forderungen]);
  useEffect(() => { persist(KEYS.hiddenPersons, hiddenPersons); }, [hiddenPersons]);
  useEffect(() => { persist(KEYS.hiddenDescriptions, hiddenDescriptions); }, [hiddenDescriptions]);

  function addSchuld(s: Omit<Schuld, 'id'>) {
    setSchulden(prev => [{ ...s, id: Date.now().toString() }, ...prev]);
  }

  function addForderung(f: Omit<Forderung, 'id'>) {
    setForderungen(prev => [{ ...f, id: Date.now().toString() }, ...prev]);
  }

  function toggleBezahlt(id: string) {
    setSchulden(prev => prev.map(s => {
      if (s.id !== id) return s;
      const next = !s.bezahlt;
      return { ...s, bezahlt: next, bezahltAm: next ? new Date().toISOString() : undefined };
    }));
  }

  function toggleErhalten(id: string) {
    setForderungen(prev => prev.map(f => {
      if (f.id !== id) return f;
      const next = !f.erhalten;
      return { ...f, erhalten: next, erhaltenAm: next ? new Date().toISOString() : undefined };
    }));
  }

  function hidePersonSuggestion(name: string) {
    setHiddenPersons(prev => [...prev, name]);
  }

  function hideDescriptionSuggestion(desc: string) {
    setHiddenDescriptions(prev => [...prev, desc]);
  }

  function resetAll() {
    setSchulden([]);
    setForderungen([]);
  }

  return (
    <AppContext.Provider value={{
      schulden, forderungen,
      addSchuld, addForderung,
      toggleBezahlt, toggleErhalten,
      hiddenPersons, hiddenDescriptions,
      hidePersonSuggestion, hideDescriptionSuggestion,
      resetAll,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
