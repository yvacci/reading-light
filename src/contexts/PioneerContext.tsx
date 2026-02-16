import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface PioneerEntry {
  date: string; // YYYY-MM-DD
  ministryHours: number;
  bibleStudies: number;
  returnVisits: number;
  witnessingHours: number;
  otherWitnessingHours: number;
}

type PioneerMap = Record<string, PioneerEntry>;

interface PioneerContextType {
  entries: PioneerMap;
  getEntry: (date: string) => PioneerEntry | null;
  saveEntry: (entry: PioneerEntry) => void;
  deleteEntry: (date: string) => void;
  resetEntries: () => void;
  getMonthSummary: (year: number, month: number) => {
    totalHours: number;
    bibleStudies: number;
    returnVisits: number;
    witnessingHours: number;
    otherWitnessingHours: number;
    daysWithData: number;
    daysInMonth: number;
  };
}

const STORAGE_KEY = 'nwt-pioneer-data';

function loadEntries(): PioneerMap {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Migrate old entries that don't have otherWitnessingHours
      for (const key of Object.keys(parsed)) {
        if (parsed[key].otherWitnessingHours === undefined) {
          parsed[key].otherWitnessingHours = 0;
        }
      }
      return parsed;
    }
  } catch {}
  return {};
}

const PioneerContext = createContext<PioneerContextType | null>(null);

export function PioneerProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<PioneerMap>(loadEntries);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const getEntry = useCallback((date: string) => entries[date] || null, [entries]);

  const saveEntry = useCallback((entry: PioneerEntry) => {
    setEntries(prev => ({ ...prev, [entry.date]: entry }));
  }, []);

  const deleteEntry = useCallback((date: string) => {
    setEntries(prev => {
      const next = { ...prev };
      delete next[date];
      return next;
    });
  }, []);

  const resetEntries = useCallback(() => {
    setEntries({});
  }, []);

  const getMonthSummary = useCallback((year: number, month: number) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    let totalHours = 0, bibleStudies = 0, returnVisits = 0, witnessingHours = 0, otherWitnessingHours = 0, daysWithData = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const e = entries[key];
      if (e) {
        daysWithData++;
        totalHours += e.ministryHours + e.witnessingHours + (e.otherWitnessingHours || 0);
        bibleStudies += e.bibleStudies;
        returnVisits += e.returnVisits;
        witnessingHours += e.witnessingHours;
        otherWitnessingHours += (e.otherWitnessingHours || 0);
      }
    }

    return { totalHours, bibleStudies, returnVisits, witnessingHours, otherWitnessingHours, daysWithData, daysInMonth };
  }, [entries]);

  return (
    <PioneerContext.Provider value={{ entries, getEntry, saveEntry, deleteEntry, resetEntries, getMonthSummary }}>
      {children}
    </PioneerContext.Provider>
  );
}

export function usePioneer() {
  const ctx = useContext(PioneerContext);
  if (!ctx) throw new Error('usePioneer must be used within PioneerProvider');
  return ctx;
}
