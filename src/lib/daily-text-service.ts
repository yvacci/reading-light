import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface DailyTextEntry {
  date: string; // "MM-DD" format
  title: string;
  content: string;
}

const DAILY_TEXT_CACHE_KEY = 'nwt-daily-text-cache';
const DAILY_TEXT_LANG_KEY = 'nwt-daily-text-lang';

let parsedEntries: DailyTextEntry[] | null = null;
let loadedLang: string | null = null;

function getDefaultPath(lang: string): string {
  switch (lang) {
    case 'en': return '/bibles/es26_E.pdf';
    default: return '/bibles/es26_TG.pdf';
  }
}

// Month names for date parsing
const monthNames: Record<string, number> = {
  'enero': 1, 'pebrero': 2, 'marso': 3, 'abril': 4, 'mayo': 5, 'hunyo': 6,
  'hulyo': 7, 'agosto': 8, 'setyembre': 9, 'oktubre': 10, 'nobyembre': 11, 'disyembre': 12,
  'january': 1, 'february': 2, 'march': 3, 'april': 4, 'may': 5, 'june': 6,
  'july': 7, 'august': 8, 'september': 9, 'october': 10, 'november': 11, 'december': 12,
};

// Day names in English and Tagalog
const dayNames = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  'lunes', 'martes', 'miyerkules', 'huwebes', 'biyernes', 'sabado', 'linggo',
];

/**
 * Parse a daily text PDF and extract entries by date.
 */
async function parsePdfForDailyText(data: ArrayBuffer): Promise<DailyTextEntry[]> {
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const entries: DailyTextEntry[] = [];
  
  // Collect all text from all pages
  let allText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    allText += pageText + '\n';
  }

  // Build a regex to find date headers like "Thursday, January 1" or "Huwebes, Enero 1"
  const dayNamesPattern = dayNames.join('|');
  const monthNamesPattern = Object.keys(monthNames).join('|');
  const dateHeaderRegex = new RegExp(
    `(?:${dayNamesPattern})[,\\s]+(?:${monthNamesPattern})\\s+(\\d{1,2})`,
    'gi'
  );

  // Find all date matches and their positions
  const matches: { index: number; month: number; day: number; fullMatch: string }[] = [];
  let match: RegExpExecArray | null;
  while ((match = dateHeaderRegex.exec(allText)) !== null) {
    // Extract month from the match
    const monthMatch = match[0].match(new RegExp(`(${monthNamesPattern})`, 'i'));
    if (monthMatch) {
      const monthNum = monthNames[monthMatch[1].toLowerCase()];
      const dayNum = parseInt(match[1]);
      if (monthNum && dayNum >= 1 && dayNum <= 31) {
        matches.push({
          index: match.index,
          month: monthNum,
          day: dayNum,
          fullMatch: match[0],
        });
      }
    }
  }

  // Extract entries between date headers
  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const nextIndex = i + 1 < matches.length ? matches[i + 1].index : allText.length;
    const entryText = allText.slice(current.index + current.fullMatch.length, nextIndex).trim();

    const mmdd = `${String(current.month).padStart(2, '0')}-${String(current.day).padStart(2, '0')}`;

    // The title is the scripture reference (first line after the date, ending with a book reference)
    // Pattern: text ending with —Book chapter:verse or similar
    const titleMatch = entryText.match(/^[\s]*(.+?[.!?]?\s*—.+?\d+:\d+[^.]*\.?)/s);
    let title = '';
    let content = entryText;

    if (titleMatch) {
      title = titleMatch[1].replace(/\s+/g, ' ').trim();
      content = entryText.slice(titleMatch[0].length).trim();
    } else {
      // Fallback: first sentence
      const firstSentence = entryText.match(/^(.+?[.!?])\s/);
      if (firstSentence) {
        title = firstSentence[1].trim();
        content = entryText.slice(firstSentence[0].length).trim();
      }
    }

    // Clean up content - limit length
    content = content.replace(/\s+/g, ' ').trim().slice(0, 3000);

    if (title || content) {
      entries.push({ date: mmdd, title, content });
    }
  }

  return entries;
}

/**
 * Initialize daily text from bundled PDF or user-uploaded file.
 */
export async function loadDailyText(lang: string = 'tg'): Promise<void> {
  if (parsedEntries && parsedEntries.length > 0 && loadedLang === lang) return;

  // Check for user-uploaded file in IndexedDB
  try {
    const userFile = await getUserUploadedFile();
    if (userFile) {
      parsedEntries = await parsePdfForDailyText(userFile);
      loadedLang = lang;
      if (parsedEntries.length > 0) {
        localStorage.setItem(DAILY_TEXT_CACHE_KEY, JSON.stringify(parsedEntries));
        localStorage.setItem(DAILY_TEXT_LANG_KEY, lang);
        return;
      }
    }
  } catch (err) {
    console.warn('[DailyText] Error loading user file:', err);
  }

  // Check cache
  try {
    const cachedLang = localStorage.getItem(DAILY_TEXT_LANG_KEY);
    if (cachedLang === lang) {
      const cached = localStorage.getItem(DAILY_TEXT_CACHE_KEY);
      if (cached) {
        parsedEntries = JSON.parse(cached);
        loadedLang = lang;
        if (parsedEntries && parsedEntries.length > 0) return;
      }
    }
  } catch {}

  // Load bundled PDF
  try {
    const response = await fetch(getDefaultPath(lang));
    const arrayBuffer = await response.arrayBuffer();
    parsedEntries = await parsePdfForDailyText(arrayBuffer);
    loadedLang = lang;
    if (parsedEntries.length > 0) {
      localStorage.setItem(DAILY_TEXT_CACHE_KEY, JSON.stringify(parsedEntries));
      localStorage.setItem(DAILY_TEXT_LANG_KEY, lang);
    }
    console.log(`[DailyText] Parsed ${parsedEntries.length} entries for lang=${lang}`);
  } catch (err) {
    console.error('[DailyText] Error loading bundled file:', err);
    parsedEntries = [];
    loadedLang = lang;
  }
}

export function getTodaysDailyText(): DailyTextEntry | null {
  if (!parsedEntries || parsedEntries.length === 0) return null;
  const now = new Date();
  const mmdd = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return parsedEntries.find(e => e.date === mmdd) || null;
}

export function getDailyTextByDate(month: number, day: number): DailyTextEntry | null {
  if (!parsedEntries || parsedEntries.length === 0) return null;
  const mmdd = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return parsedEntries.find(e => e.date === mmdd) || null;
}

export async function saveUserUploadedFile(file: File): Promise<number> {
  const arrayBuffer = await file.arrayBuffer();
  const entries = await parsePdfForDailyText(arrayBuffer);

  if (entries.length === 0) {
    throw new Error('Could not parse any daily text entries from the file');
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open('nwt-daily-text', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('files')) {
        db.createObjectStore('files');
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('files', 'readwrite');
      const store = tx.objectStore('files');
      store.put(arrayBuffer, 'uploaded-daily-text');
      tx.oncomplete = () => {
        parsedEntries = entries;
        localStorage.setItem(DAILY_TEXT_CACHE_KEY, JSON.stringify(entries));
        resolve(entries.length);
      };
      tx.onerror = () => reject(tx.error);
    };
    request.onerror = () => reject(request.error);
  });
}

async function getUserUploadedFile(): Promise<ArrayBuffer | null> {
  return new Promise((resolve) => {
    const request = indexedDB.open('nwt-daily-text', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('files')) {
        db.createObjectStore('files');
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('files', 'readonly');
      const store = tx.objectStore('files');
      const getReq = store.get('uploaded-daily-text');
      getReq.onsuccess = () => resolve(getReq.result || null);
      getReq.onerror = () => resolve(null);
    };
    request.onerror = () => resolve(null);
  });
}

export async function clearUserUploadedFile(): Promise<void> {
  parsedEntries = null;
  loadedLang = null;
  localStorage.removeItem(DAILY_TEXT_CACHE_KEY);
  localStorage.removeItem(DAILY_TEXT_LANG_KEY);

  return new Promise((resolve) => {
    const request = indexedDB.open('nwt-daily-text', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('files')) {
        db.createObjectStore('files');
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('files', 'readwrite');
      const store = tx.objectStore('files');
      store.delete('uploaded-daily-text');
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    };
    request.onerror = () => resolve();
  });
}

export function getDailyTextEntryCount(): number {
  return parsedEntries?.length || 0;
}
