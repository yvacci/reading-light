import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, BookmarkCheck } from 'lucide-react';
import { getBookById, BIBLE_BOOKS } from '@/lib/bible-data';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';

interface Props {
  bookId: number;
  chapter: number;
}

export default function ChapterReader({ bookId, chapter }: Props) {
  const navigate = useNavigate();
  const book = getBookById(bookId);
  const { isChapterRead, markChapterRead, toggleChapterRead, setLastRead, fontSize } = useReadingProgress();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const read = isChapterRead(bookId, chapter);

  useEffect(() => {
    setLastRead(bookId, chapter);
    loadChapterContent();
  }, [bookId, chapter]);

  async function loadChapterContent() {
    setLoading(true);
    try {
      // Try to load from the EPUB using epubjs
      const ePub = (await import('epubjs')).default;
      const epub = ePub('/bibles/nwt_TG.epub');
      await epub.ready;
      
      const spine = epub.spine as any;
      // Find the chapter in the spine
      // NWT EPUBs typically have chapters organized by book
      let found = false;
      const items = spine.items || spine.spineItems || [];
      
      for (const item of items) {
        const href = item.href || '';
        // Try to match chapter by book ID and chapter number
        // NWT EPUBs use various naming conventions
        if (matchesChapter(href, bookId, chapter)) {
          try {
            const doc = await item.load(epub.load.bind(epub));
            if (doc) {
              const body = doc.querySelector ? doc.querySelector('body') : doc.body;
              if (body) {
                setContent(body.innerHTML || body.textContent || '');
                found = true;
              }
            }
          } catch {
            // Continue to next
          }
          break;
        }
      }
      
      if (!found) {
        // Fallback: show placeholder
        setContent(generatePlaceholderContent(bookId, chapter));
      }

      epub.destroy();
    } catch (err) {
      console.error('Error loading EPUB:', err);
      setContent(generatePlaceholderContent(bookId, chapter));
    }
    setLoading(false);
  }

  function handleMarkRead() {
    toggleChapterRead(bookId, chapter);
  }

  function goToChapter(delta: number) {
    const newCh = chapter + delta;
    if (book && newCh >= 1 && newCh <= book.chapters) {
      navigate(`/reader/${bookId}/${newCh}`, { replace: true });
    } else if (delta > 0) {
      // Go to next book
      const nextBook = BIBLE_BOOKS.find(b => b.id === bookId + 1);
      if (nextBook) navigate(`/reader/${nextBook.id}/1`, { replace: true });
    } else if (delta < 0) {
      // Go to previous book's last chapter
      const prevBook = BIBLE_BOOKS.find(b => b.id === bookId - 1);
      if (prevBook) navigate(`/reader/${prevBook.id}/${prevBook.chapters}`, { replace: true });
    }
  }

  if (!book) return null;

  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        title={`${book.name} ${chapter}`}
        showBack
        actions={
          <button
            onClick={handleMarkRead}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              read
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
            }`}
          >
            {read ? <Check className="h-3.5 w-3.5" /> : <BookmarkCheck className="h-3.5 w-3.5" />}
            {read ? 'Read' : 'Mark Read'}
          </button>
        }
      />

      <motion.div
        ref={contentRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="px-5 py-4"
        style={{ fontSize: `${fontSize}px`, lineHeight: 1.75 }}
      >
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 animate-pulse rounded bg-muted" style={{ width: `${70 + Math.random() * 30}%` }} />
            ))}
          </div>
        ) : (
          <div
            className="prose prose-sm max-w-none text-foreground dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </motion.div>

      {/* Chapter Navigation */}
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

function matchesChapter(href: string, bookId: number, chapter: number): boolean {
  // Common NWT EPUB patterns
  const lower = href.toLowerCase();
  // Pattern: chapter_XX_YY or bookXX_chapterYY
  const bookNum = String(bookId).padStart(2, '0');
  const chNum = String(chapter).padStart(2, '0');
  
  return (
    lower.includes(`${bookNum}_${chNum}`) ||
    lower.includes(`${bookNum}${chNum}`) ||
    lower.includes(`chapter${chapter}`) ||
    lower.includes(`_${bookId}_${chapter}`)
  );
}

function generatePlaceholderContent(bookId: number, chapter: number): string {
  const book = getBookById(bookId);
  if (!book) return '';
  
  // Generate realistic-looking placeholder
  const verses = Math.floor(Math.random() * 20) + 10;
  let html = `<h2 class="text-lg font-bold mb-4">${book.name} ${chapter}</h2>`;
  for (let v = 1; v <= verses; v++) {
    html += `<p class="mb-2"><sup class="text-primary font-bold mr-1 text-xs">${v}</sup> <span class="text-muted-foreground italic text-sm">[EPUB content will appear here when the chapter is found in the EPUB file. Navigate to mark this chapter as read.]</span></p>`;
  }
  return html;
}
