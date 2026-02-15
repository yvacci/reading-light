import { HIGHLIGHT_COLORS } from '@/hooks/useHighlights';
import { X, Trash2, BookmarkPlus, PenLine, Copy, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelectColor: (color: string) => void;
  onDelete?: () => void;
  onBookmark?: () => void;
  onJournal?: () => void;
  position?: { x: number; y: number };
  activeColor?: string;
  selectedText?: string;
}

export default function HighlightColorPicker({ open, onClose, onSelectColor, onDelete, onBookmark, onJournal, position, activeColor, selectedText }: Props) {
  const handleCopy = () => {
    if (selectedText) {
      try {
        navigator.clipboard.writeText(selectedText);
        toast.success('Nakopya!');
      } catch {
        // Fallback for clipboard API not available
        const textarea = document.createElement('textarea');
        textarea.value = selectedText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        toast.success('Nakopya!');
      }
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
            transition={{ duration: 0.15 }}
            className="fixed z-50 rounded-2xl border border-border bg-card shadow-xl"
            style={{
              left: position ? Math.min(Math.max(position.x - 120, 8), window.innerWidth - 260) : '50%',
              top: position ? Math.max(position.y - 60, 10) : '50%',
              transform: position ? undefined : 'translate(-50%, -50%)',
              minWidth: 240,
            }}
          >
            {/* Color row - matching pic 1 */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/50">
              {activeColor && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-primary bg-primary/10">
                  <span className="text-primary text-xs">✓</span>
                </div>
              )}
              {HIGHLIGHT_COLORS.map(c => (
                <button
                  key={c.value}
                  onClick={() => {
                    onSelectColor(c.value);
                    onClose();
                  }}
                  className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 active:scale-95 ${
                    activeColor === c.value ? 'border-foreground ring-2 ring-foreground/30 scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>

            {/* Action buttons row */}
            <div className="flex items-center justify-around px-2 py-2">
              {onDelete && (
                <button
                  onClick={() => { onDelete(); onClose(); }}
                  className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors min-w-[44px]"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="text-[9px] font-medium">Burahin</span>
                </button>
              )}
              {onBookmark && (
                <button
                  onClick={() => { onBookmark(); onClose(); }}
                  className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors min-w-[44px]"
                  title="Bookmark"
                >
                  <BookmarkPlus className="h-4 w-4" />
                  <span className="text-[9px] font-medium">Bookmark</span>
                </button>
              )}
              {onJournal && (
                <button
                  onClick={() => { onJournal(); onClose(); }}
                  className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors min-w-[44px]"
                  title="Journal"
                >
                  <PenLine className="h-4 w-4" />
                  <span className="text-[9px] font-medium">Journal</span>
                </button>
              )}
              {selectedText && (
                <button
                  onClick={handleCopy}
                  className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors min-w-[44px]"
                  title="Copy"
                >
                  <Copy className="h-4 w-4" />
                  <span className="text-[9px] font-medium">Kopyahin</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors min-w-[44px]"
              >
                <X className="h-4 w-4" />
                <span className="text-[9px] font-medium">Isara</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
