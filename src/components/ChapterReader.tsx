import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, BookmarkCheck, ExternalLink } from 'lucide-react';
import { getBookById, getWolUrl, BIBLE_BOOKS } from '@/lib/bible-data';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { loadChapter, initEpub } from '@/lib/epub-service';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';

interface Props {
  bookId: number;
  chapter: number;
}

export default function ChapterReader({ bookId, chapter }: Props) {
  const navigate = useNavigate();
  const book = getBookById(bookId);
  const { isChapterRead, toggleChapterRead, setLastRead, fontSize, language, addReadingTime } = useReadingProgress();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const read = isChapterRead(bookId, chapter);

  // Track reading time
  useEffect(() => {
    timerRef.current = 0;
    intervalRef.current = setInterval(() => {
      timerRef.current += 10;
    }, 10000); // increment every 10 seconds

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

  async function doLoad() {
    setLoading(true);
    try {
      await initEpub(language);
      const html = await loadChapter(bookId, chapter, language);

      if (html && html.trim().length > 50) {
        setContent(html);
      } else {
        setContent(placeholderHtml(bookId, chapter));
      }
    } catch (err) {
      console.error('[Reader] Error:', err);
      setContent(placeholderHtml(bookId, chapter));
    }
    setLoading(false);
  }

  function goToChapter(delta: number) {
    const newCh = chapter + delta;
    if (book && newCh >= 1 && newCh <= book.chapters) {
      navigate(`/reader/${bookId}/${newCh}`, { replace: true });
    } else if (delta > 0) {
      const nextBook = BIBLE_BOOKS.find(b => b.id === bookId + 1);
      if (nextBook) navigate(`/reader/${nextBook.id}/1`, { replace: true });
    } else if (delta < 0) {
      const prevBook = BIBLE_BOOKS.find(b => b.id === bookId - 1);
      if (prevBook) navigate(`/reader/${prevBook.id}/${prevBook.chapters}`, { replace: true });
    }
  }

  function openReference() {
    const url = getWolUrl(bookId, chapter, language);
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  if (!book) return null;

  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        title={`${book.name} ${chapter}`}
        showBack
        actions={
          <div className="flex items-center gap-1">
            <button
              onClick={openReference}
              className="flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
              title="View Reference on WOL"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reference</span>
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
              {read ? 'Read' : 'Mark Read'}
            </button>
          </div>
        }
      />

      <motion.div
        ref={contentRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
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

      {/* Chapter nav */}
      <div className="fixed bottom-16 left-0 right-0 flex items-center justify-between border-t border-border bg-card/95 px-4 py-2 backdrop-blur-lg safe-bottom">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => goToChapter(-1)}
          disabled={bookId === 1 && chapter === 1}
          className="gap-1 text-xs"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
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
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function placeholderHtml(bookId: number, chapter: number): string {
  const book = getBookById(bookId);
  return `
    <div style="text-align:center;padding:2rem 0;">
      <p style="font-size:1.1rem;font-weight:600;">${book?.name || ''} ${chapter}</p>
      <p style="font-size:0.85rem;color:var(--muted-foreground);margin-top:0.5rem;">
        Could not load chapter content from EPUB.
      </p>
    </div>
  `;
}
