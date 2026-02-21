import { useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, BookOpen, Users, Megaphone, TrendingUp, ArrowRight, Minus, Plus, Bell, Calendar, MapPin, MoreHorizontal, Target, Star, Link2 } from 'lucide-react';
import { usePioneer, PioneerEntry } from '@/contexts/PioneerContext';
import { useStudies } from '@/contexts/StudiesContext';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { t } from '@/lib/i18n';
import PageHeader from '@/components/PageHeader';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const PIONEER_VERSES = [
  { ref: 'Mateo 28:19, 20', text: '"Kaya humayo kayo at gumawa ng mga alagad mula sa mga tao ng lahat ng bansa."' },
  { ref: 'Isaias 6:8', text: '"Narito ako! Isugo mo ako!"' },
  { ref: 'Roma 10:14', text: '"Paano naman sila tatawag sa kaniya kung hindi sila naniwala sa kaniya?"' },
  { ref: '2 Timoteo 4:2', text: '"Ipangaral mo ang salita; gawin mo ito nang may pagkaapurahan."' },
  { ref: 'Mga Gawa 1:8', text: '"Kayo ay magiging mga saksi ko... hanggang sa pinakamalayong bahagi ng lupa."' },
  { ref: 'Mateo 24:14', text: '"Ang mabuting balitang ito ng Kaharian ay ipangangaral sa buong lupa."' },
  { ref: 'Kawikaan 3:5, 6', text: '"Magtiwala ka kay Jehova nang buong puso mo."' },
  { ref: 'Filipos 4:13', text: '"May lakas akong harapin ang lahat ng bagay sa pamamagitan niya na nagbibigay ng kapangyarihan sa akin."' },
];

const QUICK_LINKS = [
  { label: 'WOL Bibliya', url: 'https://wol.jw.org/tl/wol/binav/r27/lp-tg', icon: BookOpen },
  { label: 'JW.org Tagalog', url: 'https://www.jw.org/tl/', icon: Link2 },
  { label: 'Pag-aaral sa Bibliya', url: 'https://www.jw.org/tl/library/bibliya/bibliya-para-sa-pag-aaral/aklat/', icon: BookOpen },
  { label: 'Mga Publikasyon', url: 'https://www.jw.org/tl/library/', icon: Link2 },
];

function StepperField({ label, value, onChange, step = 1, max = 99, icon }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  max?: number;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2.5">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(0, +(value - step).toFixed(1)))}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-background border border-border text-muted-foreground transition-colors hover:bg-muted"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-10 text-center text-sm font-bold text-muted-foreground">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, +(value + step).toFixed(1)))}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-background border border-border text-muted-foreground transition-colors hover:bg-muted"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

const TARGET_HOURS = 50;
const SERVICE_YEAR_TARGET = 600;

function getServiceYear(refDate: Date): { start: Date; end: Date; label: string } {
  const year = refDate.getFullYear();
  const month = refDate.getMonth();
  const startYear = month >= 8 ? year : year - 1;
  const endYear = startYear + 1;
  return {
    start: new Date(startYear, 8, 1),
    end: new Date(endYear, 7, 31),
    label: `${startYear}–${endYear}`,
  };
}

/** Combined metrics: Service Year, Monthly Goal */
function CombinedMetricsCard({ entries, totalHours, language }: {
  entries: Record<string, PioneerEntry>;
  totalHours: number;
  language: string;
}) {
  const sy = getServiceYear(new Date());
  let yearlyTotal = 0;

  Object.entries(entries).forEach(([dateKey, entry]) => {
    const d = new Date(dateKey + 'T12:00:00');
    if (d >= sy.start && d <= sy.end) {
      yearlyTotal += entry.ministryHours + entry.bibleStudies + entry.returnVisits + entry.witnessingHours + (entry.otherWitnessingHours || 0);
    }
  });

  const yearPercent = Math.min(100, Math.round((yearlyTotal / SERVICE_YEAR_TARGET) * 100));
  const monthPercent = Math.min(100, Math.round((totalHours / TARGET_HOURS) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border border-border bg-card p-4 space-y-4"
    >
      <h3 className="text-xs font-bold text-foreground app-title">Ministry Overview</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-primary/5 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Target className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Yearly Goal</span>
          </div>
          <div className="text-center">
            <span className="text-sm font-bold text-muted-foreground">{yearlyTotal}</span>
            <span className="text-xs text-muted-foreground">/{SERVICE_YEAR_TARGET}</span>
          </div>
          <Progress value={yearPercent} className="h-1.5" />
          <p className="text-[10px] text-muted-foreground text-center">{sy.label}</p>
        </div>
        <div className="rounded-xl bg-primary/5 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Monthly Goal</span>
          </div>
          <div className="text-center">
            <span className="text-sm font-bold text-muted-foreground">{totalHours}</span>
            <span className="text-xs text-muted-foreground">/{TARGET_HOURS}</span>
          </div>
          <Progress value={monthPercent} className="h-1.5" />
          <p className="text-[10px] text-muted-foreground text-center">{monthPercent}%</p>
        </div>
      </div>
    </motion.div>
  );
}

/** Form of Ministry */
function FormOfMinistry({ totalFS, totalBS, totalRV, totalPW, totalOther }: {
  totalFS: number; totalBS: number; totalRV: number; totalPW: number; totalOther: number;
}) {
  const total = totalFS + totalBS + totalRV + totalPW + totalOther;
  
  const priorities = [
    { label: 'Field Service', value: totalFS, icon: <Megaphone className="h-3.5 w-3.5 text-muted-foreground" /> },
    { label: 'Bible Study', value: totalBS, icon: <BookOpen className="h-3.5 w-3.5 text-muted-foreground" /> },
    { label: 'Return Visit', value: totalRV, icon: <Users className="h-3.5 w-3.5 text-muted-foreground" /> },
    { label: 'Public Witnessing', value: totalPW, icon: <Clock className="h-3.5 w-3.5 text-muted-foreground" /> },
    { label: 'Others', value: totalOther, icon: <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" /> },
  ];

  const getGoalPercent = (v: number) => TARGET_HOURS > 0 ? Math.round((v / TARGET_HOURS) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-border bg-card p-4 space-y-3"
    >
      <h3 className="text-xs font-bold text-foreground app-title">Form of Ministry</h3>

      <div className="space-y-2.5">
        {priorities.map((p, i) => {
          const goalPct = getGoalPercent(p.value);
          return (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {p.icon}
                  <span className="text-xs text-muted-foreground">{p.label}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {p.value}/{TARGET_HOURS} — <span className="font-semibold text-muted-foreground">{goalPct}%</span>
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${Math.min(100, goalPct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

/** Unified visits panel for sidebar — merges Needs Visit + Scheduled */
function StudiesVisitsPanel({ language }: { language: string }) {
  const { studies, getUpcomingVisits } = useStudies();

  const bibleStudies = studies.filter(s => s.type === 'bible-study');
  const returnVisits = studies.filter(s => s.type === 'return-visit');
  const upcomingVisits = getUpcomingVisits();
  const scheduledVisits = studies
    .filter(s => s.nextVisitDate)
    .sort((a, b) => (a.nextVisitDate || '').localeCompare(b.nextVisitDate || ''))
    .slice(0, 5);

  // Merge needs-visit and scheduled into one unified list
  const needsVisitIds = new Set(upcomingVisits.map(v => v.id));
  const scheduledIds = new Set(scheduledVisits.map(v => v.id));
  const allVisitIds = new Set([...needsVisitIds, ...scheduledIds]);
  const allVisits = studies.filter(s => allVisitIds.has(s.id));

  return (
    <div className="space-y-4">
      {/* Bible Studies */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Bible Study ({bibleStudies.length})</h3>
        </div>
        {bibleStudies.length === 0 ? (
          <div className="rounded-xl bg-muted/30 p-3 text-center">
            <p className="text-[11px] text-muted-foreground">Wala pang Bible Study</p>
          </div>
        ) : (
          <div className="rounded-xl bg-card border border-border/40 divide-y divide-border/40 overflow-hidden">
            {bibleStudies.map(s => (
              <div key={s.id} className="flex items-start gap-2.5 px-3 py-2.5">
                <BookOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-muted-foreground truncate">{s.name}</p>
                  {s.lastVisitDate && (
                    <p className="text-[10px] text-muted-foreground">
                      Huling bisita: {new Date(s.lastVisitDate + 'T12:00:00').toLocaleDateString()}
                    </p>
                  )}
                  {s.address && (
                    <button
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}`, '_blank')}
                      className="flex items-center gap-1 mt-0.5"
                    >
                      <MapPin className="h-2.5 w-2.5 text-muted-foreground" />
                      <span className="text-[10px] text-primary hover:underline truncate">{s.address}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Return Visits */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Return Visit ({returnVisits.length})</h3>
        </div>
        {returnVisits.length === 0 ? (
          <div className="rounded-xl bg-muted/30 p-3 text-center">
            <p className="text-[11px] text-muted-foreground">Wala pang Return Visit</p>
          </div>
        ) : (
          <div className="rounded-xl bg-card border border-border/40 divide-y divide-border/40 overflow-hidden">
            {returnVisits.map(s => (
              <div key={s.id} className="flex items-start gap-2.5 px-3 py-2.5">
                <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-muted-foreground truncate">{s.name}</p>
                  {s.lastVisitDate && (
                    <p className="text-[10px] text-muted-foreground">
                      Huling bisita: {new Date(s.lastVisitDate + 'T12:00:00').toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unified Mga Bisita — merged needs-visit + scheduled */}
      {allVisits.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Mga Bisita ({allVisits.length})</h3>
          </div>
          <div className="rounded-xl bg-card border border-border/40 divide-y divide-border/40 overflow-hidden">
            {allVisits.map(visit => {
              const daysSince = visit.lastVisitDate
                ? Math.floor((Date.now() - new Date(visit.lastVisitDate + 'T12:00:00').getTime()) / 86400000)
                : null;
              const isUrgent = needsVisitIds.has(visit.id);
              const lastLog = visit.visitHistory && visit.visitHistory.length > 0
                ? visit.visitHistory[visit.visitHistory.length - 1]
                : null;

              return (
                <div key={visit.id} className="flex items-start gap-2.5 px-3 py-2.5">
                  {isUrgent ? (
                    <Bell className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                  ) : (
                    <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-semibold truncate ${isUrgent ? 'text-destructive' : 'text-muted-foreground'}`}>{visit.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {visit.type === 'bible-study' ? 'BS' : 'RV'}
                      {daysSince !== null && ` · ${daysSince}d ago`}
                    </p>
                    {lastLog && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Last: {new Date(lastLog.date + 'T12:00:00').toLocaleDateString()}
                        {lastLog.notes && ` — ${lastLog.notes.slice(0, 40)}`}
                      </p>
                    )}
                    {visit.nextVisitDate && (
                      <p className="text-[10px] text-primary font-medium mt-0.5">
                        Susunod: {new Date(visit.nextVisitDate + 'T12:00:00').toLocaleDateString()}
                        {visit.nextVisitTime && ` ${visit.nextVisitTime}`}
                      </p>
                    )}
                    {visit.address && (
                      <button
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(visit.address)}`, '_blank')}
                        className="flex items-center gap-1 mt-0.5"
                      >
                        <MapPin className="h-2.5 w-2.5 text-primary" />
                        <span className="text-[10px] text-primary hover:underline truncate">{visit.address}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PioneerPage() {
  const navigate = useNavigate();
  const { language } = useReadingProgress();
  const { entries, getEntry, saveEntry } = usePioneer();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [formData, setFormData] = useState({ ministryHours: 0, bibleStudies: 0, returnVisits: 0, witnessingHours: 0, otherWitnessingHours: 0 });
  const [randomVerse] = useState(() => PIONEER_VERSES[Math.floor(Math.random() * PIONEER_VERSES.length)]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();

  const monthName = currentDate.toLocaleDateString(language === 'en' ? 'en-US' : 'fil-PH', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentDate(new Date(year, month - 2, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month, 1));

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const getDateKey = (day: number) => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const handleDayClick = (day: number) => {
    const key = getDateKey(day);
    setSelectedDate(key);
    const existing = getEntry(key);
    setFormData(existing ? {
      ministryHours: existing.ministryHours,
      bibleStudies: existing.bibleStudies,
      returnVisits: existing.returnVisits,
      witnessingHours: existing.witnessingHours,
      otherWitnessingHours: existing.otherWitnessingHours || 0,
    } : { ministryHours: 0, bibleStudies: 0, returnVisits: 0, witnessingHours: 0, otherWitnessingHours: 0 });
  };

  const handleSave = () => {
    if (!selectedDate) return;
    saveEntry({ date: selectedDate, ...formData });
    setSelectedDate(null);
  };

  let totalFS = 0, totalBS = 0, totalRV = 0, totalPW = 0, totalOther = 0, daysWithData = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const e = entries[getDateKey(d)];
    if (e) {
      daysWithData++;
      totalFS += e.ministryHours;
      totalBS += e.bibleStudies;
      totalRV += e.returnVisits;
      totalPW += e.witnessingHours;
      totalOther += (e.otherWitnessingHours || 0);
    }
  }

  const totalHours = totalFS + totalBS + totalRV + totalPW + totalOther;

  const dayLabels = language === 'en'
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : ['Lin', 'Lun', 'Mar', 'Miy', 'Huw', 'Biy', 'Sab'];

  return (
    <div className="min-h-screen pb-20">
      <div className="flex-1 min-w-0">
        <PageHeader title={t('pioneer.title', language)} subtitle={t('pioneer.subtitle', language)} />

        <div className="px-4 pt-4 max-w-5xl mx-auto md:grid md:grid-cols-[280px_1fr] md:gap-6">
          {/* LEFT SIDEBAR — Pampatibay + Studies & Visits + Quick Links (tablet+ only) */}
          <aside className="hidden md:block space-y-4 sticky top-4 self-start">
            {/* Pampatibay */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="rounded-xl bg-primary/5 p-4 border border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-3.5 w-3.5 text-primary" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Pampatibay</p>
                </div>
                <p className="text-sm text-muted-foreground italic leading-relaxed" style={{ fontFamily: "'Lora', Georgia, serif" }}>{randomVerse.text}</p>
                <p className="text-xs text-primary font-semibold mt-2">— {randomVerse.ref}</p>
              </div>
            </div>

            {/* Studies & Visits */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <StudiesVisitsPanel language={language} />
            </div>

            {/* Quick Links */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 px-1">Mabilis na Link</p>
              <div className="space-y-1">
                {QUICK_LINKS.map((link) => (
                  <button
                    key={link.url}
                    onClick={() => window.open(link.url, '_blank')}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/60"
                  >
                    <link.icon className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-xs font-medium text-muted-foreground flex-1">{link.label}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* MAIN COLUMN — Calendar + Ministry Overview + Form of Ministry */}
          <div className="space-y-4">
            {/* Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                </button>
                <span className="text-sm font-semibold text-muted-foreground">{monthName}</span>
                <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-1">
                {dayLabels.map(d => (
                  <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => {
                  if (day === null) return <div key={`empty-${i}`} />;
                  const key = getDateKey(day);
                  const hasData = !!entries[key];
                  const isToday = key === new Date().toISOString().slice(0, 10);

                  return (
                    <button
                      key={day}
                      onClick={() => handleDayClick(day)}
                      className={`relative aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all
                        ${isToday ? 'ring-2 ring-primary' : ''}
                        ${hasData ? 'bg-primary/15 text-muted-foreground' : 'bg-muted/30 text-muted-foreground'}
                        hover:opacity-80`}
                    >
                      {day}
                      {hasData && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Ministry Overview */}
            <CombinedMetricsCard entries={entries} totalHours={totalHours} language={language} />

            {/* Form of Ministry */}
            <FormOfMinistry
              totalFS={totalFS}
              totalBS={totalBS}
              totalRV={totalRV}
              totalPW={totalPW}
              totalOther={totalOther}
            />

            {/* Studies & Visits link */}
            <motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => navigate('/studies')}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-semibold text-muted-foreground">{t('studies.title', language)}</span>
                <p className="text-xs text-muted-foreground">{t('studies.subtitle', language)}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </motion.button>
          </div>
        </div>

        {/* Entry Dialog */}
        <Dialog open={!!selectedDate} onOpenChange={(open: boolean) => !open && setSelectedDate(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-sm">
                {selectedDate && new Date(selectedDate + 'T12:00:00').toLocaleDateString(language === 'en' ? 'en-US' : 'fil-PH', { weekday: 'long', month: 'long', day: 'numeric' })}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <StepperField
                label={t('pioneer.ministryHours', language)}
                value={formData.ministryHours}
                onChange={v => setFormData(p => ({ ...p, ministryHours: v }))}
                step={0.5}
                max={24}
                icon={<Clock className="h-4 w-4 text-muted-foreground" />}
              />
              <StepperField
                label={t('pioneer.bibleStudies', language)}
                value={formData.bibleStudies}
                onChange={v => setFormData(p => ({ ...p, bibleStudies: v }))}
                step={0.5}
                max={24}
                icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
              />
              <StepperField
                label={t('pioneer.returnVisits', language)}
                value={formData.returnVisits}
                onChange={v => setFormData(p => ({ ...p, returnVisits: v }))}
                step={0.5}
                max={24}
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
              />
              <StepperField
                label={t('pioneer.witnessingHours', language)}
                value={formData.witnessingHours}
                onChange={v => setFormData(p => ({ ...p, witnessingHours: v }))}
                step={0.5}
                max={24}
                icon={<Megaphone className="h-4 w-4 text-muted-foreground" />}
              />
              <StepperField
                label="Other Witnessing (hours)"
                value={formData.otherWitnessingHours}
                onChange={v => setFormData(p => ({ ...p, otherWitnessingHours: v }))}
                step={0.5}
                max={24}
                icon={<MoreHorizontal className="h-4 w-4 text-muted-foreground" />}
              />
            </div>

            <div className="flex gap-2 mt-2">
              <Button variant="outline" className="flex-1" onClick={() => setSelectedDate(null)}>
                {t('common.cancel', language)}
              </Button>
              <Button className="flex-1" onClick={handleSave}>
                {t('common.save', language)}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
