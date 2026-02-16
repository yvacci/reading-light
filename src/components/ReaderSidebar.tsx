import { Clock, Bell, Users, MapPin, Calendar, BookOpen, BookText } from 'lucide-react';
import { useStudies } from '@/contexts/StudiesContext';
import { usePioneer } from '@/contexts/PioneerContext';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Footnote } from '@/components/FootnotesPanel';

interface Props {
  footnotes?: Footnote[];
  highlightedFootnoteId?: string | null;
}

export default function ReaderSidebar({ footnotes, highlightedFootnoteId }: Props) {
  const { entries } = usePioneer();
  const { getUpcomingVisits, studies } = useStudies();

  const upcomingVisits = getUpcomingVisits();
  const scheduledVisits = studies
    .filter(s => s.nextVisitDate)
    .sort((a, b) => (a.nextVisitDate || '').localeCompare(b.nextVisitDate || ''))
    .slice(0, 5);

  // Monthly hours
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

  // Split footnotes into cross-references and regular footnotes
  const crossRefs = footnotes?.filter(fn => /^\w+\.?\s+\d+:\d+/.test(fn.reference)) || [];
  const regularFootnotes = footnotes?.filter(fn => !/^\w+\.?\s+\d+:\d+/.test(fn.reference)) || [];

  return (
    <aside className="hidden md:flex flex-col w-[320px] shrink-0 border-l border-border/60 bg-card/50 sticky top-0 h-screen">
      <ScrollArea className="flex-1">
        <div className="p-5 space-y-5">
          {/* Monthly Goal */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Layunin sa Buwan</h3>
            </div>
            <div className="rounded-xl border border-border/40 bg-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Oras ng Ministeryo</span>
                <span className={`text-sm font-bold ${totalHours >= TARGET ? 'text-success' : 'text-primary'}`}>
                  {totalHours} / {TARGET}
                </span>
              </div>
              <Progress value={hoursPercent} className="h-2" />
              <p className="text-[10px] text-muted-foreground">
                {hoursPercent >= 100 ? 'Naabot na ang target! 🎉' : `${TARGET - totalHours} oras pa ang kailangan`}
              </p>
            </div>
          </div>

          {/* Needs Visit */}
          {upcomingVisits.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Bell className="h-4 w-4 text-destructive" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Kailangang Dalawin</h3>
              </div>
              <div className="rounded-xl border border-border/40 bg-card divide-y divide-border/40 overflow-hidden">
                {upcomingVisits.map(visit => {
                  const daysSince = visit.lastVisitDate
                    ? Math.floor((Date.now() - new Date(visit.lastVisitDate + 'T12:00:00').getTime()) / 86400000)
                    : null;
                  return (
                    <div key={visit.id} className="flex items-start gap-2.5 px-3 py-2.5">
                      <Users className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-foreground">{visit.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {visit.type === 'bible-study' ? 'Bible Study' : 'Return Visit'}
                          {daysSince !== null && ` · ${daysSince}d ago`}
                        </p>
                        {visit.address && (
                          <button
                            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(visit.address)}`, '_blank')}
                            className="flex items-center gap-1 mt-0.5"
                          >
                            <MapPin className="h-2.5 w-2.5 text-primary" />
                            <span className="text-[10px] text-primary hover:underline truncate">{visit.address}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Scheduled Visits */}
          {scheduledVisits.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Naka-iskedyul</h3>
              </div>
              <div className="rounded-xl border border-border/40 bg-card divide-y divide-border/40 overflow-hidden">
                {scheduledVisits.map(visit => (
                  <div key={visit.id} className="flex items-start gap-2.5 px-3 py-2.5">
                    <Clock className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-foreground">{visit.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {visit.type === 'bible-study' ? 'BS' : 'RV'}
                        {' · '}
                        {new Date(visit.nextVisitDate! + 'T12:00:00').toLocaleDateString()}
                        {visit.nextVisitTime && ` ${visit.nextVisitTime}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footnotes & Cross-References */}
          {footnotes && footnotes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookText className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Footnote at Sanggunian</h3>
              </div>
              <div className="rounded-xl border border-border/40 bg-card p-3 space-y-2">
                {footnotes.map((fn) => (
                  <div
                    key={fn.id}
                    id={`sidebar-fn-${fn.id}`}
                    className={`text-[11px] leading-relaxed p-2 rounded-lg transition-colors ${
                      highlightedFootnoteId === fn.id
                        ? 'bg-primary/10 text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <span className="font-semibold text-primary mr-1">{fn.reference || '*'}</span>
                    {fn.content}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
