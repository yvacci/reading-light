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

  // Check if we should show a notification
  useEffect(() => {
    if (!settings.enabled || !isSupported || permissionState !== 'granted') return;

    const checkAndNotify = () => {
      const now = new Date();
      const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      
      // Re-read from storage to avoid stale closure
      const current = loadSettings();
      if (current.lastNotifiedDate === todayKey) return;

      const [targetHour, targetMinute] = settings.time.split(':').map(Number);
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      if (currentHour > targetHour || (currentHour === targetHour && currentMinute >= targetMinute)) {
        try {
          new Notification('📖 Oras na para Magbasa!', {
            body: 'Naghihintay ang iyong daily Bible reading. Manatiling consistent sa iyong plano!',
            icon: '/favicon.ico',
            tag: 'daily-reading-reminder',
          });
        } catch (e) {
          // Fallback: some browsers block Notification constructor
          console.warn('Notification failed:', e);
        }
        const updated = { ...settings, lastNotifiedDate: todayKey };
        setSettings(updated);
        saveSettings(updated);
      }
    };

    // Check immediately
    checkAndNotify();

    // Check every 30 seconds for more reliable triggering
    const interval = setInterval(checkAndNotify, 30000);
    return () => clearInterval(interval);
  }, [settings.enabled, settings.time, isSupported, permissionState]);

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
