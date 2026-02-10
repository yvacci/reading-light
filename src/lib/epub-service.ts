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

interface EpubInstance {
  zip: JSZip;
  bookRanges: BookSpineRange[];
  spineEntries: SpineEntry[];
  contentPrefix: string;
}

let epubInstance: EpubInstance | null = null;
let initPromise: Promise<void> | null = null;

const EPUB_PATH = '/bibles/nwt_TG.epub';

export async function initEpub(_lang?: string): Promise<void> {
  if (epubInstance) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const response = await fetch(EPUB_PATH);
      const arrayBuffer = await response.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);

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

      const contentPrefix = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';

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

      const spineEntries: SpineEntry[] = [];
      opfDoc.querySelectorAll('spine itemref').forEach((ref, index) => {
        const idref = ref.getAttribute('idref') || '';
        const href = manifestMap[idref] || '';
        spineEntries.push({ index, href });
      });

      const bookRanges: BookSpineRange[] = [];
      for (let i = 0; i < spineEntries.length; i++) {
        const match = spineEntries[i].href.match(/biblechapternav(\d+)\.xhtml/i);
        if (match) {
          const bookNum = parseInt(match[1]);
          if (bookNum >= 1 && bookNum <= 66) {
            bookRanges.push({ bookId: bookNum, firstChapterSpineIndex: i + 1 });
          }
        }
      }

      const foundIds = new Set(bookRanges.map(r => r.bookId));
      const missingBooks = BIBLE_BOOKS.filter(b => !foundIds.has(b.id));

      if (missingBooks.length > 0) {
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

      epubInstance = { zip, bookRanges, spineEntries, contentPrefix };
      console.log(`[EPUB] ${bookRanges.length}/66 books mapped from ${spineEntries.length} spine items`);
    } catch (err) {
      console.error('[EPUB] Init error:', err);
      initPromise = null;
      throw err;
    }
  })();

  return initPromise;
}

export async function loadChapter(bookId: number, chapter: number, _lang?: string): Promise<string | null> {
  await initEpub();
  if (!epubInstance) return null;

  const range = epubInstance.bookRanges.find(r => r.bookId === bookId);
  if (!range) return null;

  const spineIndex = range.firstChapterSpineIndex + chapter - 1;
  const entry = epubInstance.spineEntries[spineIndex];
  if (!entry) return null;

  const filePath = epubInstance.contentPrefix + entry.href;
  const file = epubInstance.zip.file(filePath);
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
  if (!epubInstance) return 'EPUB not loaded';

  let info = `Spine: ${epubInstance.spineEntries.length} items\nBooks: ${epubInstance.bookRanges.length}/66\nPrefix: "${epubInstance.contentPrefix}"\n\n`;
  const foundIds = new Set(epubInstance.bookRanges.map(r => r.bookId));
  const missing = BIBLE_BOOKS.filter(b => !foundIds.has(b.id));
  if (missing.length > 0) {
    info += `MISSING: ${missing.map(b => `${b.id}:${b.name}`).join(', ')}\n\n`;
  }
  for (const range of epubInstance.bookRanges) {
    const book = BIBLE_BOOKS.find(b => b.id === range.bookId);
    const href = epubInstance.spineEntries[range.firstChapterSpineIndex]?.href || '?';
    info += `${(book?.name || `#${range.bookId}`).padEnd(18)} ch1=[${range.firstChapterSpineIndex}] ${href}\n`;
  }
  return info;
}
