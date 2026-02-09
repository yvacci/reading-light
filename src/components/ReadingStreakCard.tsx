import { motion } from 'framer-motion';
import { Flame, Trophy, Calendar } from 'lucide-react';
import { useReadingStreak } from '@/hooks/useReadingStreak';

export default function ReadingStreakCard() {
  const { currentStreak, longestStreak, readToday } = useReadingStreak();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12, duration: 0.4 }}
      className="rounded-2xl border border-border bg-card p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Flame className={`h-4 w-4 ${currentStreak > 0 ? 'text-[hsl(var(--warning))]' : 'text-muted-foreground'}`} />
        <span className="text-xs font-semibold text-foreground">Reading Streak</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Current streak */}
        <div className="flex flex-col items-center rounded-xl bg-muted/50 p-3">
          <span className={`text-2xl font-bold ${currentStreak > 0 ? 'text-[hsl(var(--warning))]' : 'text-muted-foreground'}`}>
            {currentStreak}
          </span>
          <span className="text-[10px] text-muted-foreground mt-0.5">Current</span>
        </div>

        {/* Longest streak */}
        <div className="flex flex-col items-center rounded-xl bg-muted/50 p-3">
          <span className="text-2xl font-bold text-primary">{longestStreak}</span>
          <span className="text-[10px] text-muted-foreground mt-0.5">Best</span>
        </div>

        {/* Today status */}
        <div className="flex flex-col items-center rounded-xl bg-muted/50 p-3">
          <div className={`text-2xl ${readToday ? '🔥' : '📖'}`} />
          <span className="text-[10px] text-muted-foreground mt-0.5">
            {readToday ? 'Done!' : 'Read today'}
          </span>
        </div>
      </div>

      {!readToday && currentStreak > 0 && (
        <p className="mt-3 text-[10px] text-center text-[hsl(var(--warning))]">
          Read today to keep your {currentStreak}-day streak alive! 🔥
        </p>
      )}

      {!readToday && currentStreak === 0 && (
        <p className="mt-3 text-[10px] text-center text-muted-foreground">
          Start reading today to begin a new streak!
        </p>
      )}
    </motion.div>
  );
}
