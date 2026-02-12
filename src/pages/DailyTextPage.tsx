import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { fetchAndGetDailyText, getDailyTextByDate } from '@/lib/daily-text-service';
import { t } from '@/lib/i18n';

export default function DailyTextPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyText, setDailyText] = useState<{ title: string; content: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        // Check cache first
        const cached = getDailyTextByDate(currentDate.getMonth() + 1, currentDate.getDate());
        if (cached) {
          if (!cancelled) { setDailyText(cached); setLoading(false); }
          return;
        }
        // Fetch from server
        const entry = await fetchAndGetDailyText(currentDate);
        if (!cancelled) setDailyText(entry);
      } catch (err) {
        console.error('[DailyText] Load error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [currentDate]);

  const goDay = (delta: number) => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + delta);
      return d;
    });
  };

  const dateStr = currentDate.toLocaleDateString('fil-PH', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const isToday = currentDate.toDateString() === new Date().toDateString();

  return (
    <div className="min-h-screen pb-20">
      <div className="px-5 pt-12 pb-4 safe-top">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">{t('dailyText.title')}</p>
        <h1 className="mt-1 text-2xl font-bold text-foreground">{t('dailyText.pageSubtitle')}</h1>
      </div>

      <div className="px-5 pt-2 space-y-4">
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
                {t('dailyText.goToToday')}
              </button>
            )}
          </div>
          <button onClick={() => goDay(1)} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-12 flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground">Kinukuha ang teksto...</p>
          </div>
        ) : dailyText ? (
          <motion.div
            key={currentDate.toISOString().slice(0, 10)}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">{t('dailyText.title')}</span>
            </div>

            {dailyText.title && (
              <p className="text-sm font-medium text-foreground text-center mb-5 italic leading-relaxed">
                &ldquo;{dailyText.title}&rdquo;
              </p>
            )}

            <div
              className="text-sm text-muted-foreground leading-relaxed"
              style={{ textAlign: 'justify' }}
            >
              {renderPlainText(dailyText.content)}
            </div>
          </motion.div>
        ) : (
          <div className="py-12 text-center">
            <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{t('dailyText.noEntry')}</p>
            <p className="text-xs text-muted-foreground mt-1">Kailangan ng internet connection para makuha ang teksto.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function renderPlainText(content: string) {
  const paragraphs = content.split('\n\n');
  return paragraphs.map((para, i) => {
    const parts = para.split(/((?:—|\()\s*(?:[1-3]\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\.?\s+\d+:\d+[^)—]*(?:\)|\.?))/g);
    return (
      <p key={i} className="mb-3">
        {parts.map((part, j) => {
          if (/^(?:—|\()/.test(part)) {
            return <span key={j} className="italic">{part}</span>;
          }
          return <span key={j}>{part}</span>;
        })}
      </p>
    );
  });
}
