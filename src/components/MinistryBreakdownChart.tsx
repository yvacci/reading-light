import { motion } from 'framer-motion';
import { usePioneer } from '@/contexts/PioneerContext';

interface CategoryData {
  label: string;
  value: number;
  color: string;
  colorVar: string;
}

/* Pencil-style tubular bar rendered with SVG */
function TubularBar({ pct, color, delay }: { pct: number; color: string; delay: number }) {
  return (
    <div className="relative h-full flex-1 flex items-end">
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: `${Math.max(pct, 4)}%` }}
        transition={{ duration: 0.8, delay, ease: 'easeOut' }}
        className="w-full relative rounded-t-lg overflow-hidden"
        style={{ minHeight: 6 }}
      >
        {/* Tubular gradient effect */}
        <div
          className="absolute inset-0 rounded-t-lg"
          style={{
            background: `linear-gradient(90deg, ${color}88 0%, ${color} 35%, ${color}cc 65%, ${color}88 100%)`,
          }}
        />
        {/* Pencil texture lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.15]" preserveAspectRatio="none">
          <pattern id={`pencil-${delay}`} width="6" height="6" patternUnits="userSpaceOnUse">
            <line x1="0" y1="6" x2="6" y2="0" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill={`url(#pencil-${delay})`} />
        </svg>
        {/* Highlight stroke */}
        <div className="absolute top-0 left-[30%] w-[15%] h-full bg-white/20 rounded-t-lg" />
      </motion.div>
      {/* Percentage label */}
      {pct > 0 && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.5 }}
          className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-foreground whitespace-nowrap"
          style={{ fontFamily: "'Caveat', cursive" }}
        >
          {Math.round(pct)}%
        </motion.span>
      )}
    </div>
  );
}

export default function MinistryBreakdownChart() {
  const { getMonthSummary } = usePioneer();
  const now = new Date();
  const summary = getMonthSummary(now.getFullYear(), now.getMonth() + 1);

  if (summary.totalHours === 0) return null;

  const total = summary.totalHours;
  const fieldService = total - summary.bibleStudies - summary.returnVisits - summary.witnessingHours - summary.otherWitnessingHours;

  const categories: CategoryData[] = [
    { label: 'Field Service', value: Math.max(0, fieldService), color: 'hsl(var(--primary))', colorVar: 'primary' },
    { label: 'Bible Study', value: summary.bibleStudies, color: 'hsl(var(--success))', colorVar: 'success' },
    { label: 'Return Visit', value: summary.returnVisits, color: 'hsl(var(--warning))', colorVar: 'warning' },
    { label: 'Public Witnessing', value: summary.witnessingHours, color: 'hsl(var(--accent))', colorVar: 'accent' },
    { label: 'Others', value: summary.otherWitnessingHours, color: 'hsl(var(--muted-foreground))', colorVar: 'muted-foreground' },
  ].filter(c => c.value > 0);

  const maxVal = Math.max(...categories.map(c => c.value));

  // Forecast vs actual
  const daysInMonth = summary.daysInMonth;
  const daysPassed = now.getDate();
  const expectedHours = (daysPassed / daysInMonth) * total;
  const forecastTotal = daysInMonth > 0 ? (total / daysPassed) * daysInMonth : 0;
  const onTrack = summary.daysWithData > 0 ? (summary.daysWithData / daysPassed) >= 0.7 : false;

  return (
    <div className="ghibli-card rounded-2xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground ghibli-heading" style={{ fontSize: '14px' }}>
          Ministry Breakdown
        </span>
        <span className="text-[10px] text-muted-foreground" style={{ fontFamily: "'Patrick Hand', cursive" }}>
          {total}h total
        </span>
      </div>

      {/* Pencil-style tubular bar chart */}
      <div className="relative pt-6 pb-1">
        {/* Grid lines */}
        <div className="absolute inset-x-0 top-6 bottom-1 flex flex-col justify-between pointer-events-none">
          {[100, 75, 50, 25, 0].map(line => (
            <div key={line} className="flex items-center gap-1">
              <div className="w-full border-t border-border/30 border-dashed" />
            </div>
          ))}
        </div>

        <div className="relative flex items-end gap-2 h-28">
          {categories.map((cat, i) => {
            const pct = maxVal > 0 ? (cat.value / maxVal) * 100 : 0;
            return (
              <TubularBar key={cat.label} pct={pct} color={cat.color} delay={i * 0.1} />
            );
          })}
        </div>
      </div>

      {/* Labels */}
      <div className="flex gap-2 justify-around">
        {categories.map(cat => (
          <div key={cat.label} className="flex flex-col items-center gap-0.5 flex-1 min-w-0">
            <span className="text-[8px] text-muted-foreground text-center leading-tight truncate w-full" style={{ fontFamily: "'Patrick Hand', cursive" }}>
              {cat.label}
            </span>
            <span className="text-[10px] font-bold text-foreground" style={{ fontFamily: "'Caveat', cursive" }}>
              {cat.value}h
            </span>
          </div>
        ))}
      </div>

      {/* Legend dots */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 border-t border-border/30">
        {categories.map(cat => (
          <div key={cat.label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
            <span className="text-[10px] text-muted-foreground" style={{ fontFamily: "'Patrick Hand', cursive" }}>
              {cat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Forecast vs actual */}
      <div className="flex items-center gap-2 pt-1 border-t border-border/30">
        <div className={`w-2 h-2 rounded-full ${onTrack ? 'bg-[hsl(var(--success))]' : 'bg-[hsl(var(--warning))]'}`} />
        <span className="text-[10px] text-muted-foreground" style={{ fontFamily: "'Patrick Hand', cursive" }}>
          {onTrack ? 'On track' : 'Behind pace'} · {summary.daysWithData}/{daysPassed} days logged ({summary.daysWithData > 0 ? Math.round((summary.daysWithData / daysPassed) * 100) : 0}%)
        </span>
        {forecastTotal > 0 && (
          <span className="ml-auto text-[10px] text-muted-foreground" style={{ fontFamily: "'Patrick Hand', cursive" }}>
            ~{Math.round(forecastTotal)}h projected
          </span>
        )}
      </div>
    </div>
  );
}
