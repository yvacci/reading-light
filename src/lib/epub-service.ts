import JSZip from 'jszip';
import { BIBLE_BOOKS } from '@/lib/bible-data';

interface BookSpineRange {
  bookId: number;
  firstChapterSpineIndex: number;
}

interface SpineEntry {
  index: number;
  href: string;
}

let zip: JSZip | null = null;
let bookRanges: BookSpineRange[] = [];
let spineEntries: SpineEntry[] = [];
let contentPrefix = '';
let initPromise: Promise<void> | null = null;

export async function initEpub(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const response = await fetch('/bibles/nwt_TG.epub');
      const arrayBuffer = await response.arrayBuffer();
      zip = await JSZip.loadAsync(arrayBuffer);

      let opfPath = '';
      const containerXml = await zip.file('META-INF/container.xml')?.async('string');
      if (containerXml) {
        const match = containerXml.match(/full-path="([^"]+\.opf)"/);
        if (match) opfPath = match[1];
      }
      if (!opfPath) {
        for (const p of ['content.opf', 'OEBPS/content.opf', 'OPS/content.opf']) {
          if (zip.file(p)) { opfPath = p; break; }
        }
      }

      contentPrefix = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';

      const opfXml = await zip.file(opfPath)?.async('string');
      if (!opfXml) throw new Error('Could not read OPF');

      const parser = new DOMParser();
      const opfDoc = parser.parseFromString(opfXml, 'application/xml');

      const manifestMap: Record<string, string> = {};
      opfDoc.querySelectorAll('manifest item').forEach(item => {
        const id = item.getAttribute('id') || '';
        const href = item.getAttribute('href') || '';
        manifestMap[id] = href;
      });

      spineEntries = [];
      opfDoc.querySelectorAll('spine itemref').forEach((ref, index) => {
        const idref = ref.getAttribute('idref') || '';
        const href = manifestMap[idref] || '';
        spineEntries.push({ index, href });
      });

      // Phase 1: Find all books that have biblechapternav entries
      bookRanges = [];
      for (let i = 0; i < spineEntries.length; i++) {
        const match = spineEntries[i].href.match(/biblechapternav(\d+)\.xhtml/i);
        if (match) {
          const bookNum = parseInt(match[1]);
          if (bookNum >= 1 && bookNum <= 66) {
            bookRanges.push({ bookId: bookNum, firstChapterSpineIndex: i + 1 });
          }
        }
      }

      // Phase 2: Handle single-chapter books that don't have biblechapternav.
      // In the EPUB, these books appear as (intro-page, content-page) pairs
      // in the spine gap between the preceding and following multi-chapter books.
      const foundIds = new Set(bookRanges.map(r => r.bookId));
      const missingBooks = BIBLE_BOOKS.filter(b => !foundIds.has(b.id));

      if (missingBooks.length > 0) {
        // Group consecutive missing books
        const groups: { books: typeof missingBooks }[] = [];
        let currentGroup: typeof missingBooks = [];

        for (const mb of missingBooks) {
          if (currentGroup.length === 0 || mb.id === currentGroup[currentGroup.length - 1].id + 1) {
            currentGroup.push(mb);
          } else {
            groups.push({ books: [...currentGroup] });
            currentGroup = [mb];
          }
        }
        if (currentGroup.length > 0) {
          groups.push({ books: [...currentGroup] });
        }

        for (const group of groups) {
          const firstMissingId = group.books[0].id;
          const lastMissingId = group.books[group.books.length - 1].id;

          const prevRange = bookRanges
            .filter(r => r.bookId < firstMissingId)
            .sort((a, b) => b.bookId - a.bookId)[0];
          const nextRange = bookRanges
            .filter(r => r.bookId > lastMissingId)
            .sort((a, b) => a.bookId - b.bookId)[0];

          if (prevRange) {
            const prevBookData = BIBLE_BOOKS.find(b => b.id === prevRange.bookId);
            if (prevBookData) {
              const gapStart = prevRange.firstChapterSpineIndex + prevBookData.chapters;
              const gapEnd = nextRange ? nextRange.firstChapterSpineIndex - 1 : spineEntries.length;

              // Each single-chapter book occupies 2 spine entries: intro + content
              let bookIndex = 0;
              for (let s = gapStart; s < gapEnd && bookIndex < group.books.length; s += 2) {
                const contentIndex = s + 1;
                if (contentIndex < spineEntries.length) {
                  bookRanges.push({
                    bookId: group.books[bookIndex].id,
                    firstChapterSpineIndex: contentIndex,
                  });
                }
                bookIndex++;
              }
            }
          }
        }

        bookRanges.sort((a, b) => a.bookId - b.bookId);
      }

      console.log(`[EPUB] ${bookRanges.length}/66 books mapped from ${spineEntries.length} spine items`);
    } catch (err) {
      console.error('[EPUB] Init error:', err);
      initPromise = null;
      throw err;
    }
  })();

  return initPromise;
}

export async function loadChapter(bookId: number, chapter: number): Promise<string | null> {
  await initEpub();
  if (!zip) return null;

  const range = bookRanges.find(r => r.bookId === bookId);
  if (!range) return null;

  const spineIndex = range.firstChapterSpineIndex + chapter - 1;
  const entry = spineEntries[spineIndex];
  if (!entry) return null;

  const filePath = contentPrefix + entry.href;
  const file = zip.file(filePath);
  if (!file) return null;

  const xhtml = await file.async('string');
  if (!xhtml || xhtml.length < 50) return null;

  return extractBody(xhtml);
}

function extractBody(xhtml: string): string {
  const bodyMatch = xhtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let html = bodyMatch ? bodyMatch[1] : xhtml;

  html = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<link[^>]*\/?>/gi, '')
    .replace(/<meta[^>]*\/?>/gi, '')
    .replace(/<img[^>]*>/gi, '');

  return html;
}

export function getDebugInfo(): string {
  let info = `Spine: ${spineEntries.length} items\nBooks: ${bookRanges.length}/66\nPrefix: "${contentPrefix}"\n\n`;
  const foundIds = new Set(bookRanges.map(r => r.bookId));
  const missing = BIBLE_BOOKS.filter(b => !foundIds.has(b.id));
  if (missing.length > 0) {
    info += `MISSING: ${missing.map(b => `${b.id}:${b.name}`).join(', ')}\n\n`;
  }
  for (const range of bookRanges) {
    const book = BIBLE_BOOKS.find(b => b.id === range.bookId);
    const href = spineEntries[range.firstChapterSpineIndex]?.href || '?';
    info += `${(book?.name || `#${range.bookId}`).padEnd(18)} ch1=[${range.firstChapterSpineIndex}] ${href}\n`;
  }
  return info;
}
