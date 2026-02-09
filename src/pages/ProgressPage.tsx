import { motion } from 'framer-motion';
import { BIBLE_BOOKS } from '@/lib/bible-data';
import { getLocalizedBookName } from '@/lib/localization';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { Progress } from '@/components/ui/progress';
import PageHeader from '@/components/PageHeader';
import WeeklyCalendarChart from '@/components/WeeklyCalendarChart';

export default function ProgressPage() {
  const { getOverallProgress, getBookProgress, language } = useReadingProgress();
  const overall = getOverallProgress();

  const otBooks = BIBLE_BOOKS.filter(b => b.testament === 'OT');
  const ntBooks = BIBLE_BOOKS.filter(b => b.testament === 'NT');

  const otRead = otBooks.reduce((s, b) => s + getBookProgress(b.id).read, 0);
  const otTotal = otBooks.reduce((s, b) => s + b.chapters, 0);
  const ntRead = ntBooks.reduce((s, b) => s + getBookProgress(b.id).read, 0);
  const ntTotal = ntBooks.reduce((s, b) => s + b.chapters, 0);

  return (
    <div className="min-h-screen pb-20">
      <PageHeader title="Progress" subtitle="Your reading journey" />

      <div className="space-y-4 px-4 pt-4">
        {/* Overall */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center rounded-2xl border border-border bg-card p-6"
        >
          <div className="relative flex h-28 w-28 items-center justify-center">
            <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke="hsl(var(--primary))" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${overall.percent * 2.64} 264`}
                className="transition-all duration-700"
              />
            </svg>
            <span className="text-2xl font-bold text-foreground">{overall.percent}%</span>
          </div>
          <p className="mt-3 text-sm font-medium text-foreground">Overall Progress</p>
          <p className="text-xs text-muted-foreground">{overall.read} / {overall.total} chapters</p>
        </motion.div>

        {/* Weekly Calendar Chart */}
        <WeeklyCalendarChart />

        {/* Testament stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="text-[10px] font-medium text-muted-foreground">
              {language === 'en' ? 'Hebrew Scriptures' : 'Hebreong Kasulatan'}
            </p>
            <p className="text-lg font-bold text-foreground">{Math.round((otRead / otTotal) * 100)}%</p>
            <Progress value={(otRead / otTotal) * 100} className="mt-1 h-1.5" />
            <p className="mt-1 text-[10px] text-muted-foreground">{otRead}/{otTotal}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="text-[10px] font-medium text-muted-foreground">
              {language === 'en' ? 'Greek Scriptures' : 'Kristiyanong Griegong Kasulatan'}
            </p>
            <p className="text-lg font-bold text-foreground">{Math.round((ntRead / ntTotal) * 100)}%</p>
            <Progress value={(ntRead / ntTotal) * 100} className="mt-1 h-1.5" />
            <p className="mt-1 text-[10px] text-muted-foreground">{ntRead}/{ntTotal}</p>
          </div>
        </div>

        {/* Per book */}
        <h2 className="pt-2 text-sm font-semibold text-foreground">By Book</h2>
        <div className="space-y-1">
          {BIBLE_BOOKS.map(book => {
            const prog = getBookProgress(book.id);
            if (prog.read === 0) return null;
            return (
              <div key={book.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                <span className="w-24 truncate text-xs font-medium text-foreground">
                  {getLocalizedBookName(book.id, language)}
                </span>
                <Progress value={prog.percent} className="h-1.5 flex-1" />
                <span className="text-[10px] text-muted-foreground w-10 text-right">{prog.percent}%</span>
              </div>
            );
          })}
          {BIBLE_BOOKS.every(b => getBookProgress(b.id).read === 0) && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Start reading to see your progress here!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
