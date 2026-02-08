import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BIBLE_BOOKS, TOTAL_CHAPTERS } from '@/lib/bible-data';

interface ChapterProgress {
  read: boolean;
  dateRead?: string;
}

// Key format: "bookId-chapter" e.g. "1-1" for Genesis 1
type ProgressMap = Record<string, ChapterProgress>;

interface ReadingProgressState {
  progress: ProgressMap;
  currentPlan: string;
  fontSize: number;
  darkMode: boolean;
  language: string;
  lastRead: { bookId: number; chapter: number } | null;
}

interface ReadingProgressContextType extends ReadingProgressState {
  markChapterRead: (bookId: number, chapter: number) => void;
  toggleChapterRead: (bookId: number, chapter: number) => void;
  isChapterRead: (bookId: number, chapter: number) => boolean;
  getBookProgress: (bookId: number) => { read: number; total: number; percent: number };
  getOverallProgress: () => { read: number; total: number; percent: number };
  setCurrentPlan: (planId: string) => void;
  setFontSize: (size: number) => void;
  setDarkMode: (dark: boolean) => void;
  setLanguage: (lang: string) => void;
  setLastRead: (bookId: number, chapter: number) => void;
}

const STORAGE_KEY = 'nwt-reading-progress';

const defaultState: ReadingProgressState = {
  progress: {},
  currentPlan: 'canonical',
  fontSize: 16,
  darkMode: false,
  language: 'tg',
  lastRead: null,
};

function loadState(): ReadingProgressState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaultState, ...JSON.parse(stored) };
  } catch {}
  return defaultState;
}

function saveState(state: ReadingProgressState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const ReadingProgressContext = createContext<ReadingProgressContextType | null>(null);

export function ReadingProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ReadingProgressState>(loadState);

  useEffect(() => {
    saveState(state);
    // Apply dark mode
    document.documentElement.classList.toggle('dark', state.darkMode);
  }, [state]);

  const markChapterRead = useCallback((bookId: number, chapter: number) => {
    setState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        [`${bookId}-${chapter}`]: { read: true, dateRead: new Date().toISOString() },
      },
    }));
  }, []);

  const toggleChapterRead = useCallback((bookId: number, chapter: number) => {
    setState(prev => {
      const key = `${bookId}-${chapter}`;
      const current = prev.progress[key];
      return {
        ...prev,
        progress: {
          ...prev.progress,
          [key]: {
            read: !current?.read,
            dateRead: !current?.read ? new Date().toISOString() : undefined,
          },
        },
      };
    });
  }, []);

  const isChapterRead = useCallback((bookId: number, chapter: number) => {
    return !!state.progress[`${bookId}-${chapter}`]?.read;
  }, [state.progress]);

  const getBookProgress = useCallback((bookId: number) => {
    const book = BIBLE_BOOKS.find(b => b.id === bookId);
    if (!book) return { read: 0, total: 0, percent: 0 };
    let read = 0;
    for (let ch = 1; ch <= book.chapters; ch++) {
      if (state.progress[`${bookId}-${ch}`]?.read) read++;
    }
    return { read, total: book.chapters, percent: Math.round((read / book.chapters) * 100) };
  }, [state.progress]);

  const getOverallProgress = useCallback(() => {
    let read = 0;
    for (const book of BIBLE_BOOKS) {
      for (let ch = 1; ch <= book.chapters; ch++) {
        if (state.progress[`${book.id}-${ch}`]?.read) read++;
      }
    }
    return { read, total: TOTAL_CHAPTERS, percent: Math.round((read / TOTAL_CHAPTERS) * 100) };
  }, [state.progress]);

  const setCurrentPlan = useCallback((planId: string) => {
    setState(prev => ({ ...prev, currentPlan: planId }));
  }, []);

  const setFontSize = useCallback((size: number) => {
    setState(prev => ({ ...prev, fontSize: size }));
  }, []);

  const setDarkMode = useCallback((dark: boolean) => {
    setState(prev => ({ ...prev, darkMode: dark }));
  }, []);

  const setLanguage = useCallback((lang: string) => {
    setState(prev => ({ ...prev, language: lang }));
  }, []);

  const setLastRead = useCallback((bookId: number, chapter: number) => {
    setState(prev => ({ ...prev, lastRead: { bookId, chapter } }));
  }, []);

  return (
    <ReadingProgressContext.Provider value={{
      ...state,
      markChapterRead,
      toggleChapterRead,
      isChapterRead,
      getBookProgress,
      getOverallProgress,
      setCurrentPlan,
      setFontSize,
      setDarkMode,
      setLanguage,
      setLastRead,
    }}>
      {children}
    </ReadingProgressContext.Provider>
  );
}

export function useReadingProgress() {
  const ctx = useContext(ReadingProgressContext);
  if (!ctx) throw new Error('useReadingProgress must be used within ReadingProgressProvider');
  return ctx;
}
