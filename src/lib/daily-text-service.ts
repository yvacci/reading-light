import { supabase } from '@/integrations/supabase/client';

interface DailyTextEntry {
  date: string; // "MM-DD" format
  title: string;
  content: string;
}

const DAILY_TEXT_CACHE_KEY = 'nwt-daily-text-cache';

function getCachedEntries(): Record<string, DailyTextEntry> {
  try {
    const cached = localStorage.getItem(DAILY_TEXT_CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch {}
  return {};
}

function saveCachedEntry(entry: DailyTextEntry) {
  const entries = getCachedEntries();
  entries[entry.date] = entry;
  try {
    localStorage.setItem(DAILY_TEXT_CACHE_KEY, JSON.stringify(entries));
  } catch {}
}

async function fetchDailyTextFromServer(year: number, month: number, day: number): Promise<DailyTextEntry | null> {
  try {
    const { data, error } = await supabase.functions.invoke('daily-text-scrape', {
      body: { year, month, day },
    });

    if (error) {
      console.error('[DailyText] Edge function error:', error);
      return null;
    }

    if (data?.success && data?.data) {
      const entry: DailyTextEntry = data.data;
      saveCachedEntry(entry);
      return entry;
    }

    return null;
  } catch (err) {
    console.error('[DailyText] Fetch error:', err);
    return null;
  }
}

export async function loadDailyText(_lang?: string): Promise<void> {
  // No-op — loading is now on-demand per date
}

export function getTodaysDailyText(): DailyTextEntry | null {
  const now = new Date();
  const mmdd = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const entries = getCachedEntries();
  return entries[mmdd] || null;
}

export function getDailyTextByDate(month: number, day: number): DailyTextEntry | null {
  const mmdd = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const entries = getCachedEntries();
  return entries[mmdd] || null;
}

export async function fetchAndGetDailyText(date: Date): Promise<DailyTextEntry | null> {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  const mmdd = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  // Check cache first
  const entries = getCachedEntries();
  if (entries[mmdd]) return entries[mmdd];

  // Fetch from server
  return fetchDailyTextFromServer(year, month, day);
}

export function getDailyTextEntryCount(): number {
  return Object.keys(getCachedEntries()).length;
}
