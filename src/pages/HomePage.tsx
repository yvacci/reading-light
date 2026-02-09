import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, CheckCircle2, CalendarDays, Search, Bookmark, PenLine, MapPin, Calendar } from 'lucide-react';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { getBookById } from '@/lib/bible-data';
import { getLocalizedBookName } from '@/lib/localization';
import { getChapterEvents } from '@/lib/bible-events';
import { t } from '@/lib/i18n';
import { Progress } from '@/components/ui/progress';
import WeeklyChart from '@/components/WeeklyChart';
import ReadingStatsCard from '@/components/ReadingStatsCard';
import DailyTextCard from '@/components/DailyTextCard';

export default function HomePage() {
  const navigate = useNavigate();
  const { getOverallProgress, lastRead, getTodaysReading, language } = useReadingProgress();
  const overall = getOverallProgress();
  const lastBook = lastRead ? getBookById(lastRead.bookId) : null;
  const todaysReading = getTodaysReading();

  return (
    <div className="min-h-screen pb-20">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-background px-4 pb-6 pt-12 safe-top">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-medium uppercase tracking-widest text-primary">{t('app.title', language)}</p>
          <h1 className="mt-1 text-3xl font-bold text-foreground whitespace-pre-line" style={{ fontFamily: "'Playfair Display', serif" }}>
            {t('home.subtitle', language)}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('home.tagline', language)}
          </p>
        </motion.div>
      </div>

      <div className="space-y-4 px-4 pt-5">
        {/* Daily Text */}
        <DailyTextCard />

        {/* Overall Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="rounded-2xl border border-border bg-card p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{t('home.overallProgress', language)}</span>
            <span className="text-2xl font-bold text-primary">{overall.percent}%</span>
          </div>
          <Progress value={overall.percent} className="mt-2 h-2" />
          <p className="mt-2 text-xs text-muted-foreground">
            {overall.read} {t('home.chaptersOf', language)} {overall.total} {t('home.chaptersRead', language)}
          </p>
        </motion.div>

        {/* Reading Statistics */}
        <ReadingStatsCard />

        {/* Today's Reading */}
        {todaysReading && todaysReading.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">{t('home.todaysReading', language)}</span>
            </div>
            <div className="space-y-2">
              {todaysReading.map((item, i) => {
                const events = getChapterEvents(item.bookId, item.chapter, language);
                return (
                  <div key={i} className="rounded-xl bg-muted/50 overflow-hidden">
                    <button
                      onClick={() => navigate(`/reader/${item.bookId}/${item.chapter}`)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                        {i + 1}
                      </div>
                      <span className="text-sm font-medium text-foreground flex-1">
                        {getLocalizedBookName(item.bookId, language)} {item.chapter}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    {events && (
                      <div className="px-3 pb-2.5 pl-14">
                        {events.events && events.events.length > 0 && (
                          <div className="space-y-0.5">
                            {events.events.map((ev, j) => (
                              <div key={j} className="flex items-start gap-1.5">
                                <Calendar className="h-3 w-3 text-primary/70 mt-0.5 shrink-0" />
                                <p className="text-[10px] text-muted-foreground">
                                  <span className="font-bold">{ev.year}</span> {ev.event}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                        {events.locations && events.locations.length > 0 && (
                          <div className="mt-0.5">
                            {events.locations.map((loc, j) => (
                              <div key={j} className="flex items-start gap-1.5">
                                <MapPin className="h-3 w-3 text-primary/70 mt-0.5 shrink-0" />
                                <p className="text-[10px] text-muted-foreground">{loc.location}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Continue Reading */}
        {lastRead && lastBook && (
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            onClick={() => navigate(`/reader/${lastRead.bookId}/${lastRead.chapter}`)}
            className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{t('home.continueReading', language)}</p>
              <p className="text-sm font-semibold text-foreground">
                {getLocalizedBookName(lastRead.bookId, language)} {lastRead.chapter}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </motion.button>
        )}

        {/* Weekly Progress Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <WeeklyChart />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="grid grid-cols-2 gap-3"
        >
          <button
            onClick={() => navigate('/reader')}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
          >
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xs font-medium text-foreground">{t('home.openBible', language)}</span>
          </button>
          <button
            onClick={() => navigate('/search')}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
          >
            <Search className="h-6 w-6 text-primary" />
            <span className="text-xs font-medium text-foreground">{t('home.search', language)}</span>
          </button>
          <button
            onClick={() => navigate('/bookmarks')}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
          >
            <Bookmark className="h-6 w-6 text-primary" />
            <span className="text-xs font-medium text-foreground">{t('home.bookmarks', language)}</span>
          </button>
          <button
            onClick={() => navigate('/journal')}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
          >
            <PenLine className="h-6 w-6 text-primary" />
            <span className="text-xs font-medium text-foreground">{t('home.journal', language)}</span>
          </button>
          <button
            onClick={() => navigate('/progress')}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
          >
            <CheckCircle2 className="h-6 w-6 text-primary" />
            <span className="text-xs font-medium text-foreground">{t('home.viewProgress', language)}</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
