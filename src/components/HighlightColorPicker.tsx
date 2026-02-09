import { HIGHLIGHT_COLORS } from '@/hooks/useHighlights';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelectColor: (color: string) => void;
  position?: { x: number; y: number };
}

export default function HighlightColorPicker({ open, onClose, onSelectColor, position }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-50" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 flex items-center gap-1.5 rounded-full border border-border bg-card px-2 py-1.5 shadow-lg"
            style={{
              left: position ? Math.min(position.x, window.innerWidth - 200) : '50%',
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
                className="h-7 w-7 rounded-full border-2 border-border/50 transition-transform hover:scale-110 active:scale-95"
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
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
