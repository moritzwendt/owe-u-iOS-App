import React, { createContext, useContext, useState } from 'react';

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

const initialSchulden: Schuld[] = [
  { id: '1', person: 'Max Rieder', betrag: 45.0, beschreibung: 'Dinner am Dienstag', datum: '2025-04-28', bezahlt: false },
  { id: '2', person: 'Lena Weiss', betrag: 12.5, beschreibung: 'Kaffeepause', datum: '2025-04-27', bezahlt: false },
  { id: '3', person: 'Tom Bauer', betrag: 80.0, beschreibung: 'Konzertticket', datum: '2025-04-20', bezahlt: true },
];

const initialForderungen: Forderung[] = [
  { id: '1', person: 'Sara Klein', betrag: 30.0, beschreibung: 'Taxi-Split', datum: '2025-04-28', erhalten: false },
  { id: '2', person: 'Jonas Graf', betrag: 55.5, beschreibung: 'Gruppenessen', datum: '2025-04-25', erhalten: false },
  { id: '3', person: 'Mia Steiner', betrag: 20.0, beschreibung: 'Kino', datum: '2025-04-18', erhalten: true },
];

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
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [schulden, setSchulden] = useState<Schuld[]>(initialSchulden);
  const [forderungen, setForderungen] = useState<Forderung[]>(initialForderungen);
  const [hiddenPersons, setHiddenPersons] = useState<string[]>([]);
  const [hiddenDescriptions, setHiddenDescriptions] = useState<string[]>([]);

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

  return (
    <AppContext.Provider value={{
      schulden, forderungen,
      addSchuld, addForderung,
      toggleBezahlt, toggleErhalten,
      hiddenPersons, hiddenDescriptions,
      hidePersonSuggestion, hideDescriptionSuggestion,
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
