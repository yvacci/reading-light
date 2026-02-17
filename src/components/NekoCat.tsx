import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, useAnimation } from 'framer-motion';

const NEKO_ENABLED_KEY = 'nwt-neko-enabled';

type NekoState =
  | 'idle-sit'
  | 'idle-look'
  | 'idle-groom'
  | 'idle-stretch'
  | 'idle-liedown'
  | 'idle-play'
  | 'walk-left'
  | 'walk-right'
  | 'jump'
  | 'wobble'
  | 'sleep';

function isNekoEnabled(): boolean {
  try { return localStorage.getItem(NEKO_ENABLED_KEY) === 'true'; }
  catch { return false; }
}

export function setNekoEnabled(enabled: boolean) {
  localStorage.setItem(NEKO_ENABLED_KEY, enabled ? 'true' : 'false');
}

export function useNekoEnabled() {
  const [enabled, setEnabled] = useState(isNekoEnabled);
  const toggle = useCallback((v: boolean) => { setEnabled(v); setNekoEnabled(v); }, []);
  return { nekoEnabled: enabled, setNekoEnabled: toggle };
}

/* ─── Cat SVG with animation-aware poses ─── */
function CatSprite({ state, facingRight }: { state: NekoState; facingRight: boolean }) {
  const isWalking = state === 'walk-left' || state === 'walk-right';
  const isSleeping = state === 'sleep';
  const isLying = state === 'idle-liedown';
  const isGrooming = state === 'idle-groom';
  const isStretching = state === 'idle-stretch';
  const isPlaying = state === 'idle-play';
  const isLooking = state === 'idle-look';

  return (
    <svg
      viewBox="0 0 48 48"
      className="w-10 h-10"
      style={{
        transform: facingRight ? 'scaleX(1)' : 'scaleX(-1)',
        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.12))',
      }}
    >
      {/* Body */}
      <motion.ellipse
        cx="24" cy="34"
        fill="hsl(var(--foreground) / 0.65)"
        animate={{
          rx: isStretching ? 14 : isLying || isSleeping ? 12 : 10,
          ry: isStretching ? 5 : isLying || isSleeping ? 5 : 7,
        }}
        transition={{ duration: 0.4 }}
      />
      {/* Head */}
      <motion.circle
        r="8"
        fill="hsl(var(--foreground) / 0.65)"
        animate={{
          cx: isGrooming ? 21 : 24,
          cy: isSleeping || isLying ? 28 : 20,
        }}
        transition={{ duration: 0.35 }}
      />
      {/* Left ear */}
      <motion.polygon
        fill="hsl(var(--foreground) / 0.65)"
        animate={{
          points: isSleeping || isLying
            ? '18,24 19,18 22,23'
            : '16,14 18,6 21,13',
        }}
        transition={{ duration: 0.3 }}
      />
      <motion.polygon
        fill="hsl(var(--primary) / 0.25)"
        animate={{
          points: isSleeping || isLying
            ? '19,23 19.5,19 21,23'
            : '17,13 18.5,8 20,13',
        }}
        transition={{ duration: 0.3 }}
      />
      {/* Right ear */}
      <motion.polygon
        fill="hsl(var(--foreground) / 0.65)"
        animate={{
          points: isSleeping || isLying
            ? '26,23 29,18 30,24'
            : '27,13 30,6 32,14',
        }}
        transition={{ duration: 0.3 }}
      />
      <motion.polygon
        fill="hsl(var(--primary) / 0.25)"
        animate={{
          points: isSleeping || isLying
            ? '27,23 28.5,19 29,23'
            : '28,13 29.5,8 31,13',
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Eyes */}
      {isSleeping || isLying ? (
        <>
          <motion.line
            stroke="hsl(var(--background))" strokeWidth="1.2" strokeLinecap="round"
            animate={{
              x1: isSleeping ? 20 : 21, y1: isSleeping ? 27 : 27,
              x2: isSleeping ? 23 : 24, y2: isSleeping ? 27 : 27,
            }}
          />
          <motion.line
            stroke="hsl(var(--background))" strokeWidth="1.2" strokeLinecap="round"
            animate={{
              x1: isSleeping ? 25 : 26, y1: isSleeping ? 27 : 27,
              x2: isSleeping ? 28 : 29, y2: isSleeping ? 27 : 27,
            }}
          />
        </>
      ) : (
        <>
          {/* Left eye */}
          <circle cx="21" cy="19" r="1.8" fill="hsl(var(--background))" />
          <motion.circle
            cx="21" cy="19" r="1"
            fill="hsl(var(--foreground))"
            animate={isLooking
              ? { cx: [21, 19, 23, 21], cy: [19, 18, 18, 19] }
              : { scale: [1, 1.1, 1] }
            }
            transition={isLooking
              ? { duration: 3, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 2.5, repeat: Infinity }
            }
          />
          {/* Right eye */}
          <circle cx="27" cy="19" r="1.8" fill="hsl(var(--background))" />
          <motion.circle
            cx="27" cy="19" r="1"
            fill="hsl(var(--foreground))"
            animate={isLooking
              ? { cx: [27, 25, 29, 27], cy: [19, 18, 18, 19] }
              : { scale: [1, 1.1, 1] }
            }
            transition={isLooking
              ? { duration: 3, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 2.5, repeat: Infinity, delay: 0.3 }
            }
          />
        </>
      )}

      {/* Nose */}
      {!(isSleeping || isLying) && (
        <polygon points="24,21 23,22.5 25,22.5" fill="hsl(var(--primary) / 0.4)" />
      )}
      {/* Mouth */}
      {!(isSleeping || isLying) && (
        <path d="M23,22.5 Q24,24 25,22.5" fill="none" stroke="hsl(var(--foreground) / 0.25)" strokeWidth="0.5" />
      )}

      {/* Whiskers */}
      {!(isSleeping || isLying) && (
        <>
          <line x1="14" y1="20" x2="20" y2="21" stroke="hsl(var(--foreground) / 0.25)" strokeWidth="0.4" />
          <line x1="14" y1="22.5" x2="20" y2="22" stroke="hsl(var(--foreground) / 0.25)" strokeWidth="0.4" />
          <line x1="28" y1="21" x2="34" y2="20" stroke="hsl(var(--foreground) / 0.25)" strokeWidth="0.4" />
          <line x1="28" y1="22" x2="34" y2="22.5" stroke="hsl(var(--foreground) / 0.25)" strokeWidth="0.4" />
        </>
      )}

      {/* Tail */}
      <motion.path
        fill="none"
        stroke="hsl(var(--foreground) / 0.6)"
        strokeWidth="2.5"
        strokeLinecap="round"
        animate={{
          d: isSleeping || isLying
            ? ['M14,34 Q10,30 12,27', 'M14,34 Q9,31 11,28', 'M14,34 Q10,30 12,27']
            : isPlaying
            ? ['M34,34 Q42,24 38,16', 'M34,34 Q44,20 40,14', 'M34,34 Q42,24 38,16']
            : ['M34,34 Q40,26 37,18', 'M34,34 Q42,28 38,20', 'M34,34 Q40,26 37,18'],
        }}
        transition={{ duration: isPlaying ? 0.6 : 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Walking legs animation */}
      {isWalking && (
        <>
          <motion.line
            x1="19" x2="17" stroke="hsl(var(--foreground) / 0.6)" strokeWidth="2" strokeLinecap="round"
            animate={{ y1: 38, y2: [42, 39, 42] }}
            transition={{ duration: 0.3, repeat: Infinity }}
          />
          <motion.line
            x1="22" x2="21" stroke="hsl(var(--foreground) / 0.6)" strokeWidth="2" strokeLinecap="round"
            animate={{ y1: 38, y2: [39, 42, 39] }}
            transition={{ duration: 0.3, repeat: Infinity }}
          />
          <motion.line
            x1="26" x2="27" stroke="hsl(var(--foreground) / 0.6)" strokeWidth="2" strokeLinecap="round"
            animate={{ y1: 38, y2: [42, 39, 42] }}
            transition={{ duration: 0.3, repeat: Infinity, delay: 0.1 }}
          />
          <motion.line
            x1="29" x2="31" stroke="hsl(var(--foreground) / 0.6)" strokeWidth="2" strokeLinecap="round"
            animate={{ y1: 38, y2: [39, 42, 39] }}
            transition={{ duration: 0.3, repeat: Infinity, delay: 0.1 }}
          />
        </>
      )}

      {/* Grooming paw */}
      {isGrooming && (
        <motion.circle cx="18" cy="19" r="2" fill="hsl(var(--foreground) / 0.5)"
          animate={{ cy: [19, 17, 19] }} transition={{ duration: 0.8, repeat: Infinity }} />
      )}

      {/* Playing paw swat */}
      {isPlaying && (
        <>
          <motion.circle cx="30" cy="30" r="1.5" fill="hsl(var(--primary) / 0.3)"
            animate={{ cx: [30, 33, 30], cy: [30, 28, 30], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
          <motion.line
            x1="28" y1="34" stroke="hsl(var(--foreground) / 0.5)" strokeWidth="1.5" strokeLinecap="round"
            animate={{ x2: [30, 33, 30], y2: [30, 28, 30] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        </>
      )}

      {/* Sleep Zzz */}
      {isSleeping && (
        <>
          <motion.text x="33" y="22" fontSize="7" fill="hsl(var(--primary) / 0.4)" fontFamily="Caveat, cursive"
            animate={{ opacity: [0, 1, 0], y: [22, 16, 10] }}
            transition={{ duration: 2.5, repeat: Infinity }}>z</motion.text>
          <motion.text x="37" y="18" fontSize="5" fill="hsl(var(--primary) / 0.3)" fontFamily="Caveat, cursive"
            animate={{ opacity: [0, 0.8, 0], y: [18, 12, 6] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.8 }}>z</motion.text>
        </>
      )}
    </svg>
  );
}

/* ─── Main Neko Component ─── */
const IDLE_STATES: NekoState[] = ['idle-sit', 'idle-look', 'idle-groom', 'idle-stretch', 'idle-liedown', 'idle-play'];
const WALK_DURATION_MS = 2000;
const IDLE_MIN_MS = 3000;
const IDLE_MAX_MS = 7000;
const SLEEP_AFTER_MS = 45000;

export default function NekoCat({ activeTabIndex }: { activeTabIndex: number }) {
  const [state, setState] = useState<NekoState>('idle-sit');
  const [posX, setPosX] = useState(50); // percent across screen
  const [facingRight, setFacingRight] = useState(true);
  const stateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastInteraction = useRef(Date.now());
  const prevTabRef = useRef(activeTabIndex);
  const isVisibleRef = useRef(true);

  // Tab positions (percentage)
  const tabTargets = useMemo(() => [10, 30, 50, 70, 90], []);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (stateTimerRef.current) clearTimeout(stateTimerRef.current);
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
  }, []);

  // Reset sleep timer on interaction
  const markInteraction = useCallback(() => {
    lastInteraction.current = Date.now();
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    sleepTimerRef.current = setTimeout(() => {
      setState('sleep');
    }, SLEEP_AFTER_MS);
  }, []);

  // Walk to a target position
  const walkTo = useCallback((targetPercent: number, onArrive?: () => void) => {
    const current = posX;
    if (Math.abs(targetPercent - current) < 3) {
      onArrive?.();
      return;
    }
    const goingRight = targetPercent > current;
    setFacingRight(goingRight);
    setState(goingRight ? 'walk-right' : 'walk-left');

    // Animate position over time
    const steps = 30;
    const stepTime = WALK_DURATION_MS / steps;
    const delta = (targetPercent - current) / steps;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      setPosX(prev => prev + delta);
      if (step >= steps) {
        clearInterval(interval);
        setPosX(targetPercent);
        onArrive?.();
      }
    }, stepTime);
  }, [posX]);

  // Cycle through idle behaviors
  const startIdleCycle = useCallback(() => {
    const cycle = () => {
      if (!isVisibleRef.current) return;

      // 30% chance to walk somewhere random
      if (Math.random() < 0.3) {
        const randomTarget = 10 + Math.random() * 80;
        walkTo(randomTarget, () => {
          setState('idle-sit');
          stateTimerRef.current = setTimeout(cycle, IDLE_MIN_MS + Math.random() * IDLE_MAX_MS);
        });
      } else {
        const randomIdle = IDLE_STATES[Math.floor(Math.random() * IDLE_STATES.length)];
        setState(randomIdle);
        stateTimerRef.current = setTimeout(cycle, IDLE_MIN_MS + Math.random() * IDLE_MAX_MS);
      }
    };
    stateTimerRef.current = setTimeout(cycle, IDLE_MIN_MS);
  }, [walkTo]);

  // Handle tab change — jump/run to tab
  useEffect(() => {
    if (prevTabRef.current === activeTabIndex) return;
    prevTabRef.current = activeTabIndex;
    markInteraction();

    if (state === 'sleep') {
      setState('idle-sit');
    }

    clearTimers();
    const target = tabTargets[activeTabIndex] ?? 50;

    // Jump animation then walk
    setState('jump');
    setTimeout(() => {
      walkTo(target, () => {
        setState('idle-sit');
        startIdleCycle();
        // Reset sleep timer
        if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
        sleepTimerRef.current = setTimeout(() => setState('sleep'), SLEEP_AFTER_MS);
      });
    }, 300);
  }, [activeTabIndex, clearTimers, markInteraction, walkTo, startIdleCycle, tabTargets, state]);

  // Initial setup
  useEffect(() => {
    const target = tabTargets[activeTabIndex] ?? 50;
    setPosX(target);
    markInteraction();
    startIdleCycle();
    return clearTimers;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Page visibility — sleep when hidden
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        isVisibleRef.current = false;
        clearTimers();
        setState('sleep');
      } else {
        isVisibleRef.current = true;
        setState('idle-sit');
        markInteraction();
        startIdleCycle();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [clearTimers, markInteraction, startIdleCycle]);

  // Track state in ref for scroll handler
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // Scroll wobble reaction
  useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      const s = stateRef.current;
      if (s === 'sleep' || s === 'jump') return;
      markInteraction();
      setState('wobble');
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (stateRef.current !== 'sleep') setState('idle-sit');
      }, 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [markInteraction]);

  return (
    <div
      className="fixed bottom-12 left-0 right-0 z-[55] pointer-events-none"
      aria-hidden="true"
    >
      <motion.div
        className="absolute bottom-0"
        animate={{
          left: `${posX}%`,
          y: state === 'jump' ? [0, -24, -28, -20, 0] : 0,
        }}
        transition={{
          left: { duration: 0.08, ease: 'linear' },
          y: { duration: 0.4, ease: 'easeOut' },
        }}
        style={{ transform: 'translateX(-50%)' }}
      >
        <motion.div
          animate={
            state === 'wobble'
              ? { rotate: [-5, 5, -3, 3, 0] }
              : state === 'jump'
              ? { scale: [1, 0.9, 1.1, 1] }
              : state.startsWith('walk-')
              ? { y: [0, -1, 0, -1, 0] }
              : {}
          }
          transition={{ duration: state.startsWith('walk-') ? 0.3 : 0.4, repeat: state.startsWith('walk-') ? Infinity : 0 }}
        >
          <CatSprite state={state} facingRight={facingRight} />
        </motion.div>
      </motion.div>
    </div>
  );
}
