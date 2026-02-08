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
let contentPrefix = ''; // e.g. "OEBPS/" or ""
let initPromise: Promise<void> | null = null;

export async function initEpub(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const response = await fetch('/bibles/nwt_TG.epub');
      const arrayBuffer = await response.arrayBuffer();
      zip = await JSZip.loadAsync(arrayBuffer);

      // Find content.opf to get spine order
      let opfPath = '';
      const containerXml = await zip.file('META-INF/container.xml')?.async('string');
      if (containerXml) {
        const match = containerXml.match(/full-path="([^"]+\.opf)"/);
        if (match) opfPath = match[1];
      }
      if (!opfPath) {
        // Try common paths
        for (const p of ['content.opf', 'OEBPS/content.opf', 'OPS/content.opf']) {
          if (zip.file(p)) { opfPath = p; break; }
        }
      }

      contentPrefix = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';
      console.log(`[EPUB] OPF: ${opfPath}, prefix: "${contentPrefix}"`);

      const opfXml = await zip.file(opfPath)?.async('string');
      if (!opfXml) throw new Error('Could not read OPF');

      // Parse OPF to get manifest and spine
      const parser = new DOMParser();
      const opfDoc = parser.parseFromString(opfXml, 'application/xml');

      // Build manifest map: id -> href
      const manifestMap: Record<string, string> = {};
      opfDoc.querySelectorAll('manifest item').forEach(item => {
        const id = item.getAttribute('id') || '';
        const href = item.getAttribute('href') || '';
        manifestMap[id] = href;
      });

      // Build spine order
      spineEntries = [];
      opfDoc.querySelectorAll('spine itemref').forEach((ref, index) => {
        const idref = ref.getAttribute('idref') || '';
        const href = manifestMap[idref] || '';
        spineEntries.push({ index, href });
      });

      console.log(`[EPUB] ${spineEntries.length} spine items, ${Object.keys(manifestMap).length} manifest items`);

      // Find biblechapternav entries to map books
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

      console.log(`[EPUB] ${bookRanges.length} book ranges found`);
      const g = bookRanges.find(r => r.bookId === 1);
      if (g) console.log(`[EPUB] Genesis ch1 = spine[${g.firstChapterSpineIndex}] "${spineEntries[g.firstChapterSpineIndex]?.href}"`);
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
  console.log(`[EPUB] Reading "${filePath}"`);

  const file = zip.file(filePath);
  if (!file) {
    console.warn(`[EPUB] File not found: "${filePath}"`);
    return null;
  }

  const xhtml = await file.async('string');
  if (!xhtml || xhtml.length < 50) return null;

  console.log(`[EPUB] Got ${xhtml.length} chars`);
  return extractBody(xhtml);
}

function extractBody(xhtml: string): string {
  const bodyMatch = xhtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let html = bodyMatch ? bodyMatch[1] : xhtml;

  // Clean up
  html = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<link[^>]*\/?>/gi, '')
    .replace(/<meta[^>]*\/?>/gi, '')
    .replace(/<img[^>]*>/gi, '');

  return html;
}

export function getDebugInfo(): string {
  let info = `Spine: ${spineEntries.length} items\nBooks: ${bookRanges.length}\nPrefix: "${contentPrefix}"\n\n`;
  for (const range of bookRanges) {
    const book = BIBLE_BOOKS.find(b => b.id === range.bookId);
    const href = spineEntries[range.firstChapterSpineIndex]?.href || '?';
    info += `${(book?.name || `#${range.bookId}`).padEnd(18)} ch1=[${range.firstChapterSpineIndex}] ${href}\n`;
  }
  return info;
}
