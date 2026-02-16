import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, LayoutGrid, List, Loader2, ExternalLink, BookOpen, FileText, ChevronLeft } from 'lucide-react';
import { BIBLE_BOOKS, type BibleBook } from '@/lib/bible-data';
import { getLocalizedBookName } from '@/lib/localization';
import { t } from '@/lib/i18n';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { BIBLE_SECTIONS } from '@/lib/bible-sections-data';
import { fetchChapterOutline, getCachedChapterOutline } from '@/lib/bible-summary-service';
import PageHeader from '@/components/PageHeader';
import ChapterReader from '@/components/ChapterReader';
import ReferencePane from '@/components/ReferencePane';
import BibleSidebar from '@/components/BibleSidebar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const VIEW_PREF_KEY = 'nwt-book-view';

const BIBLE_SUB_TABS = [
  { id: 'introduksiyon', label: 'INTRODUKSIYON' },
  { id: 'aklat', label: 'AKLAT' },
  { id: 'indise', label: 'INDISE' },
  { id: 'apendise-a', label: 'APENDISE A' },
  { id: 'apendise-b', label: 'APENDISE B' },
  { id: 'apendise-c', label: 'APENDISE C' },
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
    <div className="min-h-screen pb-20 flex">
      <div className="flex-1 min-w-0">
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
        <SubTabContent tabId={activeSubTab} />
      )}
      </div>
      <BibleSidebar />
    </div>
  );
}

function SubTabContent({ tabId }: { tabId: string }) {
  const [paneOpen, setPaneOpen] = useState(false);
  const [paneUrl, setPaneUrl] = useState('');

  const section = BIBLE_SECTIONS[tabId];

  if (!section) {
    return (
      <div className="px-5 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Ang seksyong "{BIBLE_SUB_TABS.find(t => t.id === tabId)?.label}" ay hindi pa available.
        </p>
      </div>
    );
  }

  const handleArticleClick = (url: string) => {
    setPaneUrl(url);
    setPaneOpen(true);
  };

  return (
    <div className="px-5 py-4">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-foreground">{section.title}</h2>
        {section.description && (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{section.description}</p>
        )}
      </div>

      <div className="space-y-1">
        {section.articles.map((article, i) => (
          <motion.button
            key={i}
            initial={false}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleArticleClick(article.url)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-muted/60"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-[11px] font-bold text-primary shrink-0">
              {i + 1}
            </div>
            <span className="text-sm text-foreground leading-snug flex-1">{article.title}</span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </motion.button>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-border">
        <button
          onClick={() => handleArticleClick(section.sourceUrl)}
          className="flex items-center gap-2 text-xs text-primary font-medium hover:opacity-70 transition-opacity"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Buksan sa jw.org
        </button>
      </div>

      <ReferencePane
        open={paneOpen}
        onClose={() => setPaneOpen(false)}
        quickLinkUrl={paneUrl}
      />
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
          const rowIndex = Math.floor(index / 5);
          const isAltRow = rowIndex % 2 === 1;

          return (
            <motion.button
              key={book.id}
              onClick={() => onBookTap(book.id)}
              initial={false}
              animate={isTapped
                ? { scale: [0.9, 1.05, 1], boxShadow: ['0 0 0 0 hsl(var(--primary) / 0)', '0 0 20px 4px hsl(var(--primary) / 0.4)', '0 0 0 0 hsl(var(--primary) / 0)'] }
                : { scale: 1 }}
              transition={{ duration: 0.3 }}
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
  const [selectedCh, setSelectedCh] = useState<number | null>(null);
  const [chapterOutline, setChapterOutline] = useState<{ heading: string; verses: string }[]>([]);
  const [loadingOutline, setLoadingOutline] = useState(false);
  const [paneOpen, setPaneOpen] = useState(false);
  const [paneUrl, setPaneUrl] = useState('');

  const localizedName = getLocalizedBookName(book.id);

  // Load chapter outline when a chapter is selected
  useEffect(() => {
    if (selectedCh === null) return;
    const cached = getCachedChapterOutline(book.wolBookNum, selectedCh);
    if (cached) {
      setChapterOutline(cached);
    } else {
      setLoadingOutline(true);
      fetchChapterOutline(book.wolBookNum, selectedCh).then(o => {
        setChapterOutline(o);
        setLoadingOutline(false);
      });
    }
  }, [selectedCh, book.wolBookNum]);

  const handleChapterTap = (ch: number) => {
    setTappedCh(ch);
    setTimeout(() => navigate(`/reader/${book.id}/${ch}`), 200);
  };

  const handleIntroClick = () => {
    const url = `https://wol.jw.org/tl/wol/b/r27/lp-tg/nwtsty/${book.wolBookNum}/0`;
    setPaneUrl(url);
    setPaneOpen(true);
  };

  return (
    <div className="min-h-screen pb-20 bg-background flex">
      <div className="flex-1 min-w-0">
      {/* Header */}
      <div className="px-5 pt-12 pb-3 safe-top">
        <div className="flex items-center gap-2 mb-1">
          <button onClick={() => navigate('/reader')} className="p-1 -ml-1 rounded-lg hover:bg-muted transition-colors">
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              {localizedName}
            </h1>
            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
              Bibliya Para sa Pag-aaral · {book.chapters} {t('reader.chapters')}
            </p>
          </div>
        </div>
      </div>

      {/* Horizontal chapter tabs */}
      <div className="border-b border-border">
        <ScrollArea className="w-full">
          <div className="flex px-3 py-2 gap-1.5">
            {chapters.map(ch => {
              const read = isChapterRead(book.id, ch);
              const isSelected = selectedCh === ch;
              return (
                <button
                  key={ch}
                  onClick={() => setSelectedCh(prev => prev === ch ? null : ch)}
                  onDoubleClick={() => handleChapterTap(ch)}
                  className={`shrink-0 flex items-center justify-center h-9 w-9 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-md scale-110'
                      : read
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {ch}
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Introduction card */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleIntroClick}
          className="flex w-full items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left hover:bg-muted/40 transition-colors"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-foreground">Introduksiyon</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
              Basahin ang introduksiyon ng {localizedName}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
        </motion.button>

        {/* Chapter outline when selected */}
        <AnimatePresence mode="wait">
          {selectedCh !== null && (
            <motion.div
              key={selectedCh}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border border-border bg-card overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-primary/[0.03]">
                <div>
                  <p className="text-xs font-bold text-foreground">{localizedName} {selectedCh}</p>
                  <p className="text-[10px] text-muted-foreground">Nilalaman</p>
                </div>
                <button
                  onClick={() => handleChapterTap(selectedCh)}
                  className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-[11px] font-semibold hover:bg-primary/90 transition-colors"
                >
                  Basahin
                </button>
              </div>
              <div className="p-4">
                {loadingOutline ? (
                  <div className="flex items-center gap-2 py-3 justify-center">
                    <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    <span className="text-[11px] text-muted-foreground">Kinukuha ang outline...</span>
                  </div>
                ) : chapterOutline.length > 0 ? (
                  <div className="space-y-2">
                    {chapterOutline.map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-[9px] font-bold text-primary shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <p className="text-[12px] text-foreground leading-snug">{item.heading}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground text-center py-2">
                    I-tap ang "Basahin" para buksan ang kabanata
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full chapter grid */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-bold text-foreground mb-3">Lahat ng Kabanata</p>
          <div className="grid grid-cols-5 gap-2">
            {chapters.map(ch => {
              const read = isChapterRead(book.id, ch);
              const isTapped = tappedCh === ch;
              return (
                <motion.button
                  key={ch}
                  whileTap={{ scale: 0.9 }}
                  animate={isTapped ? { scale: [0.85, 1.1, 1] } : {}}
                  transition={{ duration: 0.3 }}
                  onClick={() => handleChapterTap(ch)}
                  className={`flex h-10 items-center justify-center rounded-xl text-xs font-semibold transition-all ${
                    read
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
                >
                  {ch}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      <ReferencePane
        open={paneOpen}
        onClose={() => setPaneOpen(false)}
        quickLinkUrl={paneUrl}
      />
      </div>
      <BibleSidebar />
    </div>
  );
}
