import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { fetchAndGetDailyText, getTodaysDailyText } from '@/lib/daily-text-service';
import { makeReferencesClickable } from '@/lib/verse-reference-parser';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { t } from '@/lib/i18n';
import { sanitizeHtml } from '@/lib/sanitize';
import VersePopup from '@/components/VersePopup';

export default function DailyTextCard() {
  const { language } = useReadingProgress();
  const [dailyText, setDailyText] = useState<{ title: string; content: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupRef, setPopupRef] = useState<{ bookId: number; chapter: number; verse?: number }>({ bookId: 1, chapter: 1 });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const cached = getTodaysDailyText();
        if (cached) {
          if (!cancelled) { setDailyText(cached); setLoading(false); }
          return;
        }
        const entry = await fetchAndGetDailyText(new Date());
        if (!cancelled) setDailyText(entry);
      } catch (err) {
        console.error('[DailyText] Load error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [language]);

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

  const today = new Date();
  const dateStr = today.toLocaleDateString('fil-PH', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <span className="app-subheading text-muted-foreground">{t('dailyText.title', language)}</span>
        </div>
        <div className="flex items-center gap-2 py-3">
          <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
          <span className="text-[11px] text-muted-foreground font-medium">Kinukuha ang teksto...</span>
        </div>
      </div>
    );
  }

  if (!dailyText) return null;

  const fullHtml = makeReferencesClickable(dailyText.content);
  const truncLen = 280;
  const truncatedContent = dailyText.content.length > truncLen
    ? dailyText.content.slice(0, truncLen) + '…'
    : dailyText.content;
  const truncatedHtml = dailyText.content.length > truncLen
    ? makeReferencesClickable(truncatedContent)
    : fullHtml;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.35 }}
        className="ghibli-card rounded-2xl border border-border bg-card overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-border/50 bg-primary/[0.03]">
          <div className="flex items-center gap-2 mb-0.5">
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="app-subheading text-muted-foreground">{t('dailyText.title', language)}</span>
            <span className="ml-auto text-[10px] text-muted-foreground font-medium">{dateStr}</span>
          </div>

          {dailyText.title && (
            <p
              className="text-[14px] font-semibold text-foreground mt-2.5 leading-relaxed text-center daily-text-content"
              onClick={handleContentClick}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(`\u201C${makeReferencesClickable(dailyText.title)}\u201D`) }}
            />
          )}
        </div>

        {/* Body */}
        <div className="px-4 py-3.5">
          <div
            className="text-[12px] text-muted-foreground leading-[1.8] daily-text-content"
            style={{ textAlign: 'justify' }}
            onClick={handleContentClick}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(expanded ? fullHtml : truncatedHtml) }}
          />

          {dailyText.content.length > truncLen && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2.5 flex items-center gap-1 text-[10px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wide"
            >
              {expanded ? (
                <>{t('dailyText.showLess', language)} <ChevronUp className="h-3 w-3" /></>
              ) : (
                <>{t('dailyText.readMore', language)} <ChevronDown className="h-3 w-3" /></>
              )}
            </button>
          )}
        </div>
      </motion.div>

      <VersePopup
        open={popupOpen}
        onOpenChange={setPopupOpen}
        bookId={popupRef.bookId}
        chapter={popupRef.chapter}
        verse={popupRef.verse}
      />
    </>
  );
}
