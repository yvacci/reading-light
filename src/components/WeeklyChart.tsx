import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { t } from '@/lib/i18n';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function WeeklyChart() {
  const { getWeeklyReadingData, language } = useReadingProgress();
  const data = getWeeklyReadingData();
  const hasData = data.some(d => d.minutes > 0);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h3 className="mb-3 text-xs font-semibold text-foreground" style={{ fontFamily: "'Caveat', cursive", fontSize: '14px' }}>
        {t('progress.weeklyActivity', language)}
      </h3>
      {hasData ? (
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                unit="m"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  fontFamily: "'Caveat', cursive",
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [`${value} min`, 'Oras ng Pagbabasa']}
              />
              <Area
                type="monotone"
                dataKey="minutes"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                fill="url(#colorMinutes)"
                dot={{ fill: 'hsl(var(--primary))', r: 4, strokeWidth: 2, stroke: 'hsl(var(--card))' }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: 'hsl(var(--card))' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center">
          <p className="text-xs text-muted-foreground">{t('progress.startWeekly', language)}</p>
        </div>
      )}
    </div>
  );
}
