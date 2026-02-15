import { useState, useEffect } from 'react';
import { BookOpen, X, ChevronRight } from 'lucide-react';
import { loadChapter, initEpub } from '@/lib/epub-service';
import { getLocalizedBookName } from '@/lib/localization';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookId: number;
  chapter: number;
  verse?: number;
  verseEnd?: number;
  verseList?: number[];
}

export default function VersePopup({ open, onOpenChange, bookId, chapter, verse, verseEnd, verseList }: Props) {
  const { language } = useReadingProgress();
  const [verseText, setVerseText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const bookName = getLocalizedBookName(bookId, language);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        await initEpub(language);
        const html = await loadChapter(bookId, chapter, language);
        if (cancelled) return;

        if (html) {
          const targetVerses = verseList || (verse && verseEnd 
            ? Array.from({ length: verseEnd - verse + 1 }, (_, i) => verse + i)
            : verse ? [verse] : undefined);
          
          const extracted = extractVerseText(html, targetVerses);
          setVerseText(extracted || (language === 'en' ? 'Verse not found.' : 'Hindi nahanap ang talata.'));
        } else {
          setVerseText(language === 'en' ? 'Could not load chapter.' : 'Hindi ma-load ang kabanata.');
        }
      } catch {
        if (!cancelled) {
          setVerseText(language === 'en' ? 'Error loading verse.' : 'May error sa pag-load ng talata.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [open, bookId, chapter, verse, verseEnd, verseList, language]);

  const label = verse
    ? verseEnd
      ? `${bookName} ${chapter}:${verse}-${verseEnd}`
      : verseList && verseList.length > 1
        ? `${bookName} ${chapter}:${verseList.join(', ')}`
        : `${bookName} ${chapter}:${verse}`
    : `${bookName} ${chapter}`;

  const subtitle = 'Bagong Sanlibutang Salin ng Banal na Kasulatan (Edisyon sa P...';

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-foreground/20"
            onClick={() => onOpenChange(false)}
          />
          {/* Popup card - matching pic 2 design */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed left-3 right-3 bottom-24 z-[71] max-w-lg mx-auto rounded-2xl bg-card border border-border overflow-hidden"
            style={{
              boxShadow: '0 8px 40px -8px hsl(var(--foreground) / 0.15), 0 2px 12px -4px hsl(var(--foreground) / 0.08)',
            }}
          >
            {/* Header bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-muted/30">
              <span className="text-xs font-medium text-muted-foreground">Binanggit na Teksto</span>
              <button
                onClick={() => onOpenChange(false)}
                className="p-1.5 rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Title row with icon */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-primary">{label}</p>
                <p className="text-[10px] text-primary/70 truncate">{subtitle}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>

            {/* Verse content - scrollable */}
            <div className="max-h-60 overflow-y-auto px-4 py-4">
              {loading ? (
                <div className="space-y-2.5 py-2">
                  <div className="h-3.5 w-full animate-pulse rounded bg-muted" />
                  <div className="h-3.5 w-4/5 animate-pulse rounded bg-muted" />
                  <div className="h-3.5 w-3/5 animate-pulse rounded bg-muted" />
                  <div className="h-3.5 w-full animate-pulse rounded bg-muted" />
                </div>
              ) : (
                <p className="text-sm text-foreground leading-[1.8] whitespace-pre-line">
                  {formatVerseText(verseText)}
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/** Format verse text: bold verse numbers like pic 2 */
function formatVerseText(text: string): React.ReactNode {
  // Split on verse numbers at start of lines
  const parts = text.split(/(\b\d{1,3}\s)/g);
  return parts.map((part, i) => {
    if (/^\d{1,3}\s$/.test(part)) {
      return <span key={i} className="font-bold text-primary">{part}</span>;
    }
    return part;
  });
}

function extractVerseText(html: string, verses?: number[]): string {
  if (!verses || verses.length === 0) {
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return text.slice(0, 500) + (text.length > 500 ? '…' : '');
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const allText = doc.body.textContent || '';
  
  const collectedTexts: string[] = [];
  
  for (const targetVerse of verses) {
    const verseStr = String(targetVerse);
    const nextVerseStr = String(targetVerse + 1);
    
    const verseRegex = new RegExp(
      `(?:^|\\s)${verseStr}\\s+(.*?)(?=\\s+${nextVerseStr}\\s|$)`,
      's'
    );
    
    const match = allText.match(verseRegex);
    if (match) {
      const text = match[1].trim().replace(/\s+/g, ' ');
      if (text.length > 5) {
        collectedTexts.push(`${verseStr} ${text}`);
        continue;
      }
    }

    const segments = allText.split(/\b(\d{1,3})\b/);
    for (let i = 0; i < segments.length; i++) {
      if (segments[i] === verseStr && i + 1 < segments.length) {
        let text = segments[i + 1];
        for (let j = i + 2; j < segments.length; j++) {
          if (/^\d{1,3}$/.test(segments[j])) break;
          text += segments[j];
        }
        const cleaned = text.trim().replace(/\s+/g, ' ');
        if (cleaned.length > 5) {
          collectedTexts.push(`${verseStr} ${cleaned}`);
          break;
        }
      }
    }
  }

  if (collectedTexts.length > 0) {
    return collectedTexts.join('\n\n').slice(0, 2000);
  }

  return allText.slice(0, 400).trim();
}
