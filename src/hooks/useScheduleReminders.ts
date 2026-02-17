import { useEffect, useCallback } from 'react';
import { useStudies } from '@/contexts/StudiesContext';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';

const NOTIFIED_KEY = 'nwt-schedule-notified';

function getNotified(): Record<string, boolean> {
  try {
    const stored = localStorage.getItem(NOTIFIED_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {};
}

function markNotified(key: string) {
  const current = getNotified();
  current[key] = true;
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify(current));
}

function getTomorrowDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Checks for upcoming visits/studies tomorrow and sends notifications.
 * Also provides in-app reminder data.
 */
export function useScheduleReminders() {
  const { studies } = useStudies();
  const { getTodaysReading } = useReadingProgress();

  const getUpcomingReminders = useCallback(() => {
    const tomorrow = getTomorrowDate();
    const today = getTodayDate();
    const reminders: { type: string; name: string; date: string; time?: string }[] = [];

    studies.forEach(s => {
      if (s.nextVisitDate === tomorrow) {
        reminders.push({
          type: s.type === 'bible-study' ? 'Bible Study' : 'Return Visit',
          name: s.name,
          date: s.nextVisitDate,
          time: s.nextVisitTime,
        });
      }
      if (s.nextVisitDate === today) {
        reminders.push({
          type: s.type === 'bible-study' ? 'Bible Study' : 'Return Visit',
          name: s.name,
          date: s.nextVisitDate,
          time: s.nextVisitTime,
        });
      }
    });

    return reminders;
  }, [studies]);

  // Check and send notifications
  useEffect(() => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

    const check = () => {
      const tomorrow = getTomorrowDate();
      const notified = getNotified();

      studies.forEach(s => {
        if (!s.nextVisitDate) return;
        if (s.nextVisitDate !== tomorrow) return;

        const key = `visit-${s.id}-${tomorrow}`;
        if (notified[key]) return;

        try {
          const typeLabel = s.type === 'bible-study' ? 'Bible Study' : 'Return Visit';
          new Notification(`📅 ${typeLabel} Bukas!`, {
            body: `May scheduled ${typeLabel.toLowerCase()} ka bukas kay ${s.name}${s.nextVisitTime ? ` sa ${s.nextVisitTime}` : ''}.`,
            icon: '/favicon.ico',
            tag: key,
          });
          markNotified(key);
        } catch {}
      });

      // Reading reminder for tomorrow
      const todayReading = getTodaysReading();
      if (todayReading && todayReading.length > 0) {
        const readKey = `reading-${tomorrow}`;
        if (!notified[readKey]) {
          try {
            new Notification('📖 Daily Reading Reminder', {
              body: `May ${todayReading.length} kabanata ka pang babasahin ngayon.`,
              icon: '/favicon.ico',
              tag: readKey,
            });
            markNotified(readKey);
          } catch {}
        }
      }
    };

    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [studies, getTodaysReading]);

  return { getUpcomingReminders };
}
