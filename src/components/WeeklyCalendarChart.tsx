import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function WeeklyCalendarChart() {
  const { getWeeklyReadingData, progress } = useReadingProgress();
  const data = getWeeklyReadingData();

  // Determine which days had reading activity (chapters marked)
  const weekDates = getWeekDates();
  const enrichedData = data.map((d, i) => {
    const dateKey = weekDates[i];
    const hasActivity = d.minutes > 0 || hasChaptersReadOnDate(dateKey);
    return { ...d, hasActivity, date: dateKey };
  });

  const hasAnyData = enrichedData.some(d => d.minutes > 0 || d.hasActivity);

  function hasChaptersReadOnDate(dateKey: string): boolean {
    return Object.values(progress).some(ch => {
      if (!ch.read || !ch.dateRead) return false;
      return ch.dateRead.startsWith(dateKey);
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h3 className="mb-3 text-xs font-semibold text-foreground">This Week</h3>

      {/* Day dots */}
      <div className="flex justify-around mb-4">
        {enrichedData.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-medium text-muted-foreground">{d.day}</span>
            <div
              className={`h-3 w-3 rounded-full transition-colors ${
                d.hasActivity
                  ? 'bg-[hsl(var(--success))]'
                  : isToday(d.date)
                  ? 'border-2 border-primary bg-transparent'
                  : 'bg-muted'
              }`}
            />
            {d.minutes > 0 && (
              <span className="text-[9px] text-muted-foreground">{d.minutes}m</span>
            )}
          </div>
        ))}
      </div>

      {/* Bar chart for time */}
      {hasAnyData && (
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={enrichedData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                unit="m"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.75rem',
                  fontSize: '11px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [`${value} min`, 'Reading Time']}
              />
              <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                {enrichedData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.hasActivity ? 'hsl(var(--primary))' : 'hsl(var(--muted))'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {!hasAnyData && (
        <p className="text-center text-[10px] text-muted-foreground py-4">
          Start reading to see your weekly activity
        </p>
      )}
    </div>
  );
}

function getWeekDates(): string[] {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function isToday(dateKey: string): boolean {
  return dateKey === new Date().toISOString().slice(0, 10);
}
