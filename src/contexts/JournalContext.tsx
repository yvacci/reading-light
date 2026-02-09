import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface JournalEntry {
  id: string;
  bookId: number;
  chapter: number;
  verse?: number;
  title: string;
  content: string;
  mood?: string;
  createdAt: string;
  updatedAt: string;
}

interface JournalContextType {
  entries: JournalEntry[];
  addEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEntry: (id: string, updates: Partial<Pick<JournalEntry, 'title' | 'content' | 'mood'>>) => void;
  removeEntry: (id: string) => void;
  getEntriesByChapter: (bookId: number, chapter: number) => JournalEntry[];
  getEntriesByBook: (bookId: number) => JournalEntry[];
}

const STORAGE_KEY = 'nwt-journal';

function loadEntries(): JournalEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveEntries(entries: JournalEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

const JournalContext = createContext<JournalContextType | null>(null);

export function JournalProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<JournalEntry[]>(loadEntries);

  useEffect(() => {
    saveEntries(entries);
  }, [entries]);

  const addEntry = useCallback((entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newEntry: JournalEntry = {
      ...entry,
      id: `j_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };
    setEntries(prev => [newEntry, ...prev]);
  }, []);

  const updateEntry = useCallback((id: string, updates: Partial<Pick<JournalEntry, 'title' | 'content' | 'mood'>>) => {
    setEntries(prev =>
      prev.map(e => (e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e))
    );
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const getEntriesByChapter = useCallback(
    (bookId: number, chapter: number) =>
      entries.filter(e => e.bookId === bookId && e.chapter === chapter),
    [entries]
  );

  const getEntriesByBook = useCallback(
    (bookId: number) => entries.filter(e => e.bookId === bookId),
    [entries]
  );

  return (
    <JournalContext.Provider value={{ entries, addEntry, updateEntry, removeEntry, getEntriesByChapter, getEntriesByBook }}>
      {children}
    </JournalContext.Provider>
  );
}

export function useJournal() {
  const ctx = useContext(JournalContext);
  if (!ctx) throw new Error('useJournal must be used within JournalProvider');
  return ctx;
}
