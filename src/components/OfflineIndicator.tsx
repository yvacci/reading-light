import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useState, useEffect } from 'react';

export default function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const [showOnline, setShowOnline] = useState(false);

  // Show a brief "back online" toast when reconnecting
  useEffect(() => {
    if (isOnline) {
      setShowOnline(true);
      const timer = setTimeout(() => setShowOnline(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  const show = !isOnline || showOnline;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 py-1.5 text-xs font-medium safe-top ${
            isOnline
              ? 'bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]'
              : 'bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]'
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="h-3.5 w-3.5" />
              Back online
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5" />
              Offline — Reading from cached data
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
