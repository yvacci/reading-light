import { useState } from 'react';
import { ChevronDown, ChevronUp, BookText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Footnote {
  id: string;
  reference: string; // e.g. "Gen. 1:1"
  content: string;   // e.g. 'O "nilikha."'
}

interface Props {
  footnotes: Footnote[];
}

export default function FootnotesPanel({ footnotes }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (footnotes.length === 0) return null;

  return (
    <div className="mx-5 mb-4 rounded-2xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/50"
      >
        <div className="flex items-center gap-2">
          <BookText className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Footnotes & Cross-References
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {footnotes.length}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-4 py-3 space-y-2.5">
              {footnotes.map((fn) => (
                <div key={fn.id} className="flex gap-2 text-xs" id={`fn-${fn.id}`}>
                  <span className="shrink-0 font-semibold text-primary whitespace-nowrap">
                    {fn.reference}
                  </span>
                  <span className="text-muted-foreground leading-relaxed">
                    {fn.content}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
