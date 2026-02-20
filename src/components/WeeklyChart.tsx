import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { t } from '@/lib/i18n';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function WeeklyChart() {
  const { getWeeklyReadingData, language } = useReadingProgress();
  const data = getWeeklyReadingData();
  const hasData = data.some(d => d.minutes > 0);

  return (
    <div className="ghibli-card rounded-2xl border border-border bg-card p-4">
      <h3 className="mb-3 app-subheading text-foreground" style={{ fontSize: '12px' }}>
        {t('progress.weeklyActivity', language).toUpperCase()}
      </h3>
      {hasData ? (
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMinutesGhibli" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                </linearGradient>
                {/* Pencil texture filter */}
                <filter id="pencilFilter">
                  <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
                </filter>
              </defs>
              <CartesianGrid
                strokeDasharray="6 4"
                stroke="hsl(var(--border))"
                strokeOpacity={0.4}
                strokeWidth={0.5}
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontFamily: "'Lora', Georgia, serif" }}
                axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 0.5 }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontFamily: "'Lora', Georgia, serif" }}
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
                  fontFamily: "'Lora', Georgia, serif",
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [`${value} min`, 'Oras ng Pagbabasa']}
              />
              <Area
                type="monotone"
                dataKey="minutes"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="url(#colorMinutesGhibli)"
                dot={{ fill: 'hsl(var(--primary))', r: 4, strokeWidth: 2.5, stroke: 'hsl(var(--card))' }}
                activeDot={{ r: 6, strokeWidth: 2.5, stroke: 'hsl(var(--card))', fill: 'hsl(var(--primary))' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center">
          <p className="text-xs text-muted-foreground ghibli-body">{t('progress.startWeekly', language)}</p>
        </div>
      )}
    </div>
  );
}
