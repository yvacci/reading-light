import { BookOpen, Bookmark, TrendingUp, Bell, Users, Calendar, Clock, MapPin } from 'lucide-react';
import { useBookmarks } from '@/contexts/BookmarksContext';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { useStudies } from '@/contexts/StudiesContext';
import { usePioneer } from '@/contexts/PioneerContext';
import { BIBLE_BOOKS } from '@/lib/bible-data';
import { getLocalizedBookName } from '@/lib/localization';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

export default function BibleSidebar() {
  const { bookmarks } = useBookmarks();
  const { getBookProgress } = useReadingProgress();
  const { getUpcomingVisits, studies } = useStudies();
  const { entries } = usePioneer();
  const navigate = useNavigate();

  const recentBookmarks = bookmarks.slice(0, 8);

  // Get books with progress > 0, sorted by percent desc
  const booksWithProgress = BIBLE_BOOKS
    .map(b => ({ ...b, ...getBookProgress(b.id) }))
    .filter(b => b.percent > 0)
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 10);

  const totalChapters = BIBLE_BOOKS.reduce((sum, b) => sum + b.chapters, 0);
  const totalRead = BIBLE_BOOKS.reduce((sum, b) => sum + getBookProgress(b.id).read, 0);
  const overallPercent = totalChapters > 0 ? Math.round((totalRead / totalChapters) * 100) : 0;

  return (
    <aside className="hidden md:flex flex-col w-[320px] shrink-0 border-l border-border/60 bg-card/50 sticky top-0 h-screen">
      <ScrollArea className="flex-1">
        <div className="p-5 space-y-6">
          {/* Overall Progress */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Progreso</h3>
            </div>
            <div className="rounded-xl border border-border/40 bg-card p-4 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-semibold text-foreground">{overallPercent}%</span>
                <span className="text-[10px] text-muted-foreground">{totalRead} / {totalChapters} kabanata</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${overallPercent}%` }}
                />
              </div>
              {booksWithProgress.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/40">
                  {booksWithProgress.map(b => (
                    <button
                      key={b.id}
                      onClick={() => navigate(`/reader/${b.id}`)}
                      className="flex items-center gap-2 w-full text-left hover:bg-muted/50 rounded-lg px-2 py-1.5 transition-colors"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-[9px] font-bold text-primary shrink-0">
                        {b.id}
                      </div>
                      <span className="text-[11px] text-foreground flex-1 truncate">{getLocalizedBookName(b.id)}</span>
                      <span className="text-[10px] font-semibold text-primary">{b.percent}%</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Visit Reminders */}
          {(() => {
            const upcomingVisits = getUpcomingVisits();
            const scheduledVisits = studies.filter(s => s.nextVisitDate).sort((a, b) => (a.nextVisitDate || '').localeCompare(b.nextVisitDate || '')).slice(0, 3);
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            const daysInMonth = new Date(year, month, 0).getDate();
            let totalHours = 0;
            for (let d = 1; d <= daysInMonth; d++) {
              const key = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              const e = entries[key];
              if (e) totalHours += e.ministryHours + e.witnessingHours;
            }
            const TARGET = 50;
            const hoursPercent = Math.min(100, Math.round((totalHours / TARGET) * 100));

            return (
              <>
                {/* Monthly Goal */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Layunin</h3>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-card p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">Oras</span>
                      <span className={`text-xs font-bold ${totalHours >= TARGET ? 'text-success' : 'text-primary'}`}>{totalHours}/{TARGET}</span>
                    </div>
                    <Progress value={hoursPercent} className="h-1.5" />
                  </div>
                </div>

                {/* Needs Visit */}
                {upcomingVisits.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Bell className="h-4 w-4 text-destructive" />
                      <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Dalawin</h3>
                    </div>
                    <div className="rounded-xl border border-border/40 bg-card divide-y divide-border/40 overflow-hidden">
                      {upcomingVisits.slice(0, 3).map(visit => (
                        <div key={visit.id} className="flex items-start gap-2 px-3 py-2">
                          <Users className="h-3 w-3 text-destructive shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-semibold text-foreground truncate">{visit.name}</p>
                            <p className="text-[10px] text-muted-foreground">{visit.type === 'bible-study' ? 'BS' : 'RV'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scheduled */}
                {scheduledVisits.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="h-4 w-4 text-primary" />
                      <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Iskedyul</h3>
                    </div>
                    <div className="rounded-xl border border-border/40 bg-card divide-y divide-border/40 overflow-hidden">
                      {scheduledVisits.map(visit => (
                        <div key={visit.id} className="flex items-start gap-2 px-3 py-2">
                          <Clock className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-semibold text-foreground truncate">{visit.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(visit.nextVisitDate! + 'T12:00:00').toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}

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
