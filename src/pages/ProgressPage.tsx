import { motion } from 'framer-motion';
import { BIBLE_BOOKS } from '@/lib/bible-data';
import { getLocalizedBookName } from '@/lib/localization';
import { t } from '@/lib/i18n';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { useStudies } from '@/contexts/StudiesContext';
import { Progress } from '@/components/ui/progress';
import PageHeader from '@/components/PageHeader';
import WeeklyCalendarChart from '@/components/WeeklyCalendarChart';
import ReadingStatsCard from '@/components/ReadingStatsCard';
import { Clock, BookOpen, Users, MapPin, ExternalLink, Calendar } from 'lucide-react';

function UpcomingVisitsCard() {
  const { studies } = useStudies();

  const upcoming = studies
    .filter(s => s.nextVisitDate)
    .sort((a, b) => (a.nextVisitDate || '').localeCompare(b.nextVisitDate || ''))
    .slice(0, 8);

  if (upcoming.length === 0) return null;

  const today = new Date().toISOString().slice(0, 10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="rounded-2xl border border-border bg-card p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold text-foreground">Mga Susunod na Bisita</span>
      </div>
      <div className="space-y-2">
        {upcoming.map(s => {
          const isPast = s.nextVisitDate! < today;
          const isToday = s.nextVisitDate === today;
          return (
            <div key={s.id} className={`flex items-start gap-2.5 rounded-xl p-2.5 ${
              isToday ? 'bg-primary/10' : isPast ? 'bg-destructive/5' : 'bg-muted/50'
            }`}>
              <div className="shrink-0 mt-0.5">
                {s.type === 'bible-study'
                  ? <BookOpen className="h-3.5 w-3.5 text-primary" />
                  : <Users className="h-3.5 w-3.5 text-accent" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{s.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className={`text-[10px] font-medium ${
                    isToday ? 'text-primary' : isPast ? 'text-destructive' : 'text-muted-foreground'
                  }`}>
                    {isToday ? 'Ngayon' : isPast ? 'Lampas na' : new Date(s.nextVisitDate + 'T12:00:00').toLocaleDateString()}
                    {s.nextVisitTime && ` ${s.nextVisitTime}`}
                  </span>
                </div>
                {s.address && (
                  <button
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}`, '_blank')}
                    className="flex items-center gap-1 mt-0.5 group"
                  >
                    <MapPin className="h-2.5 w-2.5 text-primary" />
                    <span className="text-[10px] text-primary group-hover:underline truncate">{s.address}</span>
                    <ExternalLink className="h-2 w-2 text-primary/60 shrink-0" />
                  </button>
                )}
              </div>
              <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${
                s.type === 'bible-study' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
              }`}>
                {s.type === 'bible-study' ? 'BS' : 'RV'}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

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
      <PageHeader title={t('progress.title', language)} subtitle={t('progress.subtitle', language)} />

      <div className="px-4 pt-4 max-w-5xl mx-auto md:grid md:grid-cols-2 md:gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-4">
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
            <p className="mt-3 text-sm font-medium text-foreground">{t('progress.overall', language)}</p>
            <p className="text-xs text-muted-foreground">{overall.read} / {overall.total} {t('reader.chapters', language)}</p>
          </motion.div>

          {/* Statistics */}
          <ReadingStatsCard />

          {/* Weekly Calendar Chart */}
          <WeeklyCalendarChart />
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4 mt-4 md:mt-0">
          {/* Upcoming Visits */}
          <UpcomingVisitsCard />

          {/* Testament stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-3">
              <p className="text-[10px] font-medium text-muted-foreground">
                {t('reader.hebrewScriptures', language)}
              </p>
              <p className="text-lg font-bold text-foreground">{Math.round((otRead / otTotal) * 100)}%</p>
              <Progress value={(otRead / otTotal) * 100} className="mt-1 h-1.5" />
              <p className="mt-1 text-[10px] text-muted-foreground">{otRead}/{otTotal}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <p className="text-[10px] font-medium text-muted-foreground">
                {t('reader.greekScriptures', language)}
              </p>
              <p className="text-lg font-bold text-foreground">{Math.round((ntRead / ntTotal) * 100)}%</p>
              <Progress value={(ntRead / ntTotal) * 100} className="mt-1 h-1.5" />
              <p className="mt-1 text-[10px] text-muted-foreground">{ntRead}/{ntTotal}</p>
            </div>
          </div>

          {/* Per book */}
          <h2 className="pt-2 text-sm font-semibold text-foreground">{t('progress.byBook', language)}</h2>
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
                {t('progress.startReading', language)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
