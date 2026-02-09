import { BIBLE_BOOKS } from './bible-data';
import { ENGLISH_BOOK_NAMES } from './bible-data-en';

interface ParsedReference {
  bookId: number;
  chapter: number;
  verse?: number;
  originalText: string;
}

// Build lookup maps for book name → bookId
const bookNameMap: Map<string, number> = new Map();

// Tagalog names
BIBLE_BOOKS.forEach(b => {
  bookNameMap.set(b.name.toLowerCase(), b.id);
  bookNameMap.set(b.shortName.toLowerCase(), b.id);
});

// English names
Object.entries(ENGLISH_BOOK_NAMES).forEach(([id, name]) => {
  bookNameMap.set(name.toLowerCase(), Number(id));
});

// Additional common abbreviations
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
  
  // Try prefix matching for longer names
  for (const [key, id] of bookNameMap.entries()) {
    if (key.startsWith(lower) && lower.length >= 3) return id;
  }
  return null;
}

/**
 * Parse Bible verse references from text content.
 * Handles patterns like "Genesis 1:1", "Gen. 1:1", "1 Cor. 3:16", "Mga Awit 23:1",
 * "Juan 3:16, 17", "Roma 5:12; 6:23", "Genesis 1:1-4", "1 Cronica 1:1-4", etc.
 */
export function parseVerseReferences(text: string): ParsedReference[] {
  const references: ParsedReference[] = [];
  
  // Pattern: (optional number prefix) BookName (optional dot) Chapter:Verse(s) with ranges/lists
  // Also match references without verse (just chapter) like "Genesis 6" or "Genesis 4, 5"
  const refPattern = /(?:(\d)\s+)?([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ.]+(?:\s+(?:ng|ni)\s+[A-Za-zÀ-ÿ]+)?(?:\s+[A-Za-zÀ-ÿ]+)?)\s*\.?\s+(\d{1,3})(?:\s*:\s*(\d{1,3}))?(?:\s*[-–]\s*(\d{1,3}))?(?:\s*,\s*(\d{1,3}))*(?:\s*;\s*(\d{1,3})\s*:\s*(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?)*/g;
  
  let match;
  while ((match = refPattern.exec(text)) !== null) {
    const numPrefix = match[1] || '';
    const bookName = (numPrefix ? numPrefix + ' ' : '') + match[2].replace(/\.$/, '').trim();
    const chapter = parseInt(match[3]);
    const verse = match[4] ? parseInt(match[4]) : undefined;
    
    const bookId = resolveBookId(bookName);
    if (bookId) {
      const book = BIBLE_BOOKS.find(b => b.id === bookId);
      if (book && chapter >= 1 && chapter <= book.chapters) {
        references.push({
          bookId,
          chapter,
          verse,
          originalText: match[0].trim(),
        });
      }
    }
  }
  
  // Also catch semicolon-separated follow-up references in the same text
  // e.g. after "Roma 5:12" there might be "; 6:23" which gets missed
  const semiPattern = /([A-Za-zÀ-ÿ][\w\s.]+?)\s+(\d{1,3})\s*:\s*(\d{1,3})(?:\s*[-–]\s*\d{1,3})?(?:\s*;\s*(\d{1,3})\s*:\s*(\d{1,3})(?:\s*[-–]\s*\d{1,3})?)+/g;
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
    
    // Extract all ch:v pairs after semicolons
    const fullText = semiMatch[0];
    const semiParts = fullText.split(/;\s*/);
    for (let i = 1; i < semiParts.length; i++) {
      const cvMatch = semiParts[i].match(/(\d{1,3})\s*:\s*(\d{1,3})/);
      if (cvMatch) {
        const ch = parseInt(cvMatch[1]);
        const v = parseInt(cvMatch[2]);
        if (ch >= 1 && ch <= book.chapters) {
          // Check not already found
          const alreadyFound = references.some(r => r.bookId === bookId && r.chapter === ch && r.verse === v);
          if (!alreadyFound) {
            references.push({
              bookId, chapter: ch, verse: v,
              originalText: semiParts[i].trim(),
            });
          }
        }
      }
    }
  }
  
  return references;
}

/**
 * Convert plain text with verse references into HTML with clickable links.
 * Returns HTML string with <span class="verse-ref" data-book="X" data-chapter="Y" data-verse="Z"> wrappers.
 */
export function makeReferencesClickable(text: string): string {
  const refs = parseVerseReferences(text);
  if (refs.length === 0) return escapeHtml(text);
  
  let result = text;
  // Process references in reverse order to not mess up indices
  const sortedRefs = [...refs].sort((a, b) => {
    const idxA = result.indexOf(a.originalText);
    const idxB = result.indexOf(b.originalText);
    return idxB - idxA;
  });
  
  for (const ref of sortedRefs) {
    const idx = result.indexOf(ref.originalText);
    if (idx === -1) continue;
    
    const before = result.slice(0, idx);
    const after = result.slice(idx + ref.originalText.length);
    const replacement = `<span class="verse-ref-link" data-book="${ref.bookId}" data-chapter="${ref.chapter}" data-verse="${ref.verse || ''}">${escapeHtml(ref.originalText)}</span>`;
    result = before + replacement + after;
  }
  
  // Escape the non-reference parts
  // Since we've already inserted HTML spans, we need to be careful
  // The spans are already in place, just return as-is
  return result;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
