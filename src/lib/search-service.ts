import { BIBLE_BOOKS } from '@/lib/bible-data';
import { initEpub, loadChapter } from '@/lib/epub-service';

export interface SearchResult {
  bookId: number;
  bookName: string;
  chapter: number;
  snippet: string;
  matchIndex: number;
}

/**
 * Search across all Bible chapters for a keyword/phrase.
 * Loads chapters on-the-fly from the EPUB and returns matches with snippets.
 */
export async function searchBible(
  query: string,
  lang: string,
  onProgress?: (percent: number) => void
): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  await initEpub(lang);

  const results: SearchResult[] = [];
  const normalizedQuery = query.toLowerCase().trim();
  let processed = 0;
  const totalChapters = BIBLE_BOOKS.reduce((s, b) => s + b.chapters, 0);

  for (const book of BIBLE_BOOKS) {
    for (let ch = 1; ch <= book.chapters; ch++) {
      try {
        const html = await loadChapter(book.id, ch, lang);
        if (html) {
          // Strip HTML tags to get plain text
          const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          const lowerText = text.toLowerCase();
          let searchFrom = 0;

          while (searchFrom < lowerText.length) {
            const idx = lowerText.indexOf(normalizedQuery, searchFrom);
            if (idx === -1) break;

            // Extract snippet around match
            const snippetStart = Math.max(0, idx - 60);
            const snippetEnd = Math.min(text.length, idx + normalizedQuery.length + 60);
            let snippet = text.slice(snippetStart, snippetEnd).trim();
            if (snippetStart > 0) snippet = '…' + snippet;
            if (snippetEnd < text.length) snippet = snippet + '…';

            results.push({
              bookId: book.id,
              bookName: book.name,
              chapter: ch,
              snippet,
              matchIndex: idx,
            });

            searchFrom = idx + normalizedQuery.length;

            // Limit results per chapter to avoid flooding
            if (results.filter(r => r.bookId === book.id && r.chapter === ch).length >= 5) break;
          }
        }
      } catch {
        // Skip chapters that fail to load
      }

      processed++;
      if (onProgress && processed % 20 === 0) {
        onProgress(Math.round((processed / totalChapters) * 100));
      }
    }

    // Stop if we have enough results
    if (results.length >= 100) break;
  }

  onProgress?.(100);
  return results;
}
