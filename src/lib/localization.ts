import { BibleBook, BIBLE_BOOKS } from './bible-data';
import { ENGLISH_BOOK_NAMES } from './bible-data-en';

/**
 * Get the localized name for a Bible book based on the current language.
 * Tagalog names are the default in BIBLE_BOOKS.
 * English names come from the separate mapping.
 */
export function getLocalizedBookName(bookId: number, lang: string): string {
  if (lang === 'en') {
    return ENGLISH_BOOK_NAMES[bookId] || BIBLE_BOOKS.find(b => b.id === bookId)?.name || '';
  }
  // Default: Tagalog (already in BIBLE_BOOKS)
  return BIBLE_BOOKS.find(b => b.id === bookId)?.name || '';
}

/**
 * Get book data with localized name
 */
export function getLocalizedBook(bookId: number, lang: string): (BibleBook & { localizedName: string }) | undefined {
  const book = BIBLE_BOOKS.find(b => b.id === bookId);
  if (!book) return undefined;
  return {
    ...book,
    localizedName: getLocalizedBookName(bookId, lang),
  };
}
