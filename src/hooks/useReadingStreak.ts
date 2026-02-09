import { useMemo } from 'react';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getYesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function dateKeyBefore(dateKey: string): string {
  const d = new Date(dateKey + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  readToday: boolean;
  lastReadDate: string | null;
}

export function useReadingStreak(): StreakData {
  const { progress, readingTime } = useReadingProgress();

  return useMemo(() => {
    // Collect all unique dates that had activity (chapters read OR reading time)
    const activeDates = new Set<string>();

    // From progress: dates when chapters were marked read
    Object.values(progress).forEach(p => {
      if (p.read && p.dateRead) {
        activeDates.add(p.dateRead.slice(0, 10));
      }
    });

    // From reading time: dates with any recorded time
    Object.entries(readingTime).forEach(([date, seconds]) => {
      if (seconds > 0) activeDates.add(date);
    });

    if (activeDates.size === 0) {
      return { currentStreak: 0, longestStreak: 0, readToday: false, lastReadDate: null };
    }

    const sortedDates = Array.from(activeDates).sort();
    const today = getTodayKey();
    const yesterday = getYesterdayKey();
    const readToday = activeDates.has(today);

    // Calculate current streak (counting back from today or yesterday)
    let currentStreak = 0;
    let checkDate = readToday ? today : yesterday;

    // Only count streak if there's activity today or yesterday
    if (activeDates.has(checkDate)) {
      while (activeDates.has(checkDate)) {
        currentStreak++;
        checkDate = dateKeyBefore(checkDate);
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let streak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1] + 'T00:00:00');
      const currDate = new Date(sortedDates[i] + 'T00:00:00');
      const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
      } else {
        longestStreak = Math.max(longestStreak, streak);
        streak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, streak, currentStreak);

    const lastReadDate = sortedDates[sortedDates.length - 1];

    return { currentStreak, longestStreak, readToday, lastReadDate };
  }, [progress, readingTime]);
}
