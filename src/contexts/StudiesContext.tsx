import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface StudyEntry {
  id: string;
  name: string;
  contactInfo: string;
  lastVisitDate: string;
  notes: string;
  type: 'bible-study' | 'return-visit';
  createdAt: string;
}

interface StudiesContextType {
  studies: StudyEntry[];
  addStudy: (entry: Omit<StudyEntry, 'id' | 'createdAt'>) => void;
  updateStudy: (id: string, entry: Partial<StudyEntry>) => void;
  deleteStudy: (id: string) => void;
  getStudyCount: (type: 'bible-study' | 'return-visit') => number;
}

const STORAGE_KEY = 'nwt-studies-data';

function loadStudies(): StudyEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
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

  return (
    <StudiesContext.Provider value={{ studies, addStudy, updateStudy, deleteStudy, getStudyCount }}>
      {children}
    </StudiesContext.Provider>
  );
}

export function useStudies() {
  const ctx = useContext(StudiesContext);
  if (!ctx) throw new Error('useStudies must be used within StudiesProvider');
  return ctx;
}
