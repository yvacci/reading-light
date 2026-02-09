import { motion } from 'framer-motion';
import { Check, CalendarDays } from 'lucide-react';
import { READING_PLANS, READING_SPEEDS, TOTAL_CHAPTERS } from '@/lib/bible-data';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { t } from '@/lib/i18n';
import PageHeader from '@/components/PageHeader';

export default function PlansPage() {
  const { currentPlan, setCurrentPlan, readingSpeed, setReadingSpeed, language, getOverallProgress } = useReadingProgress();
  const overall = getOverallProgress();

  // Calculate estimated completion date
  const speedMap: Record<string, number> = { '1yr': 3, '2yr': 2, '3yr': 1 };
  const chaptersPerDay = speedMap[readingSpeed] || 3;
  const remaining = overall.total - overall.read;
  const daysNeeded = Math.ceil(remaining / chaptersPerDay);
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysNeeded);
  const targetStr = targetDate.toLocaleDateString(language === 'en' ? 'en-US' : 'fil-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const planNames: Record<string, Record<string, string>> = {
    canonical: { en: 'Canonical Order', tg: 'Kanoniko' },
    chronological: { en: 'Chronological Order', tg: 'Kronolohikal' },
    'writing-order': { en: 'By Writing Order', tg: 'Ayon sa Pagkasulat' },
    'nt-first': { en: 'New Testament First', tg: 'Bagong Tipan Muna' },
  };

  const planDescs: Record<string, Record<string, string>> = {
    canonical: { en: 'Read the Bible in its standard sequence from Genesis to Revelation.', tg: 'Basahin ang Bibliya sa karaniwang pagkakasunod mula Genesis hanggang Apocalipsis.' },
    chronological: { en: 'Follow events in the approximate historical timeline.', tg: 'Sundin ang mga pangyayari ayon sa tinatayang kronolohiya.' },
    'writing-order': { en: 'Read in the approximate order the books were composed.', tg: 'Basahin ayon sa tinatayang pagkakasulat ng mga aklat.' },
    'nt-first': { en: 'Start with the Christian Greek Scriptures before the Hebrew Scriptures.', tg: 'Magsimula sa Kristiyanong Griegong Kasulatan bago ang Hebreong Kasulatan.' },
  };

  return (
    <div className="min-h-screen pb-20">
      <PageHeader title={t('plans.title', language)} subtitle={t('plans.subtitle', language)} showBack />

      <div className="space-y-3 px-4 pt-4">
        {READING_PLANS.map((plan, i) => {
          const active = currentPlan === plan.id;
          return (
            <motion.button
              key={plan.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setCurrentPlan(plan.id)}
              className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
                active
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border bg-card hover:bg-muted/50'
              }`}
            >
              <span className="text-2xl">{plan.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {planNames[plan.id]?.[language] || plan.name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {planDescs[plan.id]?.[language] || plan.description}
                </p>
              </div>
              {active && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3.5 w-3.5" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="px-4 pt-6">
        <h2 className="mb-3 text-sm font-semibold text-foreground">{t('plans.readingSpeed', language)}</h2>
        <div className="grid grid-cols-3 gap-2">
          {READING_SPEEDS.map(speed => {
            const active = readingSpeed === speed.id;
            return (
              <button
                key={speed.id}
                onClick={() => setReadingSpeed(speed.id)}
                className={`rounded-xl border p-3 text-center transition-all ${
                  active
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border bg-card hover:bg-muted/50'
                }`}
              >
                <p className={`text-sm font-bold ${active ? 'text-primary' : 'text-foreground'}`}>{speed.label}</p>
                <p className="text-[10px] text-muted-foreground">{speed.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target completion date */}
      <div className="px-4 pt-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              {t('plans.targetDate', language)}
            </span>
          </div>
          <p className="text-lg font-bold text-primary">{targetStr}</p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {remaining} {t('plans.chaptersRemaining', language)} · {chaptersPerDay} {t('plans.chaptersPerDay', language)}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
