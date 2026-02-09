import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, BookmarkCheck, ExternalLink, Bookmark, PenLine } from 'lucide-react';
import { getBookById, getWolUrl, BIBLE_BOOKS } from '@/lib/bible-data';
import { getLocalizedBookName } from '@/lib/localization';
import { t } from '@/lib/i18n';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { useBookmarks } from '@/contexts/BookmarksContext';
import { loadChapter, initEpub } from '@/lib/epub-service';
import { parseFootnotes } from '@/lib/footnote-parser';
import type { Footnote } from '@/components/FootnotesPanel';
import FootnotesPanel from '@/components/FootnotesPanel';
import PageHeader from '@/components/PageHeader';
import BookmarkDialog from '@/components/BookmarkDialog';
import JournalEntryDialog from '@/components/JournalEntryDialog';
import { Button } from '@/components/ui/button';

interface Props {
  bookId: number;
  chapter: number;
}

const SWIPE_THRESHOLD = 60;
const SWIPE_MAX_Y = 80;

export default function ChapterReader({ bookId, chapter }: Props) {
  const navigate = useNavigate();
  const book = getBookById(bookId);
  const { isChapterRead, toggleChapterRead, setLastRead, fontSize, language, addReadingTime } = useReadingProgress();
  const { isBookmarked } = useBookmarks();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [bookmarkOpen, setBookmarkOpen] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectedVerse, setSelectedVerse] = useState<number | undefined>();
  const [footnotes, setFootnotes] = useState<Footnote[]>([]);
  const [highlightedFootnote, setHighlightedFootnote] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const read = isChapterRead(bookId, chapter);
  const bookmarked = isBookmarked(bookId, chapter);

  const localizedName = getLocalizedBookName(bookId, language);

  // Track reading time
  useEffect(() => {
    timerRef.current = 0;
    intervalRef.current = setInterval(() => {
      timerRef.current += 10;
    }, 10000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current > 0) {
        addReadingTime(timerRef.current);
      }
    };
  }, [bookId, chapter, addReadingTime]);

  useEffect(() => {
    setLastRead(bookId, chapter);
    doLoad();
  }, [bookId, chapter, language]);

  // Add verse tap handlers and footnote marker handlers after content loads
  useEffect(() => {
    if (loading || !contentRef.current) return;

    const container = contentRef.current;

    const verseElements = container.querySelectorAll('[data-verse]');
    const handleVerseTap = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      const verseNum = parseInt(el.getAttribute('data-verse') || '0');
      if (verseNum > 0) {
        const text = el.textContent?.trim() || '';
        setSelectedVerse(verseNum);
        setSelectedText(text.slice(0, 300));
        setBookmarkOpen(true);
      }
    };

    verseElements.forEach(el => {
      el.addEventListener('click', handleVerseTap);
      (el as HTMLElement).style.cursor = 'pointer';
    });

    const footnoteMarkers = container.querySelectorAll('.footnote-marker[data-fn-id]');
    const handleFootnoteTap = (e: Event) => {
      e.stopPropagation();
      const el = e.currentTarget as HTMLElement;
      const fnId = el.getAttribute('data-fn-id');
      if (fnId) {
        setHighlightedFootnote(fnId);
      }
    };

    footnoteMarkers.forEach(el => {
      el.addEventListener('click', handleFootnoteTap);
    });

    return () => {
      verseElements.forEach(el => {
        el.removeEventListener('click', handleVerseTap);
      });
      footnoteMarkers.forEach(el => {
        el.removeEventListener('click', handleFootnoteTap);
      });
    };
  }, [loading, content]);

  async function doLoad() {
    setLoading(true);
    setHighlightedFootnote(null);
    try {
      await initEpub(language);
      const html = await loadChapter(bookId, chapter, language);

      if (html && html.trim().length > 50) {
        const { cleanHtml, footnotes: parsedFootnotes } = parseFootnotes(html);
        setContent(addVerseDataAttributes(cleanHtml));
        setFootnotes(parsedFootnotes);
      } else {
        setContent(placeholderHtml(bookId, chapter, localizedName, language));
        setFootnotes([]);
      }
    } catch (err) {
      console.error('[Reader] Error:', err);
      setContent(placeholderHtml(bookId, chapter, localizedName, language));
    }
    setLoading(false);
  }

  const goToChapter = useCallback((delta: number) => {
    const newCh = chapter + delta;
    if (book && newCh >= 1 && newCh <= book.chapters) {
      setSlideDirection(delta > 0 ? 'left' : 'right');
      navigate(`/reader/${bookId}/${newCh}`, { replace: true });
    } else if (delta > 0) {
      const nextBook = BIBLE_BOOKS.find(b => b.id === bookId + 1);
      if (nextBook) {
        setSlideDirection('left');
        navigate(`/reader/${nextBook.id}/1`, { replace: true });
      }
    } else if (delta < 0) {
      const prevBook = BIBLE_BOOKS.find(b => b.id === bookId - 1);
      if (prevBook) {
        setSlideDirection('right');
        navigate(`/reader/${prevBook.id}/${prevBook.chapters}`, { replace: true });
      }
    }
  }, [book, bookId, chapter, navigate]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
    touchStartRef.current = null;

    if (deltaY > SWIPE_MAX_Y) return;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;

    if (deltaX < 0) {
      goToChapter(1);
    } else {
      goToChapter(-1);
    }
  }, [goToChapter]);

  const handleBookmark = useCallback(() => {
    const selection = window.getSelection()?.toString().trim();
    if (selection && selection.length > 5) {
      setSelectedText(selection);
      setSelectedVerse(undefined);
    } else {
      const plainText = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      setSelectedText(plainText.slice(0, 200));
      setSelectedVerse(undefined);
    }
    setBookmarkOpen(true);
  }, [content]);

  function openReference() {
    const url = getWolUrl(bookId, chapter, language);
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  const handleClearHighlight = useCallback(() => {
    setHighlightedFootnote(null);
  }, []);

  if (!book) return null;

  const slideVariants = {
    enter: (dir: 'left' | 'right' | null) => ({
      x: dir === 'left' ? 80 : dir === 'right' ? -80 : 0,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: 'left' | 'right' | null) => ({
      x: dir === 'left' ? -80 : dir === 'right' ? 80 : 0,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        title={`${localizedName} ${chapter}`}
        showBack
        actions={
          <div className="flex items-center gap-1">
            <button
              onClick={openReference}
              className="flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
              title={t('reader.reference', language)}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('reader.reference', language)}</span>
            </button>
            <button
              onClick={handleBookmark}
              className={`flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-medium transition-colors ${
                bookmarked
                  ? 'text-accent bg-accent/10'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
              title={t('bookmarks.saveBookmark', language)}
            >
              <Bookmark className={`h-3.5 w-3.5 ${bookmarked ? 'fill-accent' : ''}`} />
            </button>
            <button
              onClick={() => setJournalOpen(true)}
              className="flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
              title={t('journal.newEntry', language)}
            >
              <PenLine className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => toggleChapterRead(bookId, chapter)}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                read
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
              }`}
            >
              {read ? <Check className="h-3.5 w-3.5" /> : <BookmarkCheck className="h-3.5 w-3.5" />}
              {read ? t('reader.read', language) : t('reader.markRead', language)}
            </button>
          </div>
        }
      />

      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="min-h-[60vh]"
      >
        <AnimatePresence mode="wait" custom={slideDirection}>
          <motion.div
            key={`${bookId}-${chapter}`}
            ref={contentRef}
            custom={slideDirection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="px-5 py-4"
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
          >
            {loading ? (
              <div className="space-y-3 py-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-4 animate-pulse rounded bg-muted"
                    style={{ width: `${60 + Math.random() * 40}%` }}
                  />
                ))}
              </div>
            ) : (
              <div
                className="bible-content"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {!loading && (
        <FootnotesPanel
          footnotes={footnotes}
          highlightedId={highlightedFootnote}
          onHighlightClear={handleClearHighlight}
        />
      )}

      {!loading && (
        <p className="text-center text-[10px] text-muted-foreground/60 px-4 pb-2">
          {t('reader.verseTip', language)}
        </p>
      )}

      <div className="fixed bottom-16 left-0 right-0 flex items-center justify-between border-t border-border bg-card/95 px-4 py-2 backdrop-blur-lg safe-bottom">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => goToChapter(-1)}
          disabled={bookId === 1 && chapter === 1}
          className="gap-1 text-xs"
        >
          <ChevronLeft className="h-4 w-4" /> {t('reader.previous', language)}
        </Button>
        <span className="text-xs text-muted-foreground">
          {chapter} / {book.chapters}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => goToChapter(1)}
          disabled={bookId === 66 && chapter === book.chapters}
          className="gap-1 text-xs"
        >
          {t('reader.next', language)} <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <BookmarkDialog
        open={bookmarkOpen}
        onOpenChange={setBookmarkOpen}
        bookId={bookId}
        chapter={chapter}
        verse={selectedVerse}
        selectedText={selectedText}
      />

      <JournalEntryDialog
        open={journalOpen}
        onOpenChange={setJournalOpen}
        prefillBookId={bookId}
        prefillChapter={chapter}
      />
    </div>
  );
}

function addVerseDataAttributes(html: string): string {
  let result = html.replace(
    /(<strong>\s*<a[^>]*>\s*<sup>\s*)(\d+)(\s*<\/sup>\s*<\/a>\s*<\/strong>)/gi,
    (match, prefix, num, suffix) => {
      return `<span data-verse="${num}" class="verse-tap-target">${prefix}${num}${suffix}</span>`;
    }
  );
  result = result.replace(
    /(<strong>)(\d{1,2})(<\/strong>)(?!\s*<\/h)/gi,
    (match, open, num, close) => {
      if (match.includes('data-verse')) return match;
      return `<span data-verse="${num}" class="verse-tap-target">${open}${num}${close}</span>`;
    }
  );
  return result;
}

function placeholderHtml(bookId: number, chapter: number, name: string, language: string): string {
  const msg = language === 'en'
    ? 'Could not load chapter content from EPUB.'
    : 'Hindi ma-load ang nilalaman ng kabanata mula sa EPUB.';
  return `
    <div style="text-align:center;padding:2rem 0;">
      <p style="font-size:1.1rem;font-weight:600;">${name} ${chapter}</p>
      <p style="font-size:0.85rem;color:var(--muted-foreground);margin-top:0.5rem;">
        ${msg}
      </p>
    </div>
  `;
}
