import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'nwt-reminder-settings';

interface ReminderSettings {
  enabled: boolean;
  time: string; // "HH:MM" format
  lastNotifiedDate: string | null;
}

const defaultSettings: ReminderSettings = {
  enabled: false,
  time: '08:00',
  lastNotifiedDate: null,
};

function loadSettings(): ReminderSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
  } catch {}
  return defaultSettings;
}

function saveSettings(settings: ReminderSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function getTodayLocal(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function useReminderNotifications() {
  const [settings, setSettings] = useState<ReminderSettings>(loadSettings);
  const [permissionState, setPermissionState] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  const isSupported = typeof Notification !== 'undefined';

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;
    const result = await Notification.requestPermission();
    setPermissionState(result);
    return result === 'granted';
  }, [isSupported]);

  const enableReminders = useCallback(async () => {
    if (!isSupported) return;
    const granted = await requestPermission();
    if (granted) {
      setSettings(prev => ({ ...prev, enabled: true }));
    }
  }, [isSupported, requestPermission]);

  const disableReminders = useCallback(() => {
    setSettings(prev => ({ ...prev, enabled: false }));
  }, []);

  const setReminderTime = useCallback((time: string) => {
    setSettings(prev => ({ ...prev, time }));
  }, []);

  // Main notification check loop
  useEffect(() => {
    if (!isSupported || permissionState !== 'granted') return;

    const checkAndNotify = () => {
      // Always re-read from localStorage for freshest state
      const current = loadSettings();
      if (!current.enabled) return;

      const todayKey = getTodayLocal();
      if (current.lastNotifiedDate === todayKey) return;

      const now = new Date();
      const [targetHour, targetMinute] = current.time.split(':').map(Number);
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const targetMinutes = targetHour * 60 + targetMinute;

      if (currentMinutes >= targetMinutes) {
        try {
          new Notification('📖 Oras na para Magbasa!', {
            body: 'Naghihintay ang iyong daily Bible reading. Manatiling consistent sa iyong plano!',
            icon: '/favicon.ico',
            tag: 'daily-reading-reminder',
          });
        } catch (e) {
          console.warn('Notification failed:', e);
        }
        const updated: ReminderSettings = { ...current, lastNotifiedDate: todayKey };
        saveSettings(updated);
        setSettings(updated);
      }
    };

    // Check immediately
    checkAndNotify();

    // Check every 30 seconds
    const interval = setInterval(checkAndNotify, 30000);

    // Also check when app becomes visible (crucial for mobile)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkAndNotify();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isSupported, permissionState]); // Minimal dependencies - reads from localStorage

  return {
    isSupported,
    permissionState,
    enabled: settings.enabled,
    reminderTime: settings.time,
    enableReminders,
    disableReminders,
    setReminderTime,
  };
}
