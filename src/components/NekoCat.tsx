import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

const NEKO_ENABLED_KEY = 'nwt-neko-enabled';

type NekoState = 'sitting' | 'walking' | 'sleeping' | 'grooming' | 'stretching' | 'jumping' | 'wobble';

function isNekoEnabled(): boolean {
  try {
    return localStorage.getItem(NEKO_ENABLED_KEY) === 'true';
  } catch { return false; }
}

export function setNekoEnabled(enabled: boolean) {
  localStorage.setItem(NEKO_ENABLED_KEY, enabled ? 'true' : 'false');
}

export function useNekoEnabled() {
  const [enabled, setEnabled] = useState(isNekoEnabled);
  const toggle = useCallback((v: boolean) => {
    setEnabled(v);
    setNekoEnabled(v);
  }, []);
  return { nekoEnabled: enabled, setNekoEnabled: toggle };
}

// Cat SVG component
function CatSVG({ state }: { state: NekoState }) {
  const isSleeping = state === 'sleeping';
  const isGrooming = state === 'grooming';
  const isStretching = state === 'stretching';

  return (
    <svg viewBox="0 0 48 48" className="w-10 h-10 drop-shadow-sm" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}>
      {/* Body */}
      <motion.ellipse
        cx="24" cy="34" rx={isStretching ? 14 : 10} ry={isStretching ? 5 : 7}
        fill="hsl(var(--foreground) / 0.7)"
        animate={{ rx: isStretching ? 14 : 10, ry: isStretching ? 5 : 7 }}
        transition={{ duration: 0.5 }}
      />
      {/* Head */}
      <motion.circle
        cx={isGrooming ? 22 : 24} cy={isSleeping ? 22 : 20}
        r="8"
        fill="hsl(var(--foreground) / 0.7)"
        animate={{ cy: isSleeping ? 22 : 20, cx: isGrooming ? 22 : 24 }}
        transition={{ duration: 0.4 }}
      />
      {/* Left ear */}
      <polygon points="16,14 18,6 21,13" fill="hsl(var(--foreground) / 0.7)" />
      <polygon points="17,13 18.5,8 20,13" fill="hsl(var(--primary) / 0.3)" />
      {/* Right ear */}
      <polygon points="27,13 30,6 32,14" fill="hsl(var(--foreground) / 0.7)" />
      <polygon points="28,13 29.5,8 31,13" fill="hsl(var(--primary) / 0.3)" />
      {/* Eyes */}
      {isSleeping ? (
        <>
          <line x1="20" y1="19" x2="23" y2="19" stroke="hsl(var(--background))" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="27" y1="19" x2="30" y2="19" stroke="hsl(var(--background))" strokeWidth="1.2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="21" cy="19" r="1.8" fill="hsl(var(--background))" />
          <motion.circle cx="21" cy="19" r="1" fill="hsl(var(--foreground))"
            animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} />
          <circle cx="27" cy="19" r="1.8" fill="hsl(var(--background))" />
          <motion.circle cx="27" cy="19" r="1" fill="hsl(var(--foreground))"
            animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }} />
        </>
      )}
      {/* Nose */}
      <polygon points="24,21 23,22.5 25,22.5" fill="hsl(var(--primary) / 0.5)" />
      {/* Mouth */}
      <path d="M23,22.5 Q24,24 25,22.5" fill="none" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="0.5" />
      {/* Whiskers */}
      <line x1="15" y1="20" x2="20" y2="21" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="0.4" />
      <line x1="15" y1="22" x2="20" y2="22" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="0.4" />
      <line x1="28" y1="21" x2="33" y2="20" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="0.4" />
      <line x1="28" y1="22" x2="33" y2="22" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="0.4" />
      {/* Tail */}
      <motion.path
        d="M34,34 Q40,26 37,18"
        fill="none"
        stroke="hsl(var(--foreground) / 0.7)"
        strokeWidth="2.5"
        strokeLinecap="round"
        animate={{
          d: state === 'sitting'
            ? ['M34,34 Q40,26 37,18', 'M34,34 Q42,26 38,20', 'M34,34 Q40,26 37,18']
            : state === 'sleeping'
            ? 'M34,34 Q36,30 34,28'
            : 'M34,34 Q40,26 37,18'
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Grooming paw */}
      {isGrooming && (
        <motion.circle cx="19" cy="21" r="2" fill="hsl(var(--foreground) / 0.6)"
          animate={{ cy: [21, 19, 21] }} transition={{ duration: 1, repeat: Infinity }} />
      )}
      {/* Sleep Zzz */}
      {isSleeping && (
        <motion.text x="34" y="14" fontSize="8" fill="hsl(var(--primary) / 0.5)" fontFamily="Caveat, cursive"
          animate={{ opacity: [0, 1, 0], y: [14, 8, 4] }}
          transition={{ duration: 2, repeat: Infinity }}>
          z
        </motion.text>
      )}
    </svg>
  );
}

// Tab positions for 5 tabs (percentage-based)
const TAB_POSITIONS = [10, 30, 50, 70, 90]; // percent

export default function NekoCat({ activeTabIndex }: { activeTabIndex: number }) {
  const [state, setState] = useState<NekoState>('sitting');
  const [targetX, setTargetX] = useState(TAB_POSITIONS[0]);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controls = useAnimation();

  // Move to active tab
  useEffect(() => {
    const newX = TAB_POSITIONS[activeTabIndex] || TAB_POSITIONS[0];
    setState('jumping');
    setTargetX(newX);
    controls.start({
      x: `${newX}%`,
      y: [0, -20, 0],
      transition: { duration: 0.5, ease: 'easeInOut' },
    }).then(() => {
      setState('sitting');
    });
  }, [activeTabIndex, controls]);

  // Idle animations
  useEffect(() => {
    const cycleIdle = () => {
      const idleStates: NekoState[] = ['sitting', 'grooming', 'stretching', 'sitting'];
      const random = idleStates[Math.floor(Math.random() * idleStates.length)];
      setState(random);

      idleTimerRef.current = setTimeout(cycleIdle, 4000 + Math.random() * 6000);
    };

    // Start sleeping after 30s of no interaction
    const sleepTimer = setTimeout(() => {
      setState('sleeping');
    }, 30000);

    idleTimerRef.current = setTimeout(cycleIdle, 5000);

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      clearTimeout(sleepTimer);
    };
  }, [activeTabIndex]); // Reset idle cycle on tab change

  // Scroll wobble
  useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      if (state !== 'sleeping') setState('wobble');
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (state !== 'sleeping') setState('sitting');
      }, 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [state]);

  return (
    <motion.div
      className="fixed bottom-12 z-[55] pointer-events-none"
      style={{ left: 0, right: 0 }}
      initial={false}
    >
      <motion.div
        className="absolute"
        style={{ left: `${targetX}%`, transform: 'translateX(-50%)' }}
        animate={controls}
      >
        <motion.div
          animate={
            state === 'wobble'
              ? { rotate: [-5, 5, -3, 3, 0] }
              : state === 'jumping'
              ? { scale: [1, 0.9, 1.1, 1] }
              : {}
          }
          transition={{ duration: 0.4 }}
        >
          <CatSVG state={state} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
