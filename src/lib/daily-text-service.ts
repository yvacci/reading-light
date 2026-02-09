import JSZip from 'jszip';

interface DailyTextEntry {
  date: string; // "MM-DD" format
  title: string;
  content: string;
}

const DAILY_TEXT_CACHE_KEY = 'nwt-daily-text-cache';
const DAILY_TEXT_LANG_KEY = 'nwt-daily-text-lang';

let parsedEntries: DailyTextEntry[] | null = null;
let loadedLang: string | null = null;

/**
 * Get the default bundled daily text path based on language
 */
function getDefaultPath(lang: string): string {
  switch (lang) {
    case 'en': return '/bibles/es26_E.epub';
    default: return '/bibles/es26_TG.epub';
  }
}

/**
 * Parse a daily text EPUB file and extract entries by date.
 */
async function parseEpubForDailyText(arrayBuffer: ArrayBuffer): Promise<DailyTextEntry[]> {
  const zip = await JSZip.loadAsync(arrayBuffer);
  const entries: DailyTextEntry[] = [];

  // Find the OPF file
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
  if (!opfXml) return entries;

  const parser = new DOMParser();
  const opfDoc = parser.parseFromString(opfXml, 'application/xml');

  const manifestMap: Record<string, string> = {};
  opfDoc.querySelectorAll('manifest item').forEach(item => {
    const id = item.getAttribute('id') || '';
    const href = item.getAttribute('href') || '';
    manifestMap[id] = href;
  });

  const spineHrefs: string[] = [];
  opfDoc.querySelectorAll('spine itemref').forEach(ref => {
    const idref = ref.getAttribute('idref') || '';
    if (manifestMap[idref]) spineHrefs.push(manifestMap[idref]);
  });

  // Month names in Tagalog and English for date parsing
  const monthNames: Record<string, number> = {
    'enero': 1, 'pebrero': 2, 'marso': 3, 'abril': 4, 'mayo': 5, 'hunyo': 6,
    'hulyo': 7, 'agosto': 8, 'setyembre': 9, 'oktubre': 10, 'nobyembre': 11, 'disyembre': 12,
    'january': 1, 'february': 2, 'march': 3, 'april': 4, 'may': 5, 'june': 6,
    'july': 7, 'august': 8, 'september': 9, 'october': 10, 'november': 11, 'december': 12,
  };

  for (const href of spineHrefs) {
    const filePath = contentPrefix + href;
    const file = zip.file(filePath);
    if (!file) continue;

    const xhtml = await file.async('string');
    if (!xhtml || xhtml.length < 50) continue;

    const bodyMatch = xhtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const body = bodyMatch ? bodyMatch[1] : xhtml;

    const cleanText = body
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#\d+;/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanText.length < 20) continue;

    const datePattern = new RegExp(
      `(${Object.keys(monthNames).join('|')})\\s+(\\d{1,2})`,
      'i'
    );
    const dateMatch = cleanText.match(datePattern);

    if (dateMatch) {
      const monthName = dateMatch[1].toLowerCase();
      const day = parseInt(dateMatch[2]);
      const month = monthNames[monthName];

      if (month && day >= 1 && day <= 31) {
        const mmdd = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const afterDate = cleanText.substring(cleanText.indexOf(dateMatch[0]) + dateMatch[0].length).trim();
        
        // Extract title: look for quoted text or first sentence (more generous matching)
        const titleMatch = afterDate.match(/^["""\u201C]?([^"""\u201D\n]{5,200})["""\u201D]?/);
        const title = titleMatch ? titleMatch[1].trim().replace(/["""\u201C\u201D]/g, '') : '';
        
        // Get full remaining content (increased limit to capture all text)
        const contentStart = title.length > 0 ? afterDate.indexOf(title) + title.length : 0;
        const content = afterDate.slice(contentStart).trim().replace(/^["""\u201C\u201D.,;\s]+/, '').slice(0, 3000);

        entries.push({ date: mmdd, title, content });
      }
    }
  }

  return entries;
}

/**
 * Initialize daily text from bundled EPUB or user-uploaded file.
 * Now respects the language parameter to load the correct bundled file.
 */
export async function loadDailyText(lang: string = 'tg'): Promise<void> {
  // If already loaded for this language, skip
  if (parsedEntries && parsedEntries.length > 0 && loadedLang === lang) return;

  // Check for user-uploaded file in IndexedDB (user uploads override language)
  try {
    const userFile = await getUserUploadedFile();
    if (userFile) {
      parsedEntries = await parseEpubForDailyText(userFile);
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

  // Check cache for matching language
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

  // Load bundled EPUB based on language
  try {
    const response = await fetch(getDefaultPath(lang));
    const arrayBuffer = await response.arrayBuffer();
    parsedEntries = await parseEpubForDailyText(arrayBuffer);
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
  const entries = await parseEpubForDailyText(arrayBuffer);
  
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
