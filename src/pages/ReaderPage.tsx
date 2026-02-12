import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, LayoutGrid, List } from 'lucide-react';
import { BIBLE_BOOKS, type BibleBook } from '@/lib/bible-data';
import { getLocalizedBookName } from '@/lib/localization';
import { t } from '@/lib/i18n';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import PageHeader from '@/components/PageHeader';
import ChapterReader from '@/components/ChapterReader';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const VIEW_PREF_KEY = 'nwt-book-view';

const BIBLE_SUB_TABS = [
  { id: 'introduksiyon', label: 'INTRODUKSIYON' },
  { id: 'aklat', label: 'AKLAT' },
  { id: 'indise', label: 'INDISE' },
  { id: 'apendise-a', label: 'APENDISE A' },
  { id: 'apendise-b', label: 'APENDISE B' },
] as const;

type SubTab = typeof BIBLE_SUB_TABS[number]['id'];

export default function ReaderPage() {
  const { bookId, chapter } = useParams();
  const navigate = useNavigate();
  const { getBookProgress } = useReadingProgress();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => {
    return (localStorage.getItem(VIEW_PREF_KEY) as 'list' | 'grid') || 'grid';
  });
  const [tappedBook, setTappedBook] = useState<number | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('aklat');

  useEffect(() => {
    localStorage.setItem(VIEW_PREF_KEY, viewMode);
  }, [viewMode]);

  if (bookId && chapter) {
    return <ChapterReader bookId={Number(bookId)} chapter={Number(chapter)} />;
  }

  if (bookId) {
    const book = BIBLE_BOOKS.find(b => b.id === Number(bookId));
    if (!book) return null;
    return <ChapterSelector book={book} />;
  }

  const otBooks = BIBLE_BOOKS.filter(b => b.testament === 'OT');
  const ntBooks = BIBLE_BOOKS.filter(b => b.testament === 'NT');

  const handleBookTap = (id: number) => {
    setTappedBook(id);
    setTimeout(() => navigate(`/reader/${id}`), 200);
  };

  return (
    <div className="min-h-screen pb-20">
      <PageHeader
        title="Bibliya Para sa Pag-aaral"
        subtitle="Tagalog"
        actions={
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        }
      />

      {/* Sub-tabs */}
      <div className="border-b border-border">
        <ScrollArea className="w-full">
          <div className="flex px-2">
            {BIBLE_SUB_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`shrink-0 px-4 py-3 text-xs font-bold tracking-wide transition-colors relative ${
                  activeSubTab === tab.id
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                {activeSubTab === tab.id && (
                  <motion.div
                    layoutId="subtab-underline"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {activeSubTab === 'aklat' ? (
        <AnimatePresence mode="wait">
          <motion.div
            key="aklat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* OT Section Header */}
            <div className="bg-foreground px-4 py-2.5 mt-0">
              <h2 className="text-xs font-extrabold tracking-wider text-background uppercase">
                KASULATANG HEBREO-ARAMAIKO
              </h2>
            </div>

            {/* OT Grid */}
            <div className="px-2 py-2">
              <BookGrid
                books={otBooks}
                viewMode={viewMode}
                tappedBook={tappedBook}
                onBookTap={handleBookTap}
                getBookProgress={getBookProgress}
              />
            </div>

            {/* NT Section Header */}
            <div className="bg-foreground px-4 py-2.5">
              <h2 className="text-xs font-extrabold tracking-wider text-background uppercase">
                KRISTIYANONG GRIEGONG KASULATAN
              </h2>
            </div>

            {/* NT Grid */}
            <div className="px-2 py-2">
              <BookGrid
                books={ntBooks}
                viewMode={viewMode}
                tappedBook={tappedBook}
                onBookTap={handleBookTap}
                getBookProgress={getBookProgress}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Ang seksyong "{BIBLE_SUB_TABS.find(t => t.id === activeSubTab)?.label}" ay malapit nang maging available.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-2">
            Ang nilalaman ay maaaring kunin mula sa EPUB.
          </p>
        </div>
      )}
    </div>
  );
}

function BookGrid({
  books,
  viewMode,
  tappedBook,
  onBookTap,
  getBookProgress,
}: {
  books: typeof BIBLE_BOOKS;
  viewMode: 'list' | 'grid';
  tappedBook: number | null;
  onBookTap: (id: number) => void;
  getBookProgress: (id: number) => { read: number; total: number; percent: number };
}) {
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-5 gap-[3px]">
        {books.map((book, index) => {
          const isTapped = tappedBook === book.id;
          const prog = getBookProgress(book.id);
          // Alternating row colors matching JW Library style
          const rowIndex = Math.floor(index / 5);
          const isAltRow = rowIndex % 2 === 1;

          return (
            <motion.button
              key={book.id}
              onClick={() => onBookTap(book.id)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isTapped
                ? { opacity: 1, scale: [0.9, 1.05, 1], boxShadow: ['0 0 0 0 hsl(var(--primary) / 0)', '0 0 20px 4px hsl(var(--primary) / 0.4)', '0 0 0 0 hsl(var(--primary) / 0)'] }
                : { opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.01 }}
              whileTap={{ scale: 0.92 }}
              className={`relative flex items-center justify-start px-2.5 py-3.5 text-left transition-colors ${
                isAltRow
                  ? 'bg-primary/25 hover:bg-primary/35'
                  : 'bg-primary/15 hover:bg-primary/25'
              }`}
              style={{ borderRadius: 2 }}
            >
              <span className="text-[13px] font-medium text-foreground leading-tight">
                {book.shortName}
              </span>
              {prog.percent === 100 && (
                <div className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </motion.button>
          );
        })}
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-0.5 px-2">
      {books.map(book => {
        const prog = getBookProgress(book.id);
        const isTapped = tappedBook === book.id;
        return (
          <motion.button
            key={book.id}
            onClick={() => onBookTap(book.id)}
            animate={isTapped ? { scale: [0.95, 1.02, 1], backgroundColor: ['hsl(var(--muted) / 0)', 'hsl(var(--primary) / 0.08)', 'hsl(var(--muted) / 0)'] } : {}}
            transition={{ duration: 0.3 }}
            whileTap={{ scale: 0.97 }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/60"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
              {book.id}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{getLocalizedBookName(book.id)}</p>
              <p className="text-[10px] text-muted-foreground">{book.chapters} {t('reader.chapters')}</p>
            </div>
            {prog.percent > 0 && (
              <span className="text-[10px] font-semibold text-primary">{prog.percent}%</span>
            )}
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </motion.button>
        );
      })}
    </div>
  );
}

function ChapterSelector({ book }: { book: BibleBook }) {
  const navigate = useNavigate();
  const { isChapterRead } = useReadingProgress();
  const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1);
  const [tappedCh, setTappedCh] = useState<number | null>(null);

  const handleChapterTap = (ch: number) => {
    setTappedCh(ch);
    setTimeout(() => navigate(`/reader/${book.id}/${ch}`), 200);
  };

  return (
    <div className="min-h-screen pb-20">
      <PageHeader title={getLocalizedBookName(book.id)} subtitle={`${book.chapters} ${t('reader.chapters')}`} showBack />

      <div className="grid grid-cols-5 gap-2.5 p-4">
        {chapters.map(ch => {
          const read = isChapterRead(book.id, ch);
          const isTapped = tappedCh === ch;
          return (
            <motion.button
              key={ch}
              whileTap={{ scale: 0.95 }}
              animate={isTapped
                ? { scale: [0.95, 1.05, 1], boxShadow: ['0 0 0 0 hsl(var(--primary) / 0)', '0 0 16px 3px hsl(var(--primary) / 0.25)', '0 0 0 0 hsl(var(--primary) / 0)'] }
                : {}}
              transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
              onClick={() => handleChapterTap(ch)}
              className={`flex h-12 items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                read
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              {ch}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
