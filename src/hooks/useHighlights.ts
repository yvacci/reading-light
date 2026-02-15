import { useState, useEffect, useCallback } from 'react';

export interface Highlight {
  id: string;
  bookId: number;
  chapter: number;
  verseStart: number;
  verseEnd: number;
  color: string;
  text: string;
  createdAt: string;
}

const STORAGE_KEY = 'nwt-highlights';

// Lighter shades for readability
export const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: '#FFFF99' },
  { name: 'Green', value: '#90EE90' },
  { name: 'Blue', value: '#ADD8E6' },
  { name: 'Purple', value: '#DDA0DD' },
  { name: 'Pink', value: '#FFB6C1' },
  { name: 'Orange', value: '#FFDAB9' },
] as const;

function loadHighlights(): Highlight[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveHighlights(highlights: Highlight[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(highlights));
}

export function useHighlights() {
  const [highlights, setHighlights] = useState<Highlight[]>(loadHighlights);

  useEffect(() => {
    saveHighlights(highlights);
  }, [highlights]);

  const addHighlight = useCallback((highlight: Omit<Highlight, 'id' | 'createdAt'>) => {
    const newHighlight: Highlight = {
      ...highlight,
      id: `hl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    setHighlights(prev => [newHighlight, ...prev]);
    return newHighlight;
  }, []);

  const removeHighlight = useCallback((id: string) => {
    setHighlights(prev => prev.filter(h => h.id !== id));
  }, []);

  const getChapterHighlights = useCallback((bookId: number, chapter: number) => {
    return highlights.filter(h => h.bookId === bookId && h.chapter === chapter);
  }, [highlights]);

  const updateHighlightColor = useCallback((id: string, color: string) => {
    setHighlights(prev =>
      prev.map(h => h.id === id ? { ...h, color } : h)
    );
  }, []);

  return {
    highlights,
    addHighlight,
    removeHighlight,
    getChapterHighlights,
    updateHighlightColor,
  };
}
