import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface VisitHistoryEntry {
  date: string;
  notes: string;
  outcome: string;
}

export interface StudyEntry {
  id: string;
  name: string;
  contactInfo: string;
  address: string;
  lastVisitDate: string;
  nextSessionDate?: string;
  nextSessionTime?: string;
  notes: string;
  type: 'bible-study' | 'return-visit';
  createdAt: string;
  visitHistory?: VisitHistoryEntry[];
}

interface StudiesContextType {
  studies: StudyEntry[];
  addStudy: (entry: Omit<StudyEntry, 'id' | 'createdAt'>) => void;
  updateStudy: (id: string, entry: Partial<StudyEntry>) => void;
  deleteStudy: (id: string) => void;
  getStudyCount: (type: 'bible-study' | 'return-visit') => number;
  getUpcomingVisits: () => StudyEntry[];
  addVisitHistory: (id: string, entry: VisitHistoryEntry) => void;
}

const STORAGE_KEY = 'nwt-studies-data';

function loadStudies(): StudyEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((s: any) => ({ address: '', visitHistory: [], ...s }));
    }
  } catch {}
  return [];
}

const StudiesContext = createContext<StudiesContextType | null>(null);

export function StudiesProvider({ children }: { children: React.ReactNode }) {
  const [studies, setStudies] = useState<StudyEntry[]>(loadStudies);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(studies));
  }, [studies]);

  const addStudy = useCallback((entry: Omit<StudyEntry, 'id' | 'createdAt'>) => {
    const newEntry: StudyEntry = {
      ...entry,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      createdAt: new Date().toISOString(),
      visitHistory: entry.visitHistory || [],
    };
    setStudies(prev => [newEntry, ...prev]);
  }, []);

  const updateStudy = useCallback((id: string, updates: Partial<StudyEntry>) => {
    setStudies(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const deleteStudy = useCallback((id: string) => {
    setStudies(prev => prev.filter(s => s.id !== id));
  }, []);

  const getStudyCount = useCallback((type: 'bible-study' | 'return-visit') => {
    return studies.filter(s => s.type === type).length;
  }, [studies]);

  const addVisitHistory = useCallback((id: string, entry: VisitHistoryEntry) => {
    setStudies(prev => prev.map(s => {
      if (s.id !== id) return s;
      const history = [...(s.visitHistory || []), entry];
      return { ...s, visitHistory: history, lastVisitDate: entry.date };
    }));
  }, []);

  const getUpcomingVisits = useCallback(() => {
    return studies.filter(s => {
      if (!s.lastVisitDate) return true;
      const daysSince = Math.floor((Date.now() - new Date(s.lastVisitDate + 'T12:00:00').getTime()) / 86400000);
      return daysSince >= 7;
    }).sort((a, b) => {
      if (!a.lastVisitDate) return -1;
      if (!b.lastVisitDate) return 1;
      return a.lastVisitDate.localeCompare(b.lastVisitDate);
    }).slice(0, 5);
  }, [studies]);

  return (
    <StudiesContext.Provider value={{ studies, addStudy, updateStudy, deleteStudy, getStudyCount, getUpcomingVisits, addVisitHistory }}>
      {children}
    </StudiesContext.Provider>
  );
}

export function useStudies() {
  const ctx = useContext(StudiesContext);
  if (!ctx) throw new Error('useStudies must be used within StudiesProvider');
  return ctx;
}
