import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, CheckCircle2, CalendarDays, Search, Bookmark, PenLine, MapPin, Calendar, Megaphone, Users, Clock, Target } from 'lucide-react';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { usePioneer } from '@/contexts/PioneerContext';
import { useStudies } from '@/contexts/StudiesContext';
import { getBookById } from '@/lib/bible-data';
import { getLocalizedBookName } from '@/lib/localization';
import { getChapterEvents } from '@/lib/bible-events';
import { t } from '@/lib/i18n';
import WeeklyChart from '@/components/WeeklyChart';
import { useScheduleReminders } from '@/hooks/useScheduleReminders';

function PioneerSummaryCard() {
  const { getMonthSummary, getYearlyTotal } = usePioneer();
  const { studies } = useStudies();
  const navigate = useNavigate();
  const now = new Date();
  const summary = getMonthSummary(now.getFullYear(), now.getMonth() + 1);

  // Yearly goal: service year Sep–Aug
  const yearlyTotal = getYearlyTotal();

  // Unique BS people this month (people with at least 1 successful visit this month)
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const uniqueBSPeople = studies.filter(s => s.type === 'bible-study' && (s.visitHistory || []).some(vh => vh.date.startsWith(yearMonth) && (vh.status === 'successful' || !vh.status))).length;
  const uniqueRVPeople = studies.filter(s => s.type === 'return-visit' && (s.visitHistory || []).some(vh => vh.date.startsWith(yearMonth) && (vh.status === 'successful' || !vh.status))).length;

  if (summary.daysWithData === 0 && yearlyTotal === 0 && uniqueBSPeople === 0 && uniqueRVPeople === 0) return null;

  const MONTHLY_GOAL = 50;
  const YEARLY_GOAL = 600;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="ghibli-card rounded-2xl border border-border bg-card p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-primary" />
          <span className="app-subheading text-foreground" style={{ fontSize: '12px' }}>MINISTRY SUMMARY</span>
        </div>
        <button onClick={() => navigate('/pioneer')} className="text-[10px] text-primary font-medium hover:underline">
          View All →
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Yearly Goal */}
        <div className="flex flex-col items-center gap-1 rounded-xl bg-primary/10 p-3">
          <Target className="h-3.5 w-3.5 text-primary" />
          <span className="text-lg font-bold text-primary">{yearlyTotal}<span className="text-xs font-normal text-muted-foreground">/{YEARLY_GOAL}h</span></span>
          <span className="text-[10px] text-muted-foreground font-medium">Yearly Goal</span>
        </div>
        {/* Monthly Goal */}
        <div className="flex flex-col items-center gap-1 rounded-xl bg-primary/10 p-3">
          <Clock className="h-3.5 w-3.5 text-primary" />
          <span className="text-lg font-bold text-primary">{summary.totalHours}<span className="text-xs font-normal text-muted-foreground">/{MONTHLY_GOAL}h</span></span>
          <span className="text-[10px] text-muted-foreground font-medium">Monthly Goal</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Bible Study — unique people */}
        <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2.5">
          <BookOpen className="h-3.5 w-3.5 text-primary shrink-0" />
          <div>
            <span className="text-sm font-bold text-foreground">{uniqueBSPeople}</span>
            <p className="text-[9px] text-muted-foreground">Bible Study (people)</p>
          </div>
        </div>
        {/* Potential Bible Study (RV) — unique people */}
        <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2.5">
          <Users className="h-3.5 w-3.5 text-primary shrink-0" />
          <div>
            <span className="text-sm font-bold text-foreground">{uniqueRVPeople}</span>
            <p className="text-[9px] text-muted-foreground">Potential Bible Study (RV)</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{summary.daysWithData} / {summary.daysInMonth} days logged</span>
      </div>
    </motion.div>
  );
}

function UpcomingRemindersCard() {
  const { getUpcomingReminders } = useScheduleReminders();
  const reminders = getUpcomingReminders();

  if (reminders.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="ghibli-card rounded-2xl border border-border bg-card p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="h-4 w-4 text-warning" />
        <span className="app-subheading text-foreground" style={{ fontSize: '12px' }}>MGA PAALALA</span>
      </div>
      <div className="space-y-2">
        {reminders.map((r, i) => (
          <div key={i} className="flex items-center gap-2 rounded-xl bg-warning/5 px-3 py-2">
            <div className="w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-foreground truncate">{r.name}</p>
              <p className="text-[10px] text-muted-foreground">{r.type}{r.time ? ` · ${r.time}` : ''}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { getOverallProgress, lastRead, getTodaysReading } = useReadingProgress();
  const overall = getOverallProgress();
  const lastBook = lastRead ? getBookById(lastRead.bookId) : null;
  const todaysReading = getTodaysReading();

  return (
    <div className="min-h-screen pb-20">
      {/* Hero */}
      <div className="px-5 pb-5 pt-12 safe-top">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="app-subheading text-primary">{t('app.title')}</p>
          <h1 className="mt-1.5 text-2xl text-foreground whitespace-pre-line tracking-tight app-title" style={{ fontSize: '28px' }}>
            {t('home.subtitle')}
          </h1>
          <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed">
            {t('home.tagline')}
          </p>
        </motion.div>
      </div>

      <div className="px-5 pt-2 max-w-5xl mx-auto md:grid md:grid-cols-2 md:gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-5">
          {/* Combined: Weekly Reading + Overall Progress */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <WeeklyChart />
            <p className="mt-2 text-xs text-muted-foreground px-1">
              {overall.read} ng {overall.total} na kabanata ang nabasa.
            </p>
          </motion.div>

          {/* Pioneer Summary */}
          <PioneerSummaryCard />
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-5 mt-5 md:mt-0">
          {/* Upcoming Reminders */}
          <UpcomingRemindersCard />

          {/* Today's Reading */}
          {todaysReading && todaysReading.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays className="h-4 w-4 text-primary" />
                <span className="app-subheading text-foreground" style={{ fontSize: '12px' }}>{t('home.todaysReading').toUpperCase()}</span>
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

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="space-y-1"
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
                className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left transition-colors hover:bg-muted/50"
              >
                <Icon className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm font-medium text-foreground">{label}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
              </button>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
