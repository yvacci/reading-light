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
      const todayKey = now.toISOString().slice(0, 10);
      
      // Already notified today
      if (settings.lastNotifiedDate === todayKey) return;

      const [targetHour, targetMinute] = settings.time.split(':').map(Number);
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Check if current time is past the reminder time
      if (currentHour > targetHour || (currentHour === targetHour && currentMinute >= targetMinute)) {
        // Show notification
        new Notification('📖 Time to Read!', {
          body: 'Your daily Bible reading is waiting. Stay consistent with your plan!',
          icon: '/favicon.ico',
          tag: 'daily-reading-reminder',
        });
        setSettings(prev => ({ ...prev, lastNotifiedDate: todayKey }));
      }
    };

    // Check immediately
    checkAndNotify();

    // Check every minute
    const interval = setInterval(checkAndNotify, 60000);
    return () => clearInterval(interval);
  }, [settings.enabled, settings.time, settings.lastNotifiedDate, isSupported, permissionState]);

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
