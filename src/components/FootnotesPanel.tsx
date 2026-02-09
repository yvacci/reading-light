import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, BookText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Footnote {
  id: string;
  reference: string;
  content: string;
}

interface Props {
  footnotes: Footnote[];
  highlightedId?: string | null;
  onHighlightClear?: () => void;
}

export default function FootnotesPanel({ footnotes, highlightedId, onHighlightClear }: Props) {
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const footnoteRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Auto-expand and scroll when a footnote is highlighted
  useEffect(() => {
    if (!highlightedId) return;

    // Expand the panel
    setExpanded(true);

    // Scroll to the highlighted footnote after expansion animation
    const timer = setTimeout(() => {
      const el = footnoteRefs.current[highlightedId];
      if (el && scrollRef.current) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);

    // Clear highlight after a few seconds
    const clearTimer = setTimeout(() => {
      onHighlightClear?.();
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(clearTimer);
    };
  }, [highlightedId, onHighlightClear]);

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
            <div ref={scrollRef} className="border-t border-border px-4 py-3 space-y-2.5 max-h-60 overflow-y-auto">
              {footnotes.map((fn) => (
                <div
                  key={fn.id}
                  ref={(el) => { footnoteRefs.current[fn.id] = el; }}
                  className={`flex gap-2 text-xs rounded-lg px-2 py-1.5 transition-colors duration-500 ${
                    highlightedId === fn.id
                      ? 'bg-primary/15 ring-1 ring-primary/30'
                      : ''
                  }`}
                  id={`fn-${fn.id}`}
                >
                  <span className={`shrink-0 whitespace-nowrap transition-all duration-300 ${
                    highlightedId === fn.id ? 'font-bold text-primary' : 'font-semibold text-primary'
                  }`}>
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
