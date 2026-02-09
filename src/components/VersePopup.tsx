import { useState, useEffect } from 'react';
import { X, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadChapter, initEpub } from '@/lib/epub-service';
import { getLocalizedBookName } from '@/lib/localization';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookId: number;
  chapter: number;
  verse?: number;
}

export default function VersePopup({ open, onOpenChange, bookId, chapter, verse }: Props) {
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
          const extracted = extractVerseText(html, verse);
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
  }, [open, bookId, chapter, verse, language]);

  const label = verse
    ? `${bookName} ${chapter}:${verse}`
    : `${bookName} ${chapter}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-4 w-4 text-primary" />
            {label}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-60 overflow-y-auto">
          {loading ? (
            <div className="space-y-2 py-2">
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
              <div className="h-3 w-3/5 animate-pulse rounded bg-muted" />
            </div>
          ) : (
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
              {verseText}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Extract specific verse text from chapter HTML.
 * Looks for verse numbers in bold/sup tags and extracts surrounding text.
 */
function extractVerseText(html: string, verse?: number): string {
  if (!verse) {
    // Return first few paragraphs as summary
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return text.slice(0, 500) + (text.length > 500 ? '…' : '');
  }

  // Try to find verse text by looking for verse number patterns
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const body = doc.body;

  // Method 1: Look for elements with verse number
  const allText = body.textContent || '';
  
  // Find the verse number and extract text until next verse
  const verseStr = String(verse);
  const nextVerseStr = String(verse + 1);
  
  // Pattern: verse number followed by text until next verse number
  const verseRegex = new RegExp(
    `(?:^|\\s)${verseStr}\\s+(.*?)(?=\\s+${nextVerseStr}\\s|$)`,
    's'
  );
  
  const match = allText.match(verseRegex);
  if (match) {
    const text = match[1].trim().replace(/\s+/g, ' ');
    if (text.length > 10) return text.slice(0, 600);
  }

  // Method 2: broader search
  const segments = allText.split(/\b(\d{1,3})\b/);
  for (let i = 0; i < segments.length; i++) {
    if (segments[i] === verseStr && i + 1 < segments.length) {
      let text = segments[i + 1];
      // Collect until next number that could be a verse
      for (let j = i + 2; j < segments.length; j++) {
        if (/^\d{1,3}$/.test(segments[j])) break;
        text += segments[j];
      }
      const cleaned = text.trim().replace(/\s+/g, ' ');
      if (cleaned.length > 10) return cleaned.slice(0, 600);
    }
  }

  return allText.slice(0, 400).trim();
}
