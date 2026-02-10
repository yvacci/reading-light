import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, BookOpen, Users, Megaphone, TrendingUp } from 'lucide-react';
import { usePioneer, PioneerEntry } from '@/contexts/PioneerContext';
import { useStudies } from '@/contexts/StudiesContext';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { t } from '@/lib/i18n';
import PageHeader from '@/components/PageHeader';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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

function ServiceYearCard({ entries, language }: { entries: Record<string, PioneerEntry>; language: string }) {
  const sy = getServiceYear(new Date());
  let totalHours = 0;

  // Iterate all entries within the service year range
  Object.entries(entries).forEach(([dateKey, entry]) => {
    const d = new Date(dateKey + 'T12:00:00');
    if (d >= sy.start && d <= sy.end) {
      totalHours += entry.ministryHours + entry.witnessingHours;
    }
  });

  const percent = Math.min(100, Math.round((totalHours / SERVICE_YEAR_TARGET) * 100));
  const now = new Date();
  const totalDays = Math.ceil((sy.end.getTime() - sy.start.getTime()) / 86400000);
  const elapsedDays = Math.max(1, Math.ceil((now.getTime() - sy.start.getTime()) / 86400000));
  const expectedHours = Math.round((elapsedDays / totalDays) * SERVICE_YEAR_TARGET);
  const onTrack = totalHours >= expectedHours;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-border bg-card p-4 space-y-3"
    >
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h3 className="text-xs font-semibold text-foreground">{t('pioneer.serviceYear', language)}</h3>
        <span className="ml-auto text-[10px] text-muted-foreground">{sy.label}</span>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">{t('pioneer.serviceYearHours', language)}</span>
          <span className={`text-sm font-bold ${onTrack ? 'text-[hsl(145,65%,42%)]' : 'text-destructive'}`}>
            {totalHours} / {SERVICE_YEAR_TARGET}
          </span>
        </div>
        <Progress value={percent} className="h-2" />
      </div>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{t('pioneer.expectedPace', language)}: {expectedHours}h</span>
        <span className={`font-semibold ${onTrack ? 'text-[hsl(145,65%,42%)]' : 'text-destructive'}`}>
          {onTrack ? (language === 'en' ? 'On track' : 'Nasa tamang bilis') : (language === 'en' ? 'Behind pace' : 'Nahuhuli')}
        </span>
      </div>
    </motion.div>
  );
}

export default function PioneerPage() {
  const { language } = useReadingProgress();
  const { entries, getEntry, saveEntry } = usePioneer();
  const { getStudyCount } = useStudies();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [formData, setFormData] = useState({ ministryHours: 0, bibleStudies: 0, returnVisits: 0, witnessingHours: 0 });

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
    } : { ministryHours: 0, bibleStudies: 0, returnVisits: 0, witnessingHours: 0 });
  };

  const handleSave = () => {
    if (!selectedDate) return;
    saveEntry({ date: selectedDate, ...formData });
    setSelectedDate(null);
  };

  let totalHours = 0, totalBS = 0, totalRV = 0, totalPW = 0, daysWithData = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const e = entries[getDateKey(d)];
    if (e) {
      daysWithData++;
      totalHours += e.ministryHours + e.witnessingHours;
      totalBS += e.bibleStudies;
      totalRV += e.returnVisits;
      totalPW += e.witnessingHours;
    }
  }

  const dayLabels = language === 'en'
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : ['Lin', 'Lun', 'Mar', 'Miy', 'Huw', 'Biy', 'Sab'];

  const hoursPercent = Math.min(100, Math.round((totalHours / TARGET_HOURS) * 100));

  return (
    <div className="min-h-screen pb-20">
      <PageHeader title={t('pioneer.title', language)} subtitle={t('pioneer.subtitle', language)} />

      <div className="space-y-4 px-4 pt-4">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
            <span className="text-sm font-semibold text-foreground">{monthName}</span>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <ChevronRight className="h-5 w-5 text-foreground" />
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
                    ${hasData ? 'bg-[hsl(145,65%,42%)]/20 text-[hsl(145,65%,30%)]' : 'bg-destructive/10 text-muted-foreground'}
                    hover:opacity-80`}
                >
                  {day}
                  {hasData && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[hsl(145,65%,42%)]" />}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Monthly Summary */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-4 space-y-4"
        >
          <h3 className="text-xs font-semibold text-foreground">{t('pioneer.monthlySummary', language)}</h3>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs text-foreground">{t('pioneer.totalHours', language)}</span>
              </div>
              <span className={`text-sm font-bold ${totalHours >= TARGET_HOURS ? 'text-[hsl(145,65%,42%)]' : 'text-destructive'}`}>
                {totalHours} / {TARGET_HOURS}
              </span>
            </div>
            <Progress value={hoursPercent} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/50 p-3">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-lg font-bold text-foreground">{totalBS}</span>
              <span className="text-[10px] text-muted-foreground text-center">{t('pioneer.bibleStudies', language)}</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/50 p-3">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-lg font-bold text-foreground">{totalRV}</span>
              <span className="text-[10px] text-muted-foreground text-center">{t('pioneer.returnVisits', language)}</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/50 p-3">
              <Megaphone className="h-4 w-4 text-primary" />
              <span className="text-lg font-bold text-foreground">{totalPW}</span>
              <span className="text-[10px] text-muted-foreground text-center">{t('pioneer.witnessing', language)}</span>
            </div>
          </div>

          <div className="text-[10px] text-muted-foreground text-center">
            {daysWithData} / {daysInMonth} {t('pioneer.daysLogged', language)}
          </div>
        </motion.div>

        {/* Service Year Summary */}
        <ServiceYearCard entries={entries} language={language} />
      </div>

      {/* Entry Dialog */}
      <Dialog open={!!selectedDate} onOpenChange={(open: boolean) => !open && setSelectedDate(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {selectedDate && new Date(selectedDate + 'T12:00:00').toLocaleDateString(language === 'en' ? 'en-US' : 'fil-PH', { weekday: 'long', month: 'long', day: 'numeric' })}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t('pioneer.ministryHours', language)}</label>
              <Input
                type="number"
                min={0}
                step={0.5}
                value={formData.ministryHours}
                onChange={e => setFormData(p => ({ ...p, ministryHours: parseFloat(e.target.value) || 0 }))}
                className="h-9"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t('pioneer.bibleStudies', language)}</label>
              <Input
                type="number"
                min={0}
                value={formData.bibleStudies}
                onChange={e => setFormData(p => ({ ...p, bibleStudies: parseInt(e.target.value) || 0 }))}
                className="h-9"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t('pioneer.returnVisits', language)}</label>
              <Input
                type="number"
                min={0}
                value={formData.returnVisits}
                onChange={e => setFormData(p => ({ ...p, returnVisits: parseInt(e.target.value) || 0 }))}
                className="h-9"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t('pioneer.witnessingHours', language)}</label>
              <Input
                type="number"
                min={0}
                step={0.5}
                value={formData.witnessingHours}
                onChange={e => setFormData(p => ({ ...p, witnessingHours: parseFloat(e.target.value) || 0 }))}
                className="h-9"
              />
            </div>
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
  );
}
