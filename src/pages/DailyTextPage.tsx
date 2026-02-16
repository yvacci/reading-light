import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight, Loader2, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchAndGetDailyText, getDailyTextByDate } from '@/lib/daily-text-service';
import { makeReferencesClickable, parseVerseReferences, type ParsedReference } from '@/lib/verse-reference-parser';
import { sanitizeHtml } from '@/lib/sanitize';
import { getLocalizedBookName } from '@/lib/localization';
import { loadChapter, initEpub } from '@/lib/epub-service';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import ReferencePane from '@/components/ReferencePane';
import { t } from '@/lib/i18n';

interface InlineVerse {
  ref: ParsedReference;
  label: string;
  text: string;
  loading: boolean;
  error: boolean;
}

export default function DailyTextPage() {
  const navigate = useNavigate();
  const { language } = useReadingProgress();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyText, setDailyText] = useState<{ title: string; content: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [inlineVerses, setInlineVerses] = useState<InlineVerse[]>([]);
  const [expandedRefs, setExpandedRefs] = useState<Set<string>>(new Set());
  const [autoDisplayed, setAutoDisplayed] = useState(false);
  const [refPaneOpen, setRefPaneOpen] = useState(false);
  const [refPaneVerse, setRefPaneVerse] = useState<{ bookId: number; chapter: number; verse?: number; text?: string } | undefined>();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setInlineVerses([]);
      setExpandedRefs(new Set());
      setAutoDisplayed(false);
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

  // Auto-fetch all verse references once daily text loads
  useEffect(() => {
    if (!dailyText || autoDisplayed) return;
    setAutoDisplayed(true);

    const fullText = (dailyText.title || '') + ' ' + (dailyText.content || '');
    const refs = parseVerseReferences(fullText);
    if (refs.length === 0) return;

    const initialVerses: InlineVerse[] = refs.map(ref => {
      const bookName = getLocalizedBookName(ref.bookId, language);
      let label = `${bookName} ${ref.chapter}`;
      if (ref.verse) {
        label += `:${ref.verse}`;
        if (ref.verseEnd) label += `-${ref.verseEnd}`;
        else if (ref.verseList && ref.verseList.length > 1) label += `, ${ref.verseList.slice(1).join(', ')}`;
      }
      return { ref, label, text: '', loading: true, error: false };
    });

    setInlineVerses(initialVerses);

    (async () => {
      try {
        await initEpub(language);
      } catch { return; }

      for (let i = 0; i < refs.length; i++) {
        const ref = refs[i];
        try {
          const html = await loadChapter(ref.bookId, ref.chapter, language);
          if (html) {
            const targetVerses = ref.verseList || (ref.verse && ref.verseEnd
              ? Array.from({ length: ref.verseEnd - ref.verse + 1 }, (_, j) => ref.verse! + j)
              : ref.verse ? [ref.verse] : undefined);
            const text = extractVerseTextSimple(html, targetVerses);
            setInlineVerses(prev => prev.map((v, idx) => idx === i ? { ...v, text, loading: false } : v));
          } else {
            setInlineVerses(prev => prev.map((v, idx) => idx === i ? { ...v, loading: false, error: true } : v));
          }
        } catch {
          setInlineVerses(prev => prev.map((v, idx) => idx === i ? { ...v, loading: false, error: true } : v));
        }
      }
    })();
  }, [dailyText, autoDisplayed, language]);

  const goDay = (delta: number) => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + delta);
      return d;
    });
  };

  // When a verse reference is tapped, open the Reference Pane (not a popup)
  const handleContentClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const refEl = target.closest('.verse-ref-link');
    if (refEl) {
      e.preventDefault();
      const bookId = parseInt(refEl.getAttribute('data-book') || '0');
      const chapter = parseInt(refEl.getAttribute('data-chapter') || '0');
      const verse = parseInt(refEl.getAttribute('data-verse') || '0') || undefined;
      const verseEnd = parseInt(refEl.getAttribute('data-verse-end') || '0') || undefined;
      const verseListStr = refEl.getAttribute('data-verse-list') || '';
      const verseList = verseListStr ? verseListStr.split(',').map(Number).filter(Boolean) : undefined;
      if (bookId && chapter) {
        const bookName = getLocalizedBookName(bookId, language);
        let label = `${bookName} ${chapter}`;
        if (verse) {
          label += `:${verse}`;
          if (verseEnd) label += `–${verseEnd}`;
          else if (verseList && verseList.length > 1) label += `, ${verseList.slice(1).join(', ')}`;
        }

        // Find matching inline verse text if already fetched
        const match = inlineVerses.find(iv =>
          iv.ref.bookId === bookId && iv.ref.chapter === chapter && iv.ref.verse === verse
        );

        setRefPaneVerse({
          bookId,
          chapter,
          verse,
          text: match?.text || `${label} — Kinukuha ang teksto...`,
        });
        setRefPaneOpen(true);
      }
    }
  }, [inlineVerses, language]);

  const toggleExpanded = (key: string) => {
    setExpandedRefs(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
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
    <div className="min-h-screen pb-20 bg-background">
      {/* Header */}
      <div className="px-5 pt-12 pb-2 safe-top">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{t('dailyText.title')}</p>
        </div>
        <h1 className="mt-1.5 text-xl font-bold text-foreground tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
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

      {/* Content — split-pane on md+ */}
      <div className="px-5 max-w-5xl mx-auto md:grid md:grid-cols-[1fr_340px] md:gap-6">
        {/* Main content */}
        <div>
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
                className="text-[13px] text-foreground/80 leading-[1.85] daily-text-content"
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

        {/* Right sidebar — inline verse references (visible on md+) */}
        <div className="hidden md:block">
          {inlineVerses.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-4 sticky top-4 space-y-3 max-h-[calc(100vh-120px)] overflow-y-auto">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary">Sanggunian</p>
              {inlineVerses.map((iv, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setRefPaneVerse({ bookId: iv.ref.bookId, chapter: iv.ref.chapter, verse: iv.ref.verse, text: iv.text || iv.label });
                    setRefPaneOpen(true);
                  }}
                  className="block w-full text-left rounded-xl bg-muted/50 p-3 hover:bg-muted transition-colors"
                >
                  <p className="text-[11px] font-semibold text-foreground">{iv.label}</p>
                  {iv.loading ? (
                    <Loader2 className="h-3 w-3 text-primary animate-spin mt-1" />
                  ) : iv.text ? (
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-3 leading-relaxed">{iv.text}</p>
                  ) : null}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <ReferencePane
        open={refPaneOpen}
        onClose={() => setRefPaneOpen(false)}
        verseRef={refPaneVerse}
      />
    </div>
  );
}

function extractVerseTextSimple(html: string, verses?: number[]): string {
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!verses || verses.length === 0) {
    return text.slice(0, 500) + (text.length > 500 ? '…' : '');
  }

  const collected: string[] = [];
  for (const v of verses) {
    const vStr = String(v);
    const nextStr = String(v + 1);
    const regex = new RegExp(`(?:^|\\s)${vStr}\\s+(.*?)(?=\\s+${nextStr}\\s|$)`, 's');
    const match = text.match(regex);
    if (match) {
      const t = match[1].trim().replace(/\s+/g, ' ');
      if (t.length > 5) { collected.push(`${vStr} ${t}`); continue; }
    }
    const segs = text.split(/\b(\d{1,3})\b/);
    for (let i = 0; i < segs.length; i++) {
      if (segs[i] === vStr && i + 1 < segs.length) {
        let s = segs[i + 1];
        for (let j = i + 2; j < segs.length; j++) {
          if (/^\d{1,3}$/.test(segs[j])) break;
          s += segs[j];
        }
        const c = s.trim().replace(/\s+/g, ' ');
        if (c.length > 5) { collected.push(`${vStr} ${c}`); break; }
      }
    }
  }

  return collected.length > 0 ? collected.join('\n\n').slice(0, 2000) : text.slice(0, 400);
}
