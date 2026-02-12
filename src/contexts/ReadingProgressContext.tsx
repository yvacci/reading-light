import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BIBLE_BOOKS, TOTAL_CHAPTERS, getPlanOrder, getBookById } from '@/lib/bible-data';

interface ChapterProgress {
  read: boolean;
  dateRead?: string;
}

// Key format: "bookId-chapter" e.g. "1-1" for Genesis 1
type ProgressMap = Record<string, ChapterProgress>;

// Daily reading time in seconds, keyed by ISO date "YYYY-MM-DD"
type ReadingTimeMap = Record<string, number>;

interface ReadingProgressState {
  progress: ProgressMap;
  currentPlan: string;
  readingSpeed: string; // speed id: '1yr', '2yr', '3yr'
  fontSize: number;
  darkMode: boolean;
  language: string;
  lastRead: { bookId: number; chapter: number } | null;
  readingTime: ReadingTimeMap;
}

interface ReadingProgressContextType extends ReadingProgressState {
  markChapterRead: (bookId: number, chapter: number) => void;
  toggleChapterRead: (bookId: number, chapter: number) => void;
  isChapterRead: (bookId: number, chapter: number) => boolean;
  getBookProgress: (bookId: number) => { read: number; total: number; percent: number };
  getOverallProgress: () => { read: number; total: number; percent: number };
  setCurrentPlan: (planId: string) => void;
  setReadingSpeed: (speedId: string) => void;
  setFontSize: (size: number) => void;
  setDarkMode: (dark: boolean) => void;
  setLanguage: (lang: string) => void;
  setLastRead: (bookId: number, chapter: number) => void;
  addReadingTime: (seconds: number) => void;
  getWeeklyReadingData: () => { day: string; minutes: number }[];
  getTodaysReading: () => { bookId: number; chapter: number; bookName: string }[] | null;
  resetProgress: () => void;
}

const STORAGE_KEY = 'nwt-reading-progress';

const defaultState: ReadingProgressState = {
  progress: {},
  currentPlan: 'canonical',
  readingSpeed: '1yr',
  fontSize: 16,
  darkMode: false,
  language: 'tg',
  lastRead: null,
  readingTime: {},
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

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getWeekDates(): string[] {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const ReadingProgressContext = createContext<ReadingProgressContextType | null>(null);

export function ReadingProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ReadingProgressState>(loadState);

  useEffect(() => {
    saveState(state);
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

  const setReadingSpeed = useCallback((speedId: string) => {
    setState(prev => ({ ...prev, readingSpeed: speedId }));
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

  const addReadingTime = useCallback((seconds: number) => {
    setState(prev => {
      const key = getTodayKey();
      return {
        ...prev,
        readingTime: {
          ...prev.readingTime,
          [key]: (prev.readingTime[key] || 0) + seconds,
        },
      };
    });
  }, []);

  const getWeeklyReadingData = useCallback(() => {
    const weekDates = getWeekDates();
    return weekDates.map((date, i) => ({
      day: DAY_LABELS[i],
      minutes: Math.round((state.readingTime[date] || 0) / 60),
    }));
  }, [state.readingTime]);

  const getTodaysReading = useCallback(() => {
    const order = getPlanOrder(state.currentPlan);
    const speedMap: Record<string, number> = { '1yr': 3, '2yr': 2, '3yr': 1 };
    const chaptersPerDay = speedMap[state.readingSpeed] || 3;

    // Find the first unread chapter in the plan order
    const unread = order.filter(ch => !state.progress[`${ch.bookId}-${ch.chapter}`]?.read);
    if (unread.length === 0) return null;

    const todayChapters = unread.slice(0, chaptersPerDay);
    return todayChapters.map(ch => {
      const book = getBookById(ch.bookId);
      return { bookId: ch.bookId, chapter: ch.chapter, bookName: book?.name || '' };
    });
  }, [state.currentPlan, state.readingSpeed, state.progress]);

  const resetProgress = useCallback(() => {
    setState(prev => ({
      ...prev,
      progress: {},
      lastRead: null,
      readingTime: {},
    }));
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
      setReadingSpeed,
      setFontSize,
      setDarkMode,
      setLanguage,
      setLastRead,
      addReadingTime,
      getWeeklyReadingData,
      getTodaysReading,
      resetProgress,
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
