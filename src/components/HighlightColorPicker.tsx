import { HIGHLIGHT_COLORS } from '@/hooks/useHighlights';
import { X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelectColor: (color: string) => void;
  onDelete?: () => void;
  position?: { x: number; y: number };
  activeColor?: string;
}

export default function HighlightColorPicker({ open, onClose, onSelectColor, onDelete, position, activeColor }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-50" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 flex items-center gap-1.5 rounded-full border border-border bg-card px-2 py-1.5 shadow-lg"
            style={{
              left: position ? Math.min(position.x, window.innerWidth - 220) : '50%',
              top: position ? Math.max(position.y - 50, 10) : '50%',
              transform: position ? undefined : 'translate(-50%, -50%)',
            }}
          >
            {HIGHLIGHT_COLORS.map(c => (
              <button
                key={c.value}
                onClick={() => {
                  onSelectColor(c.value);
                  onClose();
                }}
                className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 active:scale-95 ${
                  activeColor === c.value ? 'border-foreground ring-2 ring-foreground/30' : 'border-border/50'
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
            {onDelete && (
              <button
                onClick={() => {
                  onDelete();
                  onClose();
                }}
                className="ml-0.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-border/50 text-destructive hover:bg-destructive/10 transition-colors"
                title="Remove highlight"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="ml-1 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}