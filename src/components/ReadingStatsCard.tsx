import { motion } from 'framer-motion';
import { BarChart3, Clock, Target } from 'lucide-react';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { t } from '@/lib/i18n';

export default function ReadingStatsCard() {
  const { getOverallProgress, readingTime, progress, currentPlan, readingSpeed, language } = useReadingProgress();
  const overall = getOverallProgress();

  // Average daily reading time (over days that have data)
  const timeEntries = Object.values(readingTime).filter(s => s > 0);
  const avgSeconds = timeEntries.length > 0
    ? Math.round(timeEntries.reduce((a, b) => a + b, 0) / timeEntries.length)
    : 0;
  const avgMinutes = Math.round(avgSeconds / 60);

  // Plan adherence: how many days with activity vs days since first read
  const readDates = new Set<string>();
  Object.values(progress).forEach(p => {
    if (p.read && p.dateRead) readDates.add(p.dateRead.slice(0, 10));
  });
  Object.entries(readingTime).forEach(([date, secs]) => {
    if (secs > 0) readDates.add(date);
  });

  let adherence = 0;
  if (readDates.size > 0) {
    const sorted = Array.from(readDates).sort();
    const first = new Date(sorted[0] + 'T00:00:00');
    const now = new Date();
    const totalDays = Math.max(1, Math.ceil((now.getTime() - first.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    adherence = Math.min(100, Math.round((readDates.size / totalDays) * 100));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12, duration: 0.4 }}
      className="rounded-2xl border border-border bg-card p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold text-foreground">{t('stats.title', language)}</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Chapters completed */}
        <div className="flex flex-col items-center rounded-xl bg-muted/50 p-3">
          <span className="text-2xl font-bold text-primary">{overall.read}</span>
          <span className="text-[10px] text-muted-foreground mt-0.5 text-center leading-tight">
            {t('stats.chaptersCompleted', language)}
          </span>
        </div>

        {/* Avg daily reading time */}
        <div className="flex flex-col items-center rounded-xl bg-muted/50 p-3">
          <span className="text-2xl font-bold text-foreground">
            {avgMinutes}<span className="text-xs font-normal text-muted-foreground ml-0.5">{t('stats.minutes', language)}</span>
          </span>
          <span className="text-[10px] text-muted-foreground mt-0.5 text-center leading-tight">
            {t('stats.avgDailyTime', language)}
          </span>
        </div>

        {/* Plan adherence */}
        <div className="flex flex-col items-center rounded-xl bg-muted/50 p-3">
          <span className="text-2xl font-bold text-success">{adherence}%</span>
          <span className="text-[10px] text-muted-foreground mt-0.5 text-center leading-tight">
            {t('stats.planAdherence', language)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
