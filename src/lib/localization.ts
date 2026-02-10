import { BIBLE_BOOKS } from './bible-data';

/**
 * Get the book name — always Tagalog (from BIBLE_BOOKS).
 * The lang parameter is kept for API compatibility but ignored.
 */
export function getLocalizedBookName(bookId: number, _lang?: string): string {
  return BIBLE_BOOKS.find(b => b.id === bookId)?.name || '';
}

/**
 * Get book data with localized name
 */
export function getLocalizedBook(bookId: number, _lang?: string) {
  const book = BIBLE_BOOKS.find(b => b.id === bookId);
  if (!book) return undefined;
  return {
    ...book,
    localizedName: book.name,
  };
}
