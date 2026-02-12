interface DailyTextEntry {
  date: string; // "MM-DD" format
  title: string;
  content: string;
}

const DAILY_TEXT_CACHE_KEY = 'nwt-daily-text-cache';

let parsedEntries: DailyTextEntry[] | null = null;

export async function loadDailyText(_lang?: string): Promise<void> {
  if (parsedEntries && parsedEntries.length > 0) return;

  // Check cache
  try {
    const cached = localStorage.getItem(DAILY_TEXT_CACHE_KEY);
    if (cached) {
      parsedEntries = JSON.parse(cached);
      if (parsedEntries && parsedEntries.length > 0) return;
    }
  } catch {}

  // No bundled data available — entries remain empty
  parsedEntries = [];
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

export function getDailyTextEntryCount(): number {
  return parsedEntries?.length || 0;
}
