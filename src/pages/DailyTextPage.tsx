import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { loadDailyText, getDailyTextByDate } from '@/lib/daily-text-service';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { t } from '@/lib/i18n';
import PageHeader from '@/components/PageHeader';

export default function DailyTextPage() {
  const { language } = useReadingProgress();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyText, setDailyText] = useState<{ title: string; content: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        await loadDailyText(language);
        if (!cancelled) {
          const entry = getDailyTextByDate(currentDate.getMonth() + 1, currentDate.getDate());
          setDailyText(entry);
        }
      } catch (err) {
        console.error('[DailyText] Load error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [language, currentDate]);

  const goDay = (delta: number) => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + delta);
      return d;
    });
  };

  const dateStr = currentDate.toLocaleDateString(language === 'en' ? 'en-US' : 'fil-PH', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const isToday = currentDate.toDateString() === new Date().toDateString();

  return (
    <div className="min-h-screen pb-20">
      <PageHeader title={t('dailyText.title', language)} subtitle={t('dailyText.pageSubtitle', language)} />

      <div className="px-4 pt-4 space-y-4">
        {/* Date navigation */}
        <div className="flex items-center justify-between">
          <button onClick={() => goDay(-1)} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">{dateStr}</p>
            {!isToday && (
              <button
                onClick={() => setCurrentDate(new Date())}
                className="text-[10px] text-primary font-medium mt-0.5"
              >
                {t('dailyText.goToToday', language)}
              </button>
            )}
          </div>
          <button onClick={() => goDay(1)} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>
        </div>

        {/* Content card */}
        {loading ? (
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="space-y-3">
              <div className="h-4 w-48 mx-auto animate-pulse rounded bg-muted" />
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ) : dailyText ? (
          <motion.div
            key={currentDate.toISOString().slice(0, 10)}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-border bg-card overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">{t('dailyText.title', language)}</span>
              </div>

              {dailyText.title && (
                <p className="text-sm font-medium text-foreground text-center mb-4 italic leading-relaxed">
                  &ldquo;{dailyText.title}&rdquo;
                </p>
              )}

              <div
                className="text-sm text-muted-foreground leading-relaxed"
                style={{ textAlign: 'justify' }}
              >
                {renderPlainText(dailyText.content)}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{t('dailyText.noEntry', language)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Render daily text as plain text with scripture references italicized.
 * Detects patterns like (Book chapter:verse) or —Book chapter:verse
 */
function renderPlainText(content: string) {
  // Split by scripture reference patterns and italicize them
  const parts = content.split(/((?:—|\()\s*(?:[1-3]\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\.?\s+\d+:\d+[^)—]*(?:\)|\.?))/g);
  
  return parts.map((part, i) => {
    // Check if this part looks like a scripture reference
    if (/^(?:—|\()/.test(part)) {
      return <span key={i} className="italic">{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
}
