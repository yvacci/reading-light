/**
 * Export and import all app data for backup/restore.
 */
import { z } from 'zod';

const BACKUP_VERSION = 1;
const MAX_BACKUP_SIZE = 10 * 1024 * 1024; // 10MB

// All localStorage keys used by the app
const LOCAL_STORAGE_KEYS = [
  'nwt-reading-progress',
  'nwt-dark-mode',
  'nwt-font-size',
  'nwt-language',
  'nwt-last-read',
  'nwt-daily-text-cache',
  'nwt-daily-text-lang',
  'nwt-bookmarks',
  'nwt-journal',
  'nwt-journal-entries',
  'nwt-pioneer-data',
  'nwt-studies-data',
  'nwt-highlights',
  'nwt-reading-plan',
  'nwt-reading-streak',
  'nwt-reading-time',
  'nwt-reminder-settings',
  'nwt-theme',
  'nwt-theme-mode',
  'nwt-book-view',
  'nwt-tab-memory',
  'nwt-neko-enabled',
  'nwt-schedule-notified',
];

interface BackupData {
  version: number;
  timestamp: string;
  localStorage: Record<string, string>;
}

/**
 * Export all app data as a .nwt file download.
 */
export function exportBackup(): void {
  const data: BackupData = {
    version: BACKUP_VERSION,
    timestamp: new Date().toISOString(),
    localStorage: {},
  };

  // Collect all localStorage data
  for (const key of LOCAL_STORAGE_KEYS) {
    const value = localStorage.getItem(key);
    if (value !== null) {
      data.localStorage[key] = value;
    }
  }

  // Also grab any keys that match our prefix pattern but aren't in the list
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('nwt-') && !data.localStorage[key]) {
      data.localStorage[key] = localStorage.getItem(key) || '';
    }
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nwt-backup-${new Date().toISOString().slice(0, 10)}.nwt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import app data from a backup file. Returns the number of keys restored.
 */
export async function importBackup(file: File): Promise<number> {
  if (file.size > MAX_BACKUP_SIZE) {
    throw new Error('Backup file too large (max 10MB)');
  }

  const text = await file.text();

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON format');
  }

  const BackupSchema = z.object({
    version: z.number().int().min(1),
    timestamp: z.string(),
    localStorage: z.record(z.string(), z.string()),
  });

  const result = BackupSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error('Invalid backup file structure');
  }

  const data = result.data;

  // Only allow keys with the app prefix
  const entries = Object.entries(data.localStorage).filter(([key]) => key.startsWith('nwt-'));
  if (entries.length === 0) {
    throw new Error('Backup contains no valid app data');
  }

  let count = 0;
  for (const [key, value] of entries) {
    localStorage.setItem(key, value);
    count++;
  }

  return count;
}
