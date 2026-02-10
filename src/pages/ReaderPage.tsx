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

const VIEW_PREF_KEY = 'nwt-book-view';

export default function ReaderPage() {
  const { bookId, chapter } = useParams();
  const navigate = useNavigate();
  const { getBookProgress, language } = useReadingProgress();
  const [testamentFilter, setTestamentFilter] = useState<'OT' | 'NT'>('OT');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => {
    return (localStorage.getItem(VIEW_PREF_KEY) as 'list' | 'grid') || 'list';
  });
  const [tappedBook, setTappedBook] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem(VIEW_PREF_KEY, viewMode);
  }, [viewMode]);

  if (bookId && chapter) {
    return <ChapterReader bookId={Number(bookId)} chapter={Number(chapter)} />;
  }

  if (bookId) {
    const book = BIBLE_BOOKS.find(b => b.id === Number(bookId));
    if (!book) return null;
    return <ChapterSelector book={book} language={language} />;
  }

  const filteredBooks = BIBLE_BOOKS.filter(b => b.testament === testamentFilter);

  const handleBookTap = (id: number) => {
    setTappedBook(id);
    setTimeout(() => navigate(`/reader/${id}`), 200);
  };

  return (
    <div className="min-h-screen pb-20">
      <PageHeader
        title={t('reader.title', language)}
        subtitle={t('reader.subtitle', language)}
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

      <div className="flex gap-1 px-4 py-3">
        {(['OT', 'NT'] as const).map(tt => (
          <button
            key={tt}
            onClick={() => setTestamentFilter(tt)}
            className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-all ${
              testamentFilter === tt
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {tt === 'OT' ? t('reader.hebrewScriptures', language) : t('reader.greekScriptures', language)}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${testamentFilter}-${viewMode}`}
          initial={{ opacity: 0, x: testamentFilter === 'NT' ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: testamentFilter === 'NT' ? -20 : 20 }}
          transition={{ duration: 0.2 }}
          className={viewMode === 'grid' ? 'grid grid-cols-3 gap-2 px-4' : 'space-y-1 px-4'}
        >
          {filteredBooks.map(book => {
            const prog = getBookProgress(book.id);
            const isTapped = tappedBook === book.id;

            if (viewMode === 'grid') {
              return (
                <motion.button
                  key={book.id}
                  onClick={() => handleBookTap(book.id)}
                  animate={isTapped ? { scale: [0.9, 1.05, 1], boxShadow: ['0 0 0 0 hsl(var(--primary) / 0)', '0 0 20px 4px hsl(var(--primary) / 0.3)', '0 0 0 0 hsl(var(--primary) / 0)'] } : {}}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-3 transition-colors hover:bg-muted/60"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                    {book.id}
                  </div>
                  <p className="text-[11px] font-medium text-foreground text-center leading-tight truncate w-full">
                    {getLocalizedBookName(book.id, language)}
                  </p>
                  {prog.percent > 0 && (
                    <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${prog.percent}%` }} />
                    </div>
                  )}
                </motion.button>
              );
            }

            return (
              <motion.button
                key={book.id}
                onClick={() => handleBookTap(book.id)}
                animate={isTapped ? { scale: [0.95, 1.02, 1], backgroundColor: ['hsl(var(--muted) / 0)', 'hsl(var(--primary) / 0.08)', 'hsl(var(--muted) / 0)'] } : {}}
                transition={{ duration: 0.3 }}
                whileTap={{ scale: 0.97 }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/60"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                  {book.id}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{getLocalizedBookName(book.id, language)}</p>
                  <p className="text-[10px] text-muted-foreground">{book.chapters} {t('reader.chapters', language)}</p>
                </div>
                {prog.percent > 0 && (
                  <span className="text-[10px] font-semibold text-primary">{prog.percent}%</span>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ChapterSelector({ book, language }: { book: BibleBook; language: string }) {
  const navigate = useNavigate();
  const { isChapterRead } = useReadingProgress();
  const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1);
  const localizedName = getLocalizedBookName(book.id, language);

  return (
    <div className="min-h-screen pb-20">
      <PageHeader title={localizedName} subtitle={`${book.chapters} ${t('reader.chapters', language)}`} showBack />

      <div className="grid grid-cols-5 gap-2 p-4">
        {chapters.map(ch => {
          const read = isChapterRead(book.id, ch);
          return (
            <motion.button
              key={ch}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/reader/${book.id}/${ch}`)}
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
