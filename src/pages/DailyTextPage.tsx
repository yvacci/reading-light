import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight, Loader2, Calendar } from 'lucide-react';
import { fetchAndGetDailyText, getDailyTextByDate } from '@/lib/daily-text-service';
import { makeReferencesClickable } from '@/lib/verse-reference-parser';
import { sanitizeHtml } from '@/lib/sanitize';
import VersePopup from '@/components/VersePopup';
import { t } from '@/lib/i18n';
import { useCallback } from 'react';

export default function DailyTextPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyText, setDailyText] = useState<{ title: string; content: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupRef, setPopupRef] = useState<{ bookId: number; chapter: number; verse?: number }>({ bookId: 1, chapter: 1 });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const cached = getDailyTextByDate(currentDate.getMonth() + 1, currentDate.getDate());
        if (cached) {
          if (!cancelled) { setDailyText(cached); setLoading(false); }
          return;
        }
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

  const handleContentClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const refEl = target.closest('.verse-ref-link');
    if (refEl) {
      e.preventDefault();
      const bookId = parseInt(refEl.getAttribute('data-book') || '0');
      const chapter = parseInt(refEl.getAttribute('data-chapter') || '0');
      const verse = parseInt(refEl.getAttribute('data-verse') || '0') || undefined;
      if (bookId && chapter) {
        setPopupRef({ bookId, chapter, verse });
        setPopupOpen(true);
      }
    }
  }, []);

  const dateStr = currentDate.toLocaleDateString('fil-PH', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const isToday = currentDate.toDateString() === new Date().toDateString();

  return (
    <div className="min-h-screen pb-20 bg-background">
      {/* Header */}
      <div className="px-5 pt-12 pb-2 safe-top">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">{t('dailyText.title')}</p>
        </div>
        <h1 className="mt-1 text-xl font-bold text-foreground tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
          {t('dailyText.pageSubtitle')}
        </h1>
      </div>

      {/* Date navigation */}
      <div className="px-5 py-3">
        <div className="flex items-center justify-between rounded-2xl bg-card border border-border px-2 py-2">
          <button onClick={() => goDay(-1)} className="p-2.5 rounded-xl hover:bg-muted active:scale-95 transition-all">
            <ChevronLeft className="h-4 w-4 text-foreground" />
          </button>
          <div className="text-center flex-1">
            <p className="text-xs font-semibold text-foreground tracking-tight">{dateStr}</p>
            {!isToday && (
              <button
                onClick={() => setCurrentDate(new Date())}
                className="text-[10px] text-primary font-semibold mt-0.5 hover:opacity-70 transition-opacity"
              >
                {t('dailyText.goToToday')}
              </button>
            )}
          </div>
          <button onClick={() => goDay(1)} className="p-2.5 rounded-xl hover:bg-muted active:scale-95 transition-all">
            <ChevronRight className="h-4 w-4 text-foreground" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-5">
        {loading ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
            <p className="text-[11px] text-muted-foreground font-medium">Kinukuha ang teksto...</p>
          </div>
        ) : dailyText ? (
          <motion.div
            key={currentDate.toISOString().slice(0, 10)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-border bg-card overflow-hidden"
          >
            {/* Title card */}
            <div className="px-5 pt-5 pb-4 border-b border-border/50 bg-primary/[0.03]">
              <div className="flex items-center justify-center gap-2 mb-3">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.12em]">{t('dailyText.title')}</span>
              </div>
              {dailyText.title && (
                <p
                  className="text-[15px] font-semibold text-foreground text-center leading-relaxed daily-text-content"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                  onClick={handleContentClick}
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(`\u201C${makeReferencesClickable(dailyText.title)}\u201D`) }}
                />
              )}
            </div>

            {/* Body content */}
            <div className="px-5 py-5">
              <div
                className="text-[13px] text-muted-foreground leading-[1.85] daily-text-content"
                style={{ textAlign: 'justify', fontFamily: "'Inter', sans-serif" }}
                onClick={handleContentClick}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(makeReferencesClickable(dailyText.content)) }}
              />
            </div>
          </motion.div>
        ) : (
          <div className="py-16 text-center rounded-2xl border border-border bg-card">
            <BookOpen className="h-7 w-7 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">{t('dailyText.noEntry')}</p>
            <p className="text-[11px] text-muted-foreground/70 mt-1">Kailangan ng internet connection para makuha ang teksto.</p>
          </div>
        )}
      </div>

      <VersePopup
        open={popupOpen}
        onOpenChange={setPopupOpen}
        bookId={popupRef.bookId}
        chapter={popupRef.chapter}
        verse={popupRef.verse}
      />
    </div>
  );
}
