import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, BookmarkCheck, ExternalLink, Bookmark, PenLine, Highlighter, PanelLeftOpen } from 'lucide-react';
import { getBookById, getWolUrl, BIBLE_BOOKS } from '@/lib/bible-data';
import { getLocalizedBookName } from '@/lib/localization';
import { t } from '@/lib/i18n';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { useBookmarks } from '@/contexts/BookmarksContext';
import { useHighlights, HIGHLIGHT_COLORS } from '@/hooks/useHighlights';
import { loadChapter, initEpub } from '@/lib/epub-service';
import { parseFootnotes } from '@/lib/footnote-parser';
import type { Footnote } from '@/components/FootnotesPanel';
import FootnotesPanel from '@/components/FootnotesPanel';
import PageHeader from '@/components/PageHeader';
import BookmarkDialog from '@/components/BookmarkDialog';
import JournalEntryDialog from '@/components/JournalEntryDialog';
import HighlightColorPicker from '@/components/HighlightColorPicker';
import { Button } from '@/components/ui/button';
import InAppBrowser from '@/components/InAppBrowser';
import ReaderBottomToolbar from '@/components/ReaderBottomToolbar';

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
  const { addHighlight, getChapterHighlights, removeHighlight, updateHighlightColor } = useHighlights();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [bookmarkOpen, setBookmarkOpen] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectedVerse, setSelectedVerse] = useState<number | undefined>();
  const [footnotes, setFootnotes] = useState<Footnote[]>([]);
  const [highlightedFootnote, setHighlightedFootnote] = useState<string | null>(null);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [colorPickerPos, setColorPickerPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [pendingHighlightText, setPendingHighlightText] = useState('');
  const [pendingHighlightVerse, setPendingHighlightVerse] = useState(0);
  const [editingHighlightId, setEditingHighlightId] = useState<string | null>(null);
  const [editingHighlightColor, setEditingHighlightColor] = useState<string | undefined>();
  const [emphasizedVerse, setEmphasizedVerse] = useState<number | null>(null);
  const [refPaneOpen, setRefPaneOpen] = useState(false);
  const [refPaneUrl, setRefPaneUrl] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const read = isChapterRead(bookId, chapter);
  const bookmarked = isBookmarked(bookId, chapter);
  const chapterHighlights = getChapterHighlights(bookId, chapter);

  const localizedName = getLocalizedBookName(bookId);

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
  }, [bookId, chapter]);

  useEffect(() => {
    if (loading || !contentRef.current) return;
    const container = contentRef.current;

    const verseElements = container.querySelectorAll('[data-verse]');
    const handleVerseTap = (e: Event) => {
      e.stopPropagation();
      const el = e.currentTarget as HTMLElement;
      const verseNum = parseInt(el.getAttribute('data-verse') || '0');
      if (verseNum > 0) {
        setEmphasizedVerse(prev => prev === verseNum ? null : verseNum);
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
      if (fnId) setHighlightedFootnote(fnId);
    };

    footnoteMarkers.forEach(el => {
      el.addEventListener('click', handleFootnoteTap);
    });

    return () => {
      verseElements.forEach(el => el.removeEventListener('click', handleVerseTap));
      footnoteMarkers.forEach(el => el.removeEventListener('click', handleFootnoteTap));
    };
  }, [loading, content]);

  useEffect(() => {
    if (!contentRef.current) return;
    const container = contentRef.current;
    container.querySelectorAll('[data-verse]').forEach(el => {
      const v = parseInt(el.getAttribute('data-verse') || '0');
      if (emphasizedVerse !== null && v === emphasizedVerse) {
        el.classList.add('verse-emphasized');
      } else {
        el.classList.remove('verse-emphasized');
      }
    });
  }, [emphasizedVerse, loading, content]);

  async function doLoad() {
    setLoading(true);
    setHighlightedFootnote(null);
    try {
      await initEpub();
      const html = await loadChapter(bookId, chapter);

      if (html && html.trim().length > 50) {
        const { cleanHtml, footnotes: parsedFootnotes } = parseFootnotes(html);
        setContent(addVerseDataAttributes(cleanHtml));
        setFootnotes(parsedFootnotes);
      } else {
        setContent(placeholderHtml(bookId, chapter, localizedName));
        setFootnotes([]);
      }
    } catch (err) {
      console.error('[Reader] Error:', err);
      setContent(placeholderHtml(bookId, chapter, localizedName));
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

    if (deltaX < 0) goToChapter(1);
    else goToChapter(-1);
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

  const handleHighlightTrigger = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim() || '';
    if (text.length < 3) return;

    const anchorNode = selection?.anchorNode;
    let verse = 0;
    if (anchorNode) {
      let el: HTMLElement | null = anchorNode.nodeType === Node.TEXT_NODE
        ? (anchorNode.parentElement as HTMLElement)
        : (anchorNode as HTMLElement);
      while (el && !el.getAttribute?.('data-verse')) {
        el = el.parentElement;
      }
      if (el) verse = parseInt(el.getAttribute('data-verse') || '0');
    }

    const range = selection?.getRangeAt(0);
    const rect = range?.getBoundingClientRect();
    if (rect) {
      setColorPickerPos({ x: rect.left + rect.width / 2, y: rect.top });
    }
    setPendingHighlightText(text);
    setPendingHighlightVerse(verse || 1);
    setColorPickerOpen(true);
  }, []);

  const handleColorSelect = useCallback((color: string) => {
    if (editingHighlightId) {
      updateHighlightColor(editingHighlightId, color);
      setEditingHighlightId(null);
      setEditingHighlightColor(undefined);
    } else if (pendingHighlightText) {
      addHighlight({
        bookId,
        chapter,
        verseStart: pendingHighlightVerse,
        verseEnd: pendingHighlightVerse,
        color,
        text: pendingHighlightText.slice(0, 500),
      });
      window.getSelection()?.removeAllRanges();
      setPendingHighlightText('');
    }
  }, [editingHighlightId, pendingHighlightText, pendingHighlightVerse, bookId, chapter, addHighlight, updateHighlightColor]);

  const handleHighlightDelete = useCallback(() => {
    if (editingHighlightId) {
      removeHighlight(editingHighlightId);
      setEditingHighlightId(null);
      setEditingHighlightColor(undefined);
    }
  }, [editingHighlightId, removeHighlight]);

  const applyHighlights = useCallback(() => {
    if (!contentRef.current || loading) return;
    const container = contentRef.current;
    
    container.querySelectorAll('mark.user-highlight').forEach(el => {
      const parent = el.parentNode;
      if (parent) {
        while (el.firstChild) parent.insertBefore(el.firstChild, el);
        parent.removeChild(el);
      }
    });

    for (const hl of chapterHighlights) {
      const textNodes: Text[] = [];
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
      let node: Text | null;
      while ((node = walker.nextNode() as Text | null)) {
        textNodes.push(node);
      }

      for (const textNode of textNodes) {
        const idx = textNode.textContent?.indexOf(hl.text.slice(0, 30)) ?? -1;
        if (idx >= 0) {
          const range = document.createRange();
          range.setStart(textNode, idx);
          range.setEnd(textNode, Math.min(idx + hl.text.slice(0, 30).length, textNode.textContent?.length || 0));
          const mark = document.createElement('mark');
          mark.className = 'user-highlight';
          mark.style.backgroundColor = hl.color;
          mark.style.borderRadius = '2px';
          mark.style.padding = '0 1px';
          mark.style.cursor = 'pointer';
          mark.setAttribute('data-highlight-id', hl.id);
          mark.addEventListener('click', (e) => {
            e.stopPropagation();
            const rect = mark.getBoundingClientRect();
            setColorPickerPos({ x: rect.left + rect.width / 2, y: rect.top });
            setEditingHighlightId(hl.id);
            setEditingHighlightColor(hl.color);
            setPendingHighlightText('');
            setColorPickerOpen(true);
          });
          range.surroundContents(mark);
          break;
        }
      }
    }
  }, [chapterHighlights, loading]);

  useEffect(() => {
    if (!loading && content) {
      const timer = setTimeout(applyHighlights, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, content, applyHighlights]);

  function openReference() {
    const url = getWolUrl(bookId, chapter);
    setRefPaneUrl(url);
    setRefPaneOpen(true);
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
              title={t('reader.reference')}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleBookmark}
              className={`flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-medium transition-colors ${
                bookmarked
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
              title={t('bookmarks.saveBookmark')}
            >
              <Bookmark className={`h-3.5 w-3.5 ${bookmarked ? 'fill-primary' : ''}`} />
            </button>
            <button
              onClick={() => setJournalOpen(true)}
              className="flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
              title={t('journal.newEntry')}
            >
              <PenLine className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleHighlightTrigger}
              className="flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
              title={t('highlights.pickColor')}
            >
              <Highlighter className="h-3.5 w-3.5" />
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
              {read ? t('reader.read') : t('reader.markRead')}
            </button>
          </div>
        }
      />

      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="min-h-[60vh]"
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest('[data-verse]')) {
            setEmphasizedVerse(null);
          }
        }}
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
                className={`bible-content ${emphasizedVerse !== null ? 'verse-emphasis-active' : ''}`}
                data-emphasized-verse={emphasizedVerse ?? undefined}
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
          {t('reader.verseTip')}
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
          <ChevronLeft className="h-4 w-4" /> {t('reader.previous')}
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
          {t('reader.next')} <ChevronRight className="h-4 w-4" />
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

      <HighlightColorPicker
        open={colorPickerOpen}
        onClose={() => {
          setColorPickerOpen(false);
          setEditingHighlightId(null);
          setEditingHighlightColor(undefined);
        }}
        onSelectColor={handleColorSelect}
        onDelete={editingHighlightId ? handleHighlightDelete : undefined}
        position={colorPickerPos}
        activeColor={editingHighlightColor}
      />

      <InAppBrowser
        open={refPaneOpen}
        initialUrl={refPaneUrl}
        onClose={() => setRefPaneOpen(false)}
      />

      {/* Bottom quick toolbar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 safe-bottom">
        <ReaderBottomToolbar />
      </div>
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

function placeholderHtml(bookId: number, chapter: number, name: string): string {
  return `
    <div style="text-align:center;padding:2rem 0;">
      <p style="font-size:1.1rem;font-weight:600;">${name} ${chapter}</p>
      <p style="font-size:0.85rem;color:var(--muted-foreground);margin-top:0.5rem;">
        Hindi ma-load ang nilalaman ng kabanata mula sa EPUB.
      </p>
    </div>
  `;
}
