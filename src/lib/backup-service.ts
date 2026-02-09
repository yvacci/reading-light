/**
 * Export and import all app data for backup/restore.
 */

const BACKUP_VERSION = 1;

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
  'nwt-journal-entries',
  'nwt-pioneer-data',
  'nwt-studies-data',
  'nwt-highlights',
  'nwt-reading-plan',
  'nwt-reading-streak',
  'nwt-reading-time',
  'nwt-reminder-enabled',
  'nwt-reminder-time',
];

interface BackupData {
  version: number;
  timestamp: string;
  localStorage: Record<string, string>;
}

/**
 * Export all app data as a JSON file download.
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
  a.download = `nwt-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import app data from a backup JSON file. Returns the number of keys restored.
 */
export async function importBackup(file: File): Promise<number> {
  const text = await file.text();
  const data: BackupData = JSON.parse(text);

  if (!data.version || !data.localStorage) {
    throw new Error('Invalid backup file format');
  }

  let count = 0;
  for (const [key, value] of Object.entries(data.localStorage)) {
    localStorage.setItem(key, value);
    count++;
  }

  return count;
}
