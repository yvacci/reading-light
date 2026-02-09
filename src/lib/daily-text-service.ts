import JSZip from 'jszip';

interface DailyTextEntry {
  date: string; // "MM-DD" format
  title: string;
  content: string;
}

const DAILY_TEXT_CACHE_KEY = 'nwt-daily-text-cache';
const DAILY_TEXT_FILE_KEY = 'nwt-daily-text-file';

let parsedEntries: DailyTextEntry[] | null = null;

/**
 * Get the default bundled daily text path based on language
 */
function getDefaultPath(lang: string): string {
  switch (lang) {
    case 'en': return '/bibles/es26_TG.epub'; // fallback to TG if no EN daily text
    default: return '/bibles/es26_TG.epub';
  }
}

/**
 * Parse a daily text EPUB file and extract entries by date.
 * The EPUB contains daily devotional entries organized by date.
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

  // Get manifest items
  const manifestMap: Record<string, string> = {};
  opfDoc.querySelectorAll('manifest item').forEach(item => {
    const id = item.getAttribute('id') || '';
    const href = item.getAttribute('href') || '';
    manifestMap[id] = href;
  });

  // Get spine items
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

  // Parse each content file
  for (const href of spineHrefs) {
    const filePath = contentPrefix + href;
    const file = zip.file(filePath);
    if (!file) continue;

    const xhtml = await file.async('string');
    if (!xhtml || xhtml.length < 50) continue;

    // Extract body content
    const bodyMatch = xhtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const body = bodyMatch ? bodyMatch[1] : xhtml;

    // Clean HTML to text for parsing
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

    // Try to extract date from the content
    // Pattern: "Enero 1" or "January 1" or similar
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

        // Extract title (usually a scripture reference after the date)
        const afterDate = cleanText.substring(cleanText.indexOf(dateMatch[0]) + dateMatch[0].length).trim();
        
        // First line or scripture reference is the title
        const titleMatch = afterDate.match(/^["""]?([^"""\n.]{5,120})["""]?/);
        const title = titleMatch ? titleMatch[1].trim() : '';
        
        // Rest is the content
        const content = afterDate.slice(title.length).trim().slice(0, 1500);

        entries.push({ date: mmdd, title, content });
      }
    }
  }

  return entries;
}

/**
 * Initialize daily text from bundled EPUB or user-uploaded file
 */
export async function loadDailyText(lang: string = 'tg'): Promise<void> {
  if (parsedEntries && parsedEntries.length > 0) return;

  // Check for cached data first
  try {
    const cached = localStorage.getItem(DAILY_TEXT_CACHE_KEY);
    if (cached) {
      parsedEntries = JSON.parse(cached);
      if (parsedEntries && parsedEntries.length > 0) return;
    }
  } catch {}

  // Check for user-uploaded file in IndexedDB
  try {
    const userFile = await getUserUploadedFile();
    if (userFile) {
      parsedEntries = await parseEpubForDailyText(userFile);
      if (parsedEntries.length > 0) {
        localStorage.setItem(DAILY_TEXT_CACHE_KEY, JSON.stringify(parsedEntries));
        return;
      }
    }
  } catch (err) {
    console.warn('[DailyText] Error loading user file:', err);
  }

  // Load bundled EPUB
  try {
    const response = await fetch(getDefaultPath(lang));
    const arrayBuffer = await response.arrayBuffer();
    parsedEntries = await parseEpubForDailyText(arrayBuffer);
    if (parsedEntries.length > 0) {
      localStorage.setItem(DAILY_TEXT_CACHE_KEY, JSON.stringify(parsedEntries));
    }
    console.log(`[DailyText] Parsed ${parsedEntries.length} entries`);
  } catch (err) {
    console.error('[DailyText] Error loading bundled file:', err);
    parsedEntries = [];
  }
}

/**
 * Get today's daily text entry
 */
export function getTodaysDailyText(): DailyTextEntry | null {
  if (!parsedEntries || parsedEntries.length === 0) return null;
  
  const now = new Date();
  const mmdd = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  return parsedEntries.find(e => e.date === mmdd) || null;
}

/**
 * Get a specific date's daily text
 */
export function getDailyTextByDate(month: number, day: number): DailyTextEntry | null {
  if (!parsedEntries || parsedEntries.length === 0) return null;
  const mmdd = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return parsedEntries.find(e => e.date === mmdd) || null;
}

/**
 * Store user-uploaded file in IndexedDB
 */
export async function saveUserUploadedFile(file: File): Promise<number> {
  const arrayBuffer = await file.arrayBuffer();
  
  // Parse it first to validate
  const entries = await parseEpubForDailyText(arrayBuffer);
  
  if (entries.length === 0) {
    throw new Error('Could not parse any daily text entries from the file');
  }

  // Save to IndexedDB
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
        // Update cache
        parsedEntries = entries;
        localStorage.setItem(DAILY_TEXT_CACHE_KEY, JSON.stringify(entries));
        resolve(entries.length);
      };
      tx.onerror = () => reject(tx.error);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get user-uploaded file from IndexedDB
 */
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

/**
 * Clear user-uploaded daily text and revert to bundled
 */
export async function clearUserUploadedFile(): Promise<void> {
  parsedEntries = null;
  localStorage.removeItem(DAILY_TEXT_CACHE_KEY);
  
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
