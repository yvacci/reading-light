import { useState } from 'react';
import { BookOpen, Bookmark, PenLine } from 'lucide-react';
import { useBookmarks } from '@/contexts/BookmarksContext';
import { useJournal } from '@/contexts/JournalContext';
import { BIBLE_BOOKS } from '@/lib/bible-data';
import { getLocalizedBookName } from '@/lib/localization';
import { useNavigate, useParams } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SidebarView = 'bookmarks' | 'journal';

export default function BibleSidebar() {
  const { bookmarks } = useBookmarks();
  const { entries: journalEntries } = useJournal();
  const navigate = useNavigate();
  const { bookId } = useParams();
  const [view, setView] = useState<SidebarView>('bookmarks');

  const currentBookId = bookId ? Number(bookId) : null;

  // Filter by current book if viewing a book, otherwise show recent
  const filteredBookmarks = currentBookId
    ? bookmarks.filter(bm => bm.bookId === currentBookId)
    : bookmarks.slice(0, 8);

  const filteredJournal = currentBookId
    ? journalEntries.filter(j => j.bookId === currentBookId)
    : journalEntries.slice(0, 8);

  // Group by chapter for organized display
  const groupByChapter = <T extends { chapter: number }>(items: T[]): Record<number, T[]> => {
    const groups: Record<number, T[]> = {};
    items.forEach(item => {
      if (!groups[item.chapter]) groups[item.chapter] = [];
      groups[item.chapter].push(item);
    });
    return groups;
  };

  const bookmarkGroups = groupByChapter(filteredBookmarks);
  const journalGroups = groupByChapter(filteredJournal);

  const currentBookName = currentBookId ? getLocalizedBookName(currentBookId) : null;

  return (
    <aside className="hidden md:flex flex-col w-[320px] shrink-0 border-l border-border/40 bg-background/50 backdrop-blur-sm sticky top-0 h-screen">
      <div className="p-4 border-b border-border/40">
        {/* Dropdown selector */}
        <Select value={view} onValueChange={(v) => setView(v as SidebarView)}>
          <SelectTrigger className="w-full h-9 text-xs font-semibold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bookmarks">
              <div className="flex items-center gap-2">
                <Bookmark className="h-3.5 w-3.5" />
                <span>Mga Bookmark</span>
              </div>
            </SelectItem>
            <SelectItem value="journal">
              <div className="flex items-center gap-2">
                <PenLine className="h-3.5 w-3.5" />
                <span>Talaarawan</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        {currentBookName && (
          <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">
            Pinapakita: {currentBookName}
          </p>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {view === 'bookmarks' ? (
            filteredBookmarks.length === 0 ? (
              <div className="rounded-xl border border-border/40 bg-card p-4 text-center">
                <Bookmark className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-[11px] text-muted-foreground">
                  {currentBookId ? 'Walang bookmark sa aklat na ito' : 'Wala pang bookmark'}
                </p>
              </div>
            ) : (
              Object.entries(bookmarkGroups)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([chapter, bms]) => (
                  <div key={chapter}>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
                      Kabanata {chapter}
                    </p>
                    <div className="rounded-xl border border-border/40 bg-card divide-y divide-border/40 overflow-hidden">
                      {bms.map(bm => {
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
                  </div>
                ))
            )
          ) : (
            filteredJournal.length === 0 ? (
              <div className="rounded-xl border border-border/40 bg-card p-4 text-center">
                <PenLine className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-[11px] text-muted-foreground">
                  {currentBookId ? 'Walang journal entry sa aklat na ito' : 'Wala pang journal entry'}
                </p>
              </div>
            ) : (
              Object.entries(journalGroups)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([chapter, entries]) => (
                  <div key={chapter}>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
                      Kabanata {chapter}
                    </p>
                    <div className="rounded-xl border border-border/40 bg-card divide-y divide-border/40 overflow-hidden">
                      {entries.map(entry => (
                        <button
                          key={entry.id}
                          onClick={() => navigate(`/reader/${entry.bookId}/${entry.chapter}`)}
                          className="flex items-start gap-2.5 w-full text-left px-3 py-2.5 hover:bg-muted/40 transition-colors"
                        >
                          <PenLine className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-semibold text-foreground truncate">
                              {entry.title}
                            </p>
                            {entry.mood && (
                              <p className="text-[10px] text-muted-foreground mt-0.5">{entry.mood}</p>
                            )}
                            <p className="text-[10px] text-muted-foreground/70 truncate mt-0.5">
                              {entry.content.slice(0, 80)}
                            </p>
                            <p className="text-[9px] text-muted-foreground/50 mt-0.5">
                              {new Date(entry.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
            )
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
