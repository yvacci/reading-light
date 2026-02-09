import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Trash2 } from 'lucide-react';
import { useBookmarks } from '@/contexts/BookmarksContext';
import { getBookById } from '@/lib/bible-data';
import PageHeader from '@/components/PageHeader';

const HIGHLIGHT_COLORS: Record<string, string> = {
  yellow: 'bg-yellow-200/40 border-yellow-300',
  blue: 'bg-blue-200/40 border-blue-300',
  green: 'bg-green-200/40 border-green-300',
  pink: 'bg-pink-200/40 border-pink-300',
  purple: 'bg-purple-200/40 border-purple-300',
};

export default function BookmarksPage() {
  const navigate = useNavigate();
  const { bookmarks, removeBookmark } = useBookmarks();

  return (
    <div className="min-h-screen pb-20">
      <PageHeader title="Bookmarks" subtitle={`${bookmarks.length} saved`} showBack />

      <div className="px-4 pt-3 space-y-2">
        {bookmarks.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <Bookmark className="h-10 w-10 text-muted-foreground/40" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">No bookmarks yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Tap the bookmark icon while reading to save verses
              </p>
            </div>
          </div>
        )}

        <AnimatePresence>
          {bookmarks.map((bm) => {
            const book = getBookById(bm.bookId);
            const colorClass = HIGHLIGHT_COLORS[bm.color] || HIGHLIGHT_COLORS.yellow;

            return (
              <motion.div
                key={bm.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -80 }}
                className={`rounded-xl border p-3 ${colorClass}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    onClick={() => navigate(`/reader/${bm.bookId}/${bm.chapter}`)}
                    className="flex-1 text-left"
                  >
                    <span className="text-xs font-semibold text-primary">
                      {book?.name || `Book ${bm.bookId}`} {bm.chapter}
                    </span>
                    <p className="mt-1 text-xs text-foreground/80 leading-relaxed line-clamp-3">
                      {bm.verseText}
                    </p>
                    {bm.note && (
                      <p className="mt-1.5 text-[10px] text-muted-foreground italic">
                        "{bm.note}"
                      </p>
                    )}
                  </button>
                  <button
                    onClick={() => removeBookmark(bm.id)}
                    className="flex-shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="mt-1.5 text-[10px] text-muted-foreground">
                  {new Date(bm.createdAt).toLocaleDateString()}
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
