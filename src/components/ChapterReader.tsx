import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, BookmarkCheck, Bookmark, PenLine, Highlighter, PanelLeftOpen } from 'lucide-react';
import { getBookById, getWolUrl, BIBLE_BOOKS } from '@/lib/bible-data';
import { getLocalizedBookName } from '@/lib/localization';
import { t } from '@/lib/i18n';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { useBookmarks } from '@/contexts/BookmarksContext';
import { useHighlights, HIGHLIGHT_COLORS } from '@/hooks/useHighlights';
import { loadChapter, initEpub } from '@/lib/epub-service';
import { sanitizeHtml } from '@/lib/sanitize';
import { parseFootnotes } from '@/lib/footnote-parser';
import type { Footnote } from '@/components/FootnotesPanel';
import FootnotesPanel from '@/components/FootnotesPanel';
import PageHeader from '@/components/PageHeader';
import BookmarkDialog from '@/components/BookmarkDialog';
import JournalEntryDialog from '@/components/JournalEntryDialog';
import VerseActionPopup from '@/components/VerseActionPopup';
import { Button } from '@/components/ui/button';
import ReferencePane from '@/components/ReferencePane';
import ReaderBottomToolbar from '@/components/ReaderBottomToolbar';
import ReaderSidebar from '@/components/ReaderSidebar';

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
  const [actionPopupOpen, setActionPopupOpen] = useState(false);
  const [actionPopupPos, setActionPopupPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [pendingHighlightText, setPendingHighlightText] = useState('');
  const [pendingHighlightVerse, setPendingHighlightVerse] = useState(0);
  const [editingHighlightId, setEditingHighlightId] = useState<string | null>(null);
  const [editingHighlightColor, setEditingHighlightColor] = useState<string | undefined>();
  const [emphasizedVerse, setEmphasizedVerse] = useState<number | null>(null);
  const [refPaneOpen, setRefPaneOpen] = useState(false);
  const [refPaneUrl, setRefPaneUrl] = useState('');
  const [refPaneVerse, setRefPaneVerse] = useState<{ bookId: number; chapter: number; verse?: number; text?: string } | undefined>();
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

  // Text selection handler — replaces verse-number click handler
  useEffect(() => {
    if (loading || !contentRef.current) return;
    const container = contentRef.current;

    // Footnote tap handler
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

    // Text selection handler for touch-drag highlighting
    const handleSelectionEnd = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.rangeCount) return;

      const text = selection.toString().trim();
      if (text.length < 2) return;

      // Make sure the selection is within our bible content
      const range = selection.getRangeAt(0);
      if (!container.contains(range.commonAncestorContainer)) return;

      // Find verse number(s) from closest [data-verse] ancestors
      let verseStart = 0;
      let verseEnd = 0;
      const startEl = range.startContainer.parentElement?.closest('[data-verse]') || range.startContainer.parentElement?.closest('.bible-content')?.querySelector('[data-verse]');
      const endEl = range.endContainer.parentElement?.closest('[data-verse]');

      if (startEl) {
        verseStart = parseInt(startEl.getAttribute('data-verse') || '0');
      }
      if (endEl) {
        verseEnd = parseInt(endEl.getAttribute('data-verse') || '0');
      }
      if (verseStart === 0 && verseEnd > 0) verseStart = verseEnd;
      if (verseEnd === 0 && verseStart > 0) verseEnd = verseStart;
      if (verseStart === 0) {
        // Try to find the nearest verse
        const allVerses = container.querySelectorAll('[data-verse]');
        if (allVerses.length > 0) verseStart = parseInt(allVerses[0].getAttribute('data-verse') || '1');
        verseEnd = verseStart;
      }

      const rect = range.getBoundingClientRect();
      setActionPopupPos({ x: rect.left + rect.width / 2, y: rect.top });
      setPendingHighlightVerse(verseStart);
      setPendingHighlightText(text.slice(0, 500));
      setSelectedText(text);
      setSelectedVerse(verseStart);
      setEditingHighlightId(null);
      setEditingHighlightColor(undefined);
      setActionPopupOpen(true);
    };

    const handleMouseUp = () => {
      setTimeout(handleSelectionEnd, 10);
    };
    const handleTouchEndSelection = () => {
      setTimeout(handleSelectionEnd, 100);
    };

    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('touchend', handleTouchEndSelection);

    return () => {
      footnoteMarkers.forEach(el => el.removeEventListener('click', handleFootnoteTap));
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('touchend', handleTouchEndSelection);
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

    // Don't swipe if text is selected
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) return;

    if (deltaX < 0) goToChapter(1);
    else goToChapter(-1);
  }, [goToChapter]);

  const handleBookmark = useCallback(() => {
    const text = selectedText || content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200);
    setSelectedText(text);
    setBookmarkOpen(true);
  }, [content, selectedText]);

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
      setPendingHighlightText('');
    }
    // Clear selection after highlighting
    window.getSelection()?.removeAllRanges();
  }, [editingHighlightId, pendingHighlightText, pendingHighlightVerse, bookId, chapter, addHighlight, updateHighlightColor]);

  const handleHighlightDelete = useCallback(() => {
    if (editingHighlightId) {
      removeHighlight(editingHighlightId);
      setEditingHighlightId(null);
      setEditingHighlightColor(undefined);
    }
  }, [editingHighlightId, removeHighlight]);

  const handleCopyText = useCallback(() => {
    // selectedText is set when text is selected
  }, []);

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
            setActionPopupPos({ x: rect.left + rect.width / 2, y: rect.top });
            setEditingHighlightId(hl.id);
            setEditingHighlightColor(hl.color);
            setPendingHighlightText('');
            setSelectedText(mark.textContent || '');
            setActionPopupOpen(true);
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
    setRefPaneVerse(undefined);
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
    <div className="min-h-screen pb-24 flex">
      <div className="flex-1 min-w-0">
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
              <PanelLeftOpen className="h-3.5 w-3.5" />
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
          if (!(e.target as HTMLElement).closest('[data-verse]') && !(e.target as HTMLElement).closest('mark')) {
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
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footnotes panel only on mobile (sidebar handles it on md+) */}
      {!loading && (
        <div className="md:hidden">
          <FootnotesPanel
            footnotes={footnotes}
            highlightedId={highlightedFootnote}
            onHighlightClear={handleClearHighlight}
          />
        </div>
      )}

      {!loading && (
        <p className="text-center text-[10px] text-muted-foreground/60 px-4 pb-2">
          {t('reader.verseTip')}
        </p>
      )}


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

      <VerseActionPopup
        open={actionPopupOpen}
        onClose={() => {
          setActionPopupOpen(false);
          setEditingHighlightId(null);
          setEditingHighlightColor(undefined);
        }}
        position={actionPopupPos}
        onSelectColor={handleColorSelect}
        onBookmark={handleBookmark}
        onJournal={() => setJournalOpen(true)}
        onDelete={editingHighlightId ? handleHighlightDelete : undefined}
        onCopy={handleCopyText}
        activeColor={editingHighlightColor}
        selectedText={selectedText}
        bookId={bookId}
        chapter={chapter}
        verse={selectedVerse}
      />

      <ReferencePane
        open={refPaneOpen}
        onClose={() => setRefPaneOpen(false)}
        verseRef={refPaneVerse}
        quickLinkUrl={refPaneUrl}
      />

      <div className="fixed bottom-0 left-0 right-0 z-40 safe-bottom md:right-[320px]">
        <ReaderBottomToolbar />
      </div>
      </div>
      <ReaderSidebar footnotes={footnotes} highlightedFootnoteId={highlightedFootnote} />
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
    /(<a[^>]*>\s*<sup>\s*)(\d+)(\s*<\/sup>\s*<\/a>)/gi,
    (match, prefix, num, suffix) => {
      if (match.includes('data-verse')) return match;
      return `<span data-verse="${num}" class="verse-tap-target">${prefix}${num}${suffix}</span>`;
    }
  );

  result = result.replace(
    /(<sup\s+class="[^"]*verseNum[^"]*"[^>]*>)(\d+)(<\/sup>)/gi,
    (match, prefix, num, suffix) => {
      if (match.includes('data-verse')) return match;
      return `<span data-verse="${num}" class="verse-tap-target">${prefix}${num}${suffix}</span>`;
    }
  );

  return result;
}

function placeholderHtml(bookId: number, chapter: number, name: string): string {
  return `<div style="text-align:center;padding:40px 20px;color:var(--muted-foreground)">
    <p style="font-size:1.2em;font-weight:600;margin-bottom:8px">${name} ${chapter}</p>
    <p style="font-size:0.85em">I-download muna ang EPUB file para mabasa ang kabanatang ito.</p>
  </div>`;
}
