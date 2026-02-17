import { motion } from 'framer-motion';
import { usePioneer } from '@/contexts/PioneerContext';

interface CategoryData {
  label: string;
  value: number;
  color: string;
}

export default function MinistryBreakdownChart() {
  const { getMonthSummary } = usePioneer();
  const now = new Date();
  const summary = getMonthSummary(now.getFullYear(), now.getMonth() + 1);

  if (summary.totalHours === 0) return null;

  const total = summary.totalHours;
  const fieldService = total - summary.bibleStudies - summary.returnVisits - summary.witnessingHours - summary.otherWitnessingHours;

  const categories: CategoryData[] = [
    { label: 'Field Service', value: Math.max(0, fieldService), color: 'hsl(var(--primary))' },
    { label: 'Bible Study', value: summary.bibleStudies, color: 'hsl(var(--success))' },
    { label: 'Return Visit', value: summary.returnVisits, color: 'hsl(var(--warning))' },
    { label: 'Public Witnessing', value: summary.witnessingHours, color: 'hsl(var(--accent))' },
    { label: 'Others', value: summary.otherWitnessingHours, color: 'hsl(var(--muted-foreground))' },
  ].filter(c => c.value > 0);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground" style={{ fontFamily: "'Caveat', cursive" }}>
          Ministry Breakdown
        </span>
        <span className="text-[10px] text-muted-foreground">{total}h total</span>
      </div>

      {/* Stacked horizontal bar */}
      <div className="relative h-8 rounded-full overflow-hidden bg-muted/30 flex">
        {categories.map((cat, i) => {
          const pct = (cat.value / total) * 100;
          return (
            <motion.div
              key={cat.label}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
              className="h-full relative flex items-center justify-center overflow-hidden"
              style={{
                backgroundColor: cat.color,
                borderRight: i < categories.length - 1 ? '1px solid hsl(var(--background) / 0.3)' : undefined,
              }}
            >
              {pct > 12 && (
                <span className="text-[9px] font-bold text-white/90 whitespace-nowrap">
                  {Math.round(pct)}%
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {categories.map(cat => (
          <div key={cat.label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
            <span className="text-[10px] text-muted-foreground">{cat.label}</span>
            <span className="text-[10px] font-semibold text-foreground">{cat.value}h</span>
          </div>
        ))}
      </div>

      {/* Forecast vs actual */}
      {(() => {
        const daysInMonth = summary.daysInMonth;
        const daysPassed = now.getDate();
        const expectedPct = (daysPassed / daysInMonth) * 100;
        const actualPct = summary.daysWithData > 0 ? (summary.daysWithData / daysPassed) * 100 : 0;
        const onTrack = actualPct >= 70;

        return (
          <div className="flex items-center gap-2 pt-1 border-t border-border/40">
            <div className={`w-2 h-2 rounded-full ${onTrack ? 'bg-success' : 'bg-warning'}`} />
            <span className="text-[10px] text-muted-foreground">
              {onTrack ? 'On track' : 'Behind pace'} · {summary.daysWithData}/{daysPassed} days logged ({Math.round(actualPct)}%)
            </span>
          </div>
        );
      })()}
    </div>
  );
}
