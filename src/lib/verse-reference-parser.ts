import { BIBLE_BOOKS } from './bible-data';

export interface ParsedReference {
  bookId: number;
  chapter: number;
  verse?: number;
  verseEnd?: number;
  verseList?: number[];
  originalText: string;
}

// Build lookup maps for book name → bookId
const bookNameMap: Map<string, number> = new Map();

BIBLE_BOOKS.forEach(b => {
  bookNameMap.set(b.name.toLowerCase(), b.id);
  bookNameMap.set(b.shortName.toLowerCase(), b.id);
});

const EXTRA_ABBREVIATIONS: Record<string, number> = {
  'gen': 1, 'ex': 2, 'exod': 2, 'lev': 3, 'num': 4, 'deut': 5, 'dt': 5,
  'josh': 6, 'judg': 7, 'jdg': 7, 'ru': 8, '1 sam': 9, '2 sam': 10,
  '1 ki': 11, '2 ki': 12, '1 chr': 13, '2 chr': 14, 'neh': 16, 'est': 17,
  'ps': 19, 'psa': 19, 'psalm': 19, 'prov': 20, 'pr': 20, 'eccl': 21, 'ec': 21,
  'song': 22, 'isa': 23, 'is': 23, 'jer': 24, 'lam': 25, 'ezek': 26, 'eze': 26,
  'dan': 27, 'hos': 28, 'joe': 29, 'am': 30, 'ob': 31, 'obad': 31,
  'jon': 32, 'mic': 33, 'nah': 34, 'hab': 35, 'zeph': 36, 'hag': 37,
  'zech': 38, 'zec': 38, 'mal': 39,
  'matt': 40, 'mt': 40, 'mk': 41, 'lk': 42, 'jn': 43, 'joh': 43,
  'acts': 44, 'rom': 45, '1 cor': 46, '2 cor': 47, 'gal': 48,
  'eph': 49, 'phil': 50, 'col': 51, '1 thess': 52, '2 thess': 53,
  '1 tim': 54, '2 tim': 55, 'tit': 56, 'philem': 57, 'phlm': 57,
  'heb': 58, 'jas': 59, '1 pet': 60, '2 pet': 61,
  '1 jn': 62, '2 jn': 63, '3 jn': 64, 'jude': 65, 'rev': 66,
  // Tagalog abbreviations
  'aw': 19, 'kaw': 20, 'mat': 40, 'mar': 41, 'luc': 42, 'jua': 43,
  'gaw': 44, 'apo': 66,
};

Object.entries(EXTRA_ABBREVIATIONS).forEach(([abbr, id]) => {
  bookNameMap.set(abbr, id);
});

function resolveBookId(name: string): number | null {
  const lower = name.toLowerCase().trim();
  if (bookNameMap.has(lower)) return bookNameMap.get(lower)!;
  
  for (const [key, id] of bookNameMap.entries()) {
    if (key.startsWith(lower) && lower.length >= 3) return id;
  }
  return null;
}

/**
 * Parse comma/range verse lists like "1-5", "1,2", "1, 2, 5-8"
 * Returns array of individual verse numbers.
 */
function parseVerseList(verseStr: string): number[] {
  const verses: number[] = [];
  const parts = verseStr.split(/\s*,\s*/);
  for (const part of parts) {
    const rangeMatch = part.match(/^(\d+)\s*[-–]\s*(\d+)$/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1]);
      const end = parseInt(rangeMatch[2]);
      for (let v = start; v <= end && v < start + 200; v++) {
        verses.push(v);
      }
    } else {
      const num = parseInt(part.trim());
      if (!isNaN(num)) verses.push(num);
    }
  }
  return verses;
}

/**
 * Parse Bible verse references from text content.
 * Handles: "Genesis 1:1", "Mat 3:1-5", "Mat 3:1,2", "Mat 3:1, 2",
 * "1 Cor. 3:16", "Mga Awit 23:1", "Roma 5:12; 6:23", etc.
 */
export function parseVerseReferences(text: string): ParsedReference[] {
  const references: ParsedReference[] = [];
  const seen = new Set<string>();
  
  // Pattern: (optional number prefix) BookName (optional dot) Chapter:Verse(s)
  // Verse part can be: single (3), range (3-5), list (3,5,7), combo (1-3, 5, 7-9)
  const refPattern = /(?:(\d)\s+)?([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ.]+(?:\s+(?:ng|ni)\s+[A-Za-zÀ-ÿ]+)?(?:\s+[A-Za-zÀ-ÿ]+)?)\s*\.?\s+(\d{1,3})\s*:\s*(\d{1,3}(?:\s*[-–]\s*\d{1,3})?(?:\s*,\s*\d{1,3}(?:\s*[-–]\s*\d{1,3})?)*)/g;
  
  let match;
  while ((match = refPattern.exec(text)) !== null) {
    const numPrefix = match[1] || '';
    const bookName = (numPrefix ? numPrefix + ' ' : '') + match[2].replace(/\.$/, '').trim();
    const chapter = parseInt(match[3]);
    const verseStr = match[4];
    
    const bookId = resolveBookId(bookName);
    if (!bookId) continue;
    
    const book = BIBLE_BOOKS.find(b => b.id === bookId);
    if (!book || chapter < 1 || chapter > book.chapters) continue;
    
    const verseList = parseVerseList(verseStr);
    const firstVerse = verseList[0];
    const lastVerse = verseList[verseList.length - 1];
    
    const key = `${bookId}:${chapter}:${verseStr.replace(/\s/g, '')}`;
    if (seen.has(key)) continue;
    seen.add(key);
    
    references.push({
      bookId,
      chapter,
      verse: firstVerse,
      verseEnd: lastVerse !== firstVerse ? lastVerse : undefined,
      verseList: verseList.length > 1 ? verseList : undefined,
      originalText: match[0].trim(),
    });
  }
  
  // Also handle chapter-only references like "Genesis 6"
  const chapterOnlyPattern = /(?:(\d)\s+)?([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ.]+(?:\s+(?:ng|ni)\s+[A-Za-zÀ-ÿ]+)?(?:\s+[A-Za-zÀ-ÿ]+)?)\s*\.?\s+(\d{1,3})(?!\s*[:\d,])/g;
  
  while ((match = chapterOnlyPattern.exec(text)) !== null) {
    const numPrefix = match[1] || '';
    const bookName = (numPrefix ? numPrefix + ' ' : '') + match[2].replace(/\.$/, '').trim();
    const chapter = parseInt(match[3]);
    
    const bookId = resolveBookId(bookName);
    if (!bookId) continue;
    
    const book = BIBLE_BOOKS.find(b => b.id === bookId);
    if (!book || chapter < 1 || chapter > book.chapters) continue;
    
    const key = `${bookId}:${chapter}:`;
    if (seen.has(key)) continue;
    seen.add(key);
    
    references.push({
      bookId,
      chapter,
      originalText: match[0].trim(),
    });
  }
  
  // Handle semicolon-separated follow-up refs like "; 6:23" after "Roma 5:12"
  const semiPattern = /([A-Za-zÀ-ÿ][\w\s.]+?)\s+(\d{1,3})\s*:\s*(\d{1,3}(?:\s*[-–]\s*\d{1,3})?(?:\s*,\s*\d{1,3}(?:\s*[-–]\s*\d{1,3})?)*)(?:\s*;\s*(\d{1,3})\s*:\s*(\d{1,3}(?:\s*[-–]\s*\d{1,3})?(?:\s*,\s*\d{1,3}(?:\s*[-–]\s*\d{1,3})?)*))+/g;
  
  let semiMatch;
  while ((semiMatch = semiPattern.exec(text)) !== null) {
    const numPrefixMatch = semiMatch[1].match(/^(\d)\s+(.*)/);
    const bookName = numPrefixMatch 
      ? numPrefixMatch[1] + ' ' + numPrefixMatch[2].replace(/\.$/, '').trim()
      : semiMatch[1].replace(/\.$/, '').trim();
    const bookId = resolveBookId(bookName);
    if (!bookId) continue;
    const book = BIBLE_BOOKS.find(b => b.id === bookId);
    if (!book) continue;
    
    const fullText = semiMatch[0];
    const semiParts = fullText.split(/;\s*/);
    for (let i = 1; i < semiParts.length; i++) {
      const cvMatch = semiParts[i].match(/(\d{1,3})\s*:\s*(\d{1,3}(?:\s*[-–]\s*\d{1,3})?(?:\s*,\s*\d{1,3}(?:\s*[-–]\s*\d{1,3})?)*)/);
      if (cvMatch) {
        const ch = parseInt(cvMatch[1]);
        const verseStr = cvMatch[2];
        if (ch < 1 || ch > book.chapters) continue;
        
        const key = `${bookId}:${ch}:${verseStr.replace(/\s/g, '')}`;
        if (seen.has(key)) continue;
        seen.add(key);
        
        const verseList = parseVerseList(verseStr);
        references.push({
          bookId, chapter: ch,
          verse: verseList[0],
          verseEnd: verseList[verseList.length - 1] !== verseList[0] ? verseList[verseList.length - 1] : undefined,
          verseList: verseList.length > 1 ? verseList : undefined,
          originalText: semiParts[i].trim(),
        });
      }
    }
  }
  
  return references;
}

/**
 * Convert plain text with verse references into HTML with clickable links.
 */
export function makeReferencesClickable(text: string): string {
  const refs = parseVerseReferences(text);
  if (refs.length === 0) return escapeHtml(text);

  const escaped = escapeHtml(text);

  const sortedRefs = [...refs].sort((a, b) => {
    const idxA = escaped.indexOf(escapeHtml(a.originalText));
    const idxB = escaped.indexOf(escapeHtml(b.originalText));
    return idxB - idxA;
  });

  let result = escaped;
  for (const ref of sortedRefs) {
    const escapedOriginal = escapeHtml(ref.originalText);
    const idx = result.indexOf(escapedOriginal);
    if (idx === -1) continue;

    const before = result.slice(0, idx);
    const after = result.slice(idx + escapedOriginal.length);
    const verseEnd = ref.verseEnd || '';
    const verseListStr = ref.verseList ? ref.verseList.join(',') : '';
    const replacement = `<span class="verse-ref-link" data-book="${ref.bookId}" data-chapter="${ref.chapter}" data-verse="${ref.verse || ''}" data-verse-end="${verseEnd}" data-verse-list="${verseListStr}">${escapedOriginal}</span>`;
    result = before + replacement + after;
  }

  return result;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
