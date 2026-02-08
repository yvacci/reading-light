import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { READING_PLANS } from '@/lib/bible-data';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import PageHeader from '@/components/PageHeader';

export default function PlansPage() {
  const { currentPlan, setCurrentPlan } = useReadingProgress();

  return (
    <div className="min-h-screen pb-20">
      <PageHeader title="Reading Plans" subtitle="Choose how to read the Bible" />

      <div className="space-y-3 px-4 pt-4">
        {READING_PLANS.map((plan, i) => {
          const active = currentPlan === plan.id;
          return (
            <motion.button
              key={plan.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setCurrentPlan(plan.id)}
              className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
                active
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border bg-card hover:bg-muted/50'
              }`}
            >
              <span className="text-2xl">{plan.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{plan.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{plan.description}</p>
              </div>
              {active && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3.5 w-3.5" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Reading Speed Section */}
      <div className="px-4 pt-6">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Reading Speed</h2>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: '1 yr', desc: '3 ch/day' },
            { label: '2 yr', desc: '2 ch/day' },
            { label: 'Custom', desc: 'Set pace' },
          ].map(speed => (
            <button
              key={speed.label}
              className="rounded-xl border border-border bg-card p-3 text-center transition-colors hover:bg-muted/50"
            >
              <p className="text-sm font-bold text-foreground">{speed.label}</p>
              <p className="text-[10px] text-muted-foreground">{speed.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
