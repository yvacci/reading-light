import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface Bookmark {
  id: string;
  bookId: number;
  chapter: number;
  verseText: string; // snippet of verse content
  note: string;
  color: string; // highlight color
  createdAt: string;
}

interface BookmarksContextType {
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  removeBookmark: (id: string) => void;
  updateBookmark: (id: string, updates: Partial<Pick<Bookmark, 'note' | 'color'>>) => void;
  getBookmarksByChapter: (bookId: number, chapter: number) => Bookmark[];
  isBookmarked: (bookId: number, chapter: number) => boolean;
}

const STORAGE_KEY = 'nwt-bookmarks';

function loadBookmarks(): Bookmark[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveBookmarks(bookmarks: Bookmark[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
}

const BookmarksContext = createContext<BookmarksContextType | null>(null);

export function BookmarksProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(loadBookmarks);

  useEffect(() => {
    saveBookmarks(bookmarks);
  }, [bookmarks]);

  const addBookmark = useCallback((bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: `bm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    setBookmarks(prev => [newBookmark, ...prev]);
  }, []);

  const removeBookmark = useCallback((id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  }, []);

  const updateBookmark = useCallback((id: string, updates: Partial<Pick<Bookmark, 'note' | 'color'>>) => {
    setBookmarks(prev =>
      prev.map(b => (b.id === id ? { ...b, ...updates } : b))
    );
  }, []);

  const getBookmarksByChapter = useCallback(
    (bookId: number, chapter: number) =>
      bookmarks.filter(b => b.bookId === bookId && b.chapter === chapter),
    [bookmarks]
  );

  const isBookmarked = useCallback(
    (bookId: number, chapter: number) =>
      bookmarks.some(b => b.bookId === bookId && b.chapter === chapter),
    [bookmarks]
  );

  return (
    <BookmarksContext.Provider
      value={{ bookmarks, addBookmark, removeBookmark, updateBookmark, getBookmarksByChapter, isBookmarked }}
    >
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks() {
  const ctx = useContext(BookmarksContext);
  if (!ctx) throw new Error('useBookmarks must be used within BookmarksProvider');
  return ctx;
}
