import { BookOpen, Bookmark } from 'lucide-react';
import { useBookmarks } from '@/contexts/BookmarksContext';
import { BIBLE_BOOKS } from '@/lib/bible-data';
import { getLocalizedBookName } from '@/lib/localization';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function BibleSidebar() {
  const { bookmarks } = useBookmarks();
  const navigate = useNavigate();

  const recentBookmarks = bookmarks.slice(0, 8);

  return (
    <aside className="hidden md:flex flex-col w-[320px] shrink-0 border-l border-border/60 bg-card/50 sticky top-0 h-screen">
      <ScrollArea className="flex-1">
        <div className="p-5 space-y-6">
          {/* Recent Bookmarks */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Bookmark className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Mga Bookmark</h3>
            </div>
            {recentBookmarks.length === 0 ? (
              <div className="rounded-xl border border-border/40 bg-card p-4 text-center">
                <BookOpen className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-[11px] text-muted-foreground">Wala pang bookmark</p>
              </div>
            ) : (
              <div className="rounded-xl border border-border/40 bg-card divide-y divide-border/40 overflow-hidden">
                {recentBookmarks.map(bm => {
                  const book = BIBLE_BOOKS.find(b => b.id === bm.bookId);
                  return (
                    <button
                      key={bm.id}
                      onClick={() => navigate(`/reader/${bm.bookId}/${bm.chapter}`)}
                      className="flex items-start gap-2.5 w-full text-left px-3 py-2.5 hover:bg-muted/40 transition-colors"
                    >
                      <div
                        className="h-3 w-3 rounded-full shrink-0 mt-1"
                        style={{ backgroundColor: bm.color || 'hsl(var(--primary))' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-foreground truncate">
                          {book ? getLocalizedBookName(book.id) : ''} {bm.chapter}{bm.verse ? `:${bm.verse}` : ''}
                        </p>
                        {bm.note && (
                          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{bm.note}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground/70 truncate mt-0.5">{bm.verseText?.slice(0, 60)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
