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

export default function HomePage() {
  const navigate = useNavigate();
  const { getOverallProgress, lastRead, getTodaysReading } = useReadingProgress();
  const overall = getOverallProgress();
  const lastBook = lastRead ? getBookById(lastRead.bookId) : null;
  const todaysReading = getTodaysReading();

  return (
    <div className="min-h-screen pb-20">
      {/* Hero */}
      <div className="px-5 pb-6 pt-12 safe-top">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-medium uppercase tracking-widest text-primary">{t('app.title')}</p>
          <h1 className="mt-1 text-3xl font-bold text-foreground whitespace-pre-line" style={{ fontFamily: "'Playfair Display', serif" }}>
            {t('home.subtitle')}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('home.tagline')}
          </p>
        </motion.div>
      </div>

      <div className="space-y-5 px-5 pt-2">
        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">{t('home.overallProgress')}</span>
            <span className="text-2xl font-bold text-primary">{overall.percent}%</span>
          </div>
          <Progress value={overall.percent} className="h-2" />
          <p className="mt-2 text-xs text-muted-foreground">
            {overall.read} {t('home.chaptersOf')} {overall.total} {t('home.chaptersRead')}
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
          >
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">{t('home.todaysReading')}</span>
            </div>
            <div className="space-y-2">
              {todaysReading.map((item, i) => {
                const events = getChapterEvents(item.bookId, item.chapter, 'tg');
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
                        {getLocalizedBookName(item.bookId)} {item.chapter}
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
            className="flex w-full items-center gap-3 rounded-xl py-3 text-left transition-colors hover:opacity-70"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{t('home.continueReading')}</p>
              <p className="text-sm font-semibold text-foreground">
                {getLocalizedBookName(lastRead.bookId)} {lastRead.chapter}
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
          {[
            { to: '/reader', icon: BookOpen, label: t('home.openBible') },
            { to: '/search', icon: Search, label: t('home.search') },
            { to: '/bookmarks', icon: Bookmark, label: t('home.bookmarks') },
            { to: '/journal', icon: PenLine, label: t('home.journal') },
            { to: '/progress', icon: CheckCircle2, label: t('home.viewProgress') },
          ].map(({ to, icon: Icon, label }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
            >
              <Icon className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium text-foreground">{label}</span>
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
