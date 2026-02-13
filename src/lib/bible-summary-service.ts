import { supabase } from '@/integrations/supabase/client';

interface BookSummary {
  title: string;
  summary: string;
  outline?: ChapterOutline[];
}

interface ChapterOutline {
  heading: string;
  verses: string;
}

const BOOK_SUMMARY_CACHE_KEY = 'nwt-book-summary-cache';
const CHAPTER_OUTLINE_CACHE_KEY = 'nwt-chapter-outline-cache';

function getBookSummaryCache(): Record<string, BookSummary> {
  try {
    const cached = localStorage.getItem(BOOK_SUMMARY_CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch {}
  return {};
}

function saveBookSummary(bookNum: number, data: BookSummary) {
  const cache = getBookSummaryCache();
  cache[String(bookNum)] = data;
  try {
    localStorage.setItem(BOOK_SUMMARY_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

function getChapterOutlineCache(): Record<string, ChapterOutline[]> {
  try {
    const cached = localStorage.getItem(CHAPTER_OUTLINE_CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch {}
  return {};
}

function saveChapterOutline(bookNum: number, chapter: number, data: ChapterOutline[]) {
  const cache = getChapterOutlineCache();
  cache[`${bookNum}-${chapter}`] = data;
  try {
    localStorage.setItem(CHAPTER_OUTLINE_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

export async function fetchBookSummary(bookNum: number): Promise<BookSummary | null> {
  // Check cache
  const cache = getBookSummaryCache();
  if (cache[String(bookNum)]) return cache[String(bookNum)];

  try {
    const { data, error } = await supabase.functions.invoke('bible-summary-scrape', {
      body: { bookNum },
    });

    if (error || !data?.success) {
      console.error('[BibleSummary] Error:', error || data?.error);
      return null;
    }

    const result: BookSummary = {
      title: data.data.title || '',
      summary: data.data.summary || '',
      outline: data.data.outline || [],
    };
    saveBookSummary(bookNum, result);
    return result;
  } catch (err) {
    console.error('[BibleSummary] Fetch error:', err);
    return null;
  }
}

export async function fetchChapterOutline(bookNum: number, chapter: number): Promise<ChapterOutline[]> {
  // Check cache
  const cache = getChapterOutlineCache();
  const key = `${bookNum}-${chapter}`;
  if (cache[key]) return cache[key];

  try {
    const { data, error } = await supabase.functions.invoke('bible-summary-scrape', {
      body: { bookNum, chapter },
    });

    if (error || !data?.success) {
      console.error('[ChapterOutline] Error:', error || data?.error);
      return [];
    }

    const outline: ChapterOutline[] = data.data.outline || [];
    saveChapterOutline(bookNum, chapter, outline);
    return outline;
  } catch (err) {
    console.error('[ChapterOutline] Fetch error:', err);
    return [];
  }
}

export function getCachedBookSummary(bookNum: number): BookSummary | null {
  const cache = getBookSummaryCache();
  return cache[String(bookNum)] || null;
}

export function getCachedChapterOutline(bookNum: number, chapter: number): ChapterOutline[] | null {
  const cache = getChapterOutlineCache();
  return cache[`${bookNum}-${chapter}`] || null;
}
