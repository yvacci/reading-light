import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, X, ChevronRight } from 'lucide-react';
import { loadChapter, initEpub } from '@/lib/epub-service';
import { getLocalizedBookName } from '@/lib/localization';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';

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
  const navigate = useNavigate();
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

  const handleGoToBible = () => {
    onOpenChange(false);
    navigate(`/reader/${bookId}/${chapter}`);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center" onClick={() => onOpenChange(false)}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/25 backdrop-blur-sm" />
      
      {/* Popup card - matches pic 2 style */}
      <div
        className="relative z-10 w-full max-w-md mx-4 mb-4 sm:mb-0 rounded-2xl bg-card border border-border overflow-hidden"
        style={{ boxShadow: '0 8px 32px -4px hsl(var(--foreground) / 0.15), 0 4px 16px -2px hsl(var(--foreground) / 0.1)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header with title and close */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
          <p className="text-xs font-semibold text-muted-foreground tracking-wide">Binanggit na Teksto</p>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Reference title + navigate to Bible */}
        <div className="px-4 py-3 border-b border-border/30">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary shrink-0" />
            <p className="text-sm font-bold text-primary flex-1">{label}</p>
            <button
              onClick={handleGoToBible}
              className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
              title="Buksan sa Bibliya"
            >
              <ChevronRight className="h-4 w-4 text-primary" />
            </button>
          </div>
          <button
            onClick={handleGoToBible}
            className="mt-1 text-[11px] text-primary/80 hover:text-primary hover:underline transition-colors truncate block max-w-full text-left"
          >
            Bagong Sanlibutang Salin ng Banal na Kasulatan (Edisyon sa P…)
          </button>
        </div>

        {/* Verse content */}
        <div className="max-h-64 overflow-y-auto px-4 py-4">
          {loading ? (
            <div className="space-y-2 py-2">
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
              <div className="h-3 w-3/5 animate-pulse rounded bg-muted" />
            </div>
          ) : (
            <p className="text-[13px] text-foreground leading-[1.85] whitespace-pre-line" style={{ fontFamily: "'Inter', sans-serif" }}>
              {verseText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
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
