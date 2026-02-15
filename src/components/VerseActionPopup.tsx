import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, PenLine, Trash2, Copy, X, Check } from 'lucide-react';
import { HIGHLIGHT_COLORS } from '@/hooks/useHighlights';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  onSelectColor: (color: string) => void;
  onBookmark: () => void;
  onJournal: () => void;
  onDelete?: () => void;
  onCopy: () => void;
  activeColor?: string;
  selectedText?: string;
}

export default function VerseActionPopup({
  open, onClose, position, onSelectColor, onBookmark, onJournal, onDelete, onCopy, activeColor, selectedText,
}: Props) {
  const handleCopy = () => {
    if (selectedText) {
      navigator.clipboard.writeText(selectedText).then(() => {
        toast.success('Nakopya ang teksto');
      }).catch(() => {
        toast.error('Hindi makopya');
      });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-50" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={{ duration: 0.18 }}
            className="fixed z-50 rounded-2xl border border-border bg-card shadow-xl overflow-hidden"
            style={{
              left: Math.max(8, Math.min(position.x - 140, window.innerWidth - 288)),
              top: Math.max(10, position.y - 120),
              width: 280,
            }}
          >
            {/* Color row */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/50">
              {HIGHLIGHT_COLORS.map(c => (
                <button
                  key={c.value}
                  onClick={() => {
                    onSelectColor(c.value);
                    onClose();
                  }}
                  className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 active:scale-95 ${
                    activeColor === c.value ? 'border-primary ring-2 ring-primary/30' : 'border-border/40'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                >
                  {activeColor === c.value && (
                    <Check className="h-3.5 w-3.5 text-foreground/70 mx-auto" />
                  )}
                </button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="px-1 py-1">
              <button
                onClick={() => { onBookmark(); onClose(); }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-muted/60 transition-colors"
              >
                <Bookmark className="h-4 w-4 text-primary" />
                <span className="text-foreground text-xs font-medium">Bookmark</span>
              </button>
              <button
                onClick={() => { onJournal(); onClose(); }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-muted/60 transition-colors"
              >
                <PenLine className="h-4 w-4 text-primary" />
                <span className="text-foreground text-xs font-medium">Journal</span>
              </button>
              <button
                onClick={handleCopy}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-muted/60 transition-colors"
              >
                <Copy className="h-4 w-4 text-primary" />
                <span className="text-foreground text-xs font-medium">Kopyahin</span>
              </button>
              {onDelete && (
                <button
                  onClick={() => { onDelete(); onClose(); }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <span className="text-destructive text-xs font-medium">Tanggalin ang Highlight</span>
                </button>
              )}
            </div>

            {/* Close */}
            <div className="flex justify-end px-2 pb-2">
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
