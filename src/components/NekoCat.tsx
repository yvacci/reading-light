import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import realistic cat pose images
import nekoSit from '@/assets/neko/neko-sit.png';
import nekoWalk from '@/assets/neko/neko-walk.png';
import nekoSleep from '@/assets/neko/neko-sleep.png';
import nekoStretch from '@/assets/neko/neko-stretch.png';
import nekoGroom from '@/assets/neko/neko-groom.png';
import nekoLiedown from '@/assets/neko/neko-liedown.png';
import nekoPlay from '@/assets/neko/neko-play.png';

const NEKO_ENABLED_KEY = 'nwt-neko-enabled';

type NekoState =
  | 'idle-sit'
  | 'idle-look'
  | 'idle-groom'
  | 'idle-stretch'
  | 'idle-liedown'
  | 'idle-play'
  | 'idle-roll'
  | 'walk-left'
  | 'walk-right'
  | 'jump'
  | 'wobble'
  | 'fall'
  | 'sleep'
  | 'wake';

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

/* ─── State to image mapping ─── */
function getNekoImage(state: NekoState): string {
  switch (state) {
    case 'walk-left':
    case 'walk-right':
      return nekoWalk;
    case 'sleep':
      return nekoSleep;
    case 'idle-stretch':
    case 'wake':
      return nekoStretch;
    case 'idle-groom':
      return nekoGroom;
    case 'idle-liedown':
    case 'idle-roll':
      return nekoLiedown;
    case 'idle-play':
    case 'fall':
      return nekoPlay;
    case 'idle-sit':
    case 'idle-look':
    case 'jump':
    case 'wobble':
    default:
      return nekoSit;
  }
}

/* ─── Sparkle / Petal Particles ─── */
function Particles({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; type: 'sparkle' | 'petal'; size: number }[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    if (!active) { setParticles([]); return; }

    const spawn = () => {
      const count = 2 + Math.floor(Math.random() * 3);
      const newParticles = Array.from({ length: count }, () => ({
        id: idRef.current++,
        x: -20 + Math.random() * 40,
        y: -10 + Math.random() * 30,
        type: (Math.random() > 0.5 ? 'sparkle' : 'petal') as 'sparkle' | 'petal',
        size: 4 + Math.random() * 6,
      }));
      setParticles(newParticles);
      setTimeout(() => setParticles([]), 2500);
    };

    spawn();
    const interval = setInterval(spawn, 8000 + Math.random() * 12000);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <AnimatePresence>
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute pointer-events-none"
          initial={{ opacity: 0, x: p.x, y: p.y, scale: 0 }}
          animate={{
            opacity: [0, 0.8, 0.6, 0],
            x: p.x + (Math.random() - 0.5) * 30,
            y: p.y - 20 - Math.random() * 20,
            scale: [0, 1.2, 1, 0.5],
            rotate: p.type === 'petal' ? [0, 180, 360] : [0, 90, 180],
          }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 2 + Math.random(), ease: 'easeOut' }}
          style={{ width: p.size, height: p.size }}
        >
          {p.type === 'sparkle' ? (
            <svg viewBox="0 0 12 12" className="w-full h-full">
              <path d="M6,0 L7,4.5 L12,6 L7,7.5 L6,12 L5,7.5 L0,6 L5,4.5 Z"
                fill="hsl(45, 90%, 70%)" opacity="0.8" />
            </svg>
          ) : (
            <svg viewBox="0 0 12 12" className="w-full h-full">
              <ellipse cx="6" cy="6" rx="4" ry="6" fill="hsl(340, 60%, 80%)"
                opacity="0.7" transform="rotate(30 6 6)" />
            </svg>
          )}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

/* ─── Thought Bubble ─── */
function ThoughtBubble({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -5, scale: 0.8 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="absolute -top-12 left-1/2 -translate-x-1/2 pointer-events-none"
      style={{ width: 'max-content', maxWidth: 180 }}
    >
      <div className="relative bg-card/90 backdrop-blur-sm rounded-xl px-2.5 py-1.5 shadow-lg border border-border/30">
        <p className="text-[9px] leading-tight text-foreground/80 font-medium whitespace-nowrap overflow-hidden text-ellipsis" style={{ maxWidth: 160 }}>
          {message}
        </p>
        <svg className="absolute -bottom-2 left-1/2 -translate-x-1/2" width="12" height="8" viewBox="0 0 12 8">
          <path d="M2,0 Q6,7 10,0" className="fill-card" opacity="0.9" />
        </svg>
      </div>
      <motion.div
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-card/80"
        animate={{ scale: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-6 left-[calc(50%-4px)] w-1 h-1 rounded-full bg-card/60"
        animate={{ scale: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
      />
    </motion.div>
  );
}

/* ─── Realistic Cat Sprite (image-based) ─── */
function CatSprite({ state, facingRight }: { state: NekoState; facingRight: boolean }) {
  const imageSrc = getNekoImage(state);
  const isIdle = state.startsWith('idle-') || state === 'wobble';

  return (
    <div
      className="relative w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16"
      style={{
        transform: facingRight ? 'scaleX(1)' : 'scaleX(-1)',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={imageSrc}
          src={imageSrc}
          alt=""
          draggable={false}
          className="w-full h-full object-contain select-none"
          style={{
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.18))',
          }}
          initial={{ opacity: 0.5, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0.5, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        />
      </AnimatePresence>

      {/* Subtle breathing for idle states */}
      {isIdle && (
        <motion.div
          className="absolute inset-0"
          animate={{ scaleY: [1, 1.01, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Sleep Zzz */}
      {state === 'sleep' && (
        <div className="absolute -top-2 -right-1">
          <motion.span
            className="text-[8px] font-bold text-primary/50 block"
            animate={{ opacity: [0, 0.6, 0], y: [0, -8, -16] }}
            transition={{ duration: 3, repeat: Infinity }}
          >z</motion.span>
          <motion.span
            className="text-[6px] font-bold text-primary/40 block absolute top-0 left-2"
            animate={{ opacity: [0, 0.4, 0], y: [0, -6, -12] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          >z</motion.span>
        </div>
      )}
    </div>
  );
}

/* ─── Main Neko Component ─── */
const IDLE_STATES: NekoState[] = ['idle-sit', 'idle-look', 'idle-groom', 'idle-stretch', 'idle-liedown', 'idle-play', 'idle-roll'];
const WALK_DURATION_MS = 2200;
const IDLE_MIN_MS = 8000;
const IDLE_MAX_MS = 35000;
const SLEEP_AFTER_MS = 30000;
const THOUGHT_INTERVAL_MS = 45000;
const THOUGHT_DURATION_MS = 6000;

const GENERIC_THOUGHTS = [
  '🐾 Meow~',
  '✨ Have a great day!',
  '📖 Time to read?',
  '💤 So peaceful...',
  '🌸 Keep going!',
];

export default function NekoCat({ activeTabIndex, reminders = [] }: {
  activeTabIndex: number;
  reminders?: { type: string; name: string; date: string; time?: string }[];
}) {
  const [state, setState] = useState<NekoState>('idle-sit');
  const [posX, setPosX] = useState(50);
  const [facingRight, setFacingRight] = useState(true);
  const [thought, setThought] = useState<string | null>(null);
  const [showParticles, setShowParticles] = useState(false);
  const stateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const walkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const thoughtTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const particleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastInteraction = useRef(Date.now());
  const prevTabRef = useRef(activeTabIndex);
  const isVisibleRef = useRef(true);

  const tabTargets = useMemo(() => [10, 30, 50, 70, 90], []);

  const clearTimers = useCallback(() => {
    if (stateTimerRef.current) clearTimeout(stateTimerRef.current);
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    if (walkIntervalRef.current) clearInterval(walkIntervalRef.current);
  }, []);

  const resetSleepTimer = useCallback(() => {
    lastInteraction.current = Date.now();
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    sleepTimerRef.current = setTimeout(() => setState('sleep'), SLEEP_AFTER_MS);
  }, []);

  const walkTo = useCallback((targetPercent: number, onArrive?: () => void) => {
    const startPos = posX;
    if (Math.abs(targetPercent - startPos) < 3) { onArrive?.(); return; }
    const goingRight = targetPercent > startPos;
    setFacingRight(goingRight);
    setState(goingRight ? 'walk-right' : 'walk-left');
    if (walkIntervalRef.current) clearInterval(walkIntervalRef.current);
    const steps = 35;
    const stepTime = WALK_DURATION_MS / steps;
    const delta = (targetPercent - startPos) / steps;
    let step = 0;
    walkIntervalRef.current = setInterval(() => {
      step++;
      setPosX(prev => prev + delta);
      if (step >= steps) {
        if (walkIntervalRef.current) clearInterval(walkIntervalRef.current);
        setPosX(targetPercent);
        onArrive?.();
      }
    }, stepTime);
  }, [posX]);

  const startIdleCycle = useCallback(() => {
    const cycle = () => {
      if (!isVisibleRef.current) return;
      if (Math.random() < 0.25) {
        const target = Math.max(5, Math.min(95, 10 + Math.random() * 80));
        walkTo(target, () => {
          // After walking, randomly face a direction (not always toward user)
          setFacingRight(Math.random() > 0.5);
          setState('idle-sit');
          stateTimerRef.current = setTimeout(cycle, IDLE_MIN_MS + Math.random() * (IDLE_MAX_MS - IDLE_MIN_MS));
        });
      } else {
        const randomIdle = IDLE_STATES[Math.floor(Math.random() * IDLE_STATES.length)];
        setState(randomIdle);
        // Randomly change facing direction during idle
        if (Math.random() > 0.6) setFacingRight(Math.random() > 0.5);
        const duration = randomIdle === 'idle-groom' || randomIdle === 'idle-stretch'
          ? 3000 + Math.random() * 4000
          : IDLE_MIN_MS + Math.random() * (IDLE_MAX_MS - IDLE_MIN_MS);
        stateTimerRef.current = setTimeout(cycle, duration);
      }
    };
    stateTimerRef.current = setTimeout(cycle, IDLE_MIN_MS);
  }, [walkTo]);

  // Particle effect cycle during idle
  useEffect(() => {
    const scheduleParticles = () => {
      particleTimerRef.current = setTimeout(() => {
        const s = stateRef.current;
        if (s.startsWith('idle-') && s !== 'idle-sit') {
          setShowParticles(true);
          setTimeout(() => setShowParticles(false), 3000);
        }
        scheduleParticles();
      }, 12000 + Math.random() * 18000);
    };
    scheduleParticles();
    return () => { if (particleTimerRef.current) clearTimeout(particleTimerRef.current); };
  }, []);

  // Thought bubble cycle
  useEffect(() => {
    const showThought = () => {
      const stateNow = stateRef.current;
      if (stateNow === 'sleep' || stateNow === 'jump') return;

      let msg: string;
      if (reminders.length > 0 && Math.random() < 0.6) {
        const r = reminders[Math.floor(Math.random() * reminders.length)];
        msg = `📅 ${r.type}: ${r.name}${r.time ? ` @ ${r.time}` : ''}`;
      } else {
        msg = GENERIC_THOUGHTS[Math.floor(Math.random() * GENERIC_THOUGHTS.length)];
      }

      setThought(msg);
      setTimeout(() => setThought(null), THOUGHT_DURATION_MS);
      thoughtTimerRef.current = setTimeout(showThought, THOUGHT_INTERVAL_MS + Math.random() * 20000);
    };

    thoughtTimerRef.current = setTimeout(showThought, 15000 + Math.random() * 15000);
    return () => { if (thoughtTimerRef.current) clearTimeout(thoughtTimerRef.current); };
  }, [reminders]);

  // Tab change
  useEffect(() => {
    if (prevTabRef.current === activeTabIndex) return;
    prevTabRef.current = activeTabIndex;
    resetSleepTimer();
    if (state === 'sleep') setState('wake');
    clearTimers();
    const target = tabTargets[activeTabIndex] ?? 50;
    setState('jump');
    setTimeout(() => {
      walkTo(target, () => {
        setFacingRight(Math.random() > 0.5);
        setState('idle-sit');
        startIdleCycle();
        resetSleepTimer();
      });
    }, 350);
  }, [activeTabIndex, clearTimers, resetSleepTimer, walkTo, startIdleCycle, tabTargets, state]);

  // Initial
  useEffect(() => {
    const target = tabTargets[activeTabIndex] ?? 50;
    setPosX(target);
    resetSleepTimer();
    startIdleCycle();
    return clearTimers;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Visibility
  useEffect(() => {
    const handler = () => {
      if (document.hidden) {
        isVisibleRef.current = false;
        clearTimers();
        setState('sleep');
      } else {
        isVisibleRef.current = true;
        setState('wake');
        setTimeout(() => {
          setState('idle-sit');
          resetSleepTimer();
          startIdleCycle();
        }, 1500);
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [clearTimers, resetSleepTimer, startIdleCycle]);

  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // Scroll wobble
  useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      const s = stateRef.current;
      if (s === 'sleep' || s === 'jump' || s === 'wake') return;
      resetSleepTimer();
      setState('wobble');
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (stateRef.current === 'wobble') setState('idle-sit');
      }, 700);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => { window.removeEventListener('scroll', handleScroll); clearTimeout(scrollTimeout); };
  }, [resetSleepTimer]);

  return (
    <div className="fixed bottom-12 left-0 right-0 z-[55] pointer-events-none" aria-hidden="true">
      <motion.div
        className="absolute bottom-0"
        animate={{
          left: `${posX}%`,
          y: state === 'jump' ? [0, -28, -32, -24, 0]
            : state === 'fall' ? [0, 4, 8, 12, 0]
            : 0,
        }}
        transition={{
          left: { duration: 0.08, ease: 'linear' },
          y: { duration: state === 'fall' ? 0.6 : 0.45, ease: 'easeOut' },
        }}
        style={{ transform: 'translateX(-50%)' }}
      >
        {/* Particles */}
        <Particles active={showParticles} />

        {/* Thought bubble */}
        <AnimatePresence>
          {thought && <ThoughtBubble message={thought} />}
        </AnimatePresence>

        {/* Cat body animations */}
        <motion.div
          animate={
            state === 'wobble'
              ? { rotate: [-5, 5, -3, 3, -1, 0] }
              : state === 'jump'
              ? { scale: [1, 0.85, 1.15, 1] }
              : state === 'fall'
              ? { rotate: [0, 8, -8, 4, 0] }
              : state.startsWith('walk-')
              ? { y: [0, -2, 0, -2, 0] }
              : state === 'wake'
              ? { scale: [0.9, 1.05, 1] }
              : {}
          }
          transition={{
            duration: state.startsWith('walk-') ? 0.4 : state === 'wake' ? 0.8 : 0.5,
            repeat: state.startsWith('walk-') ? Infinity : 0,
          }}
        >
          <CatSprite state={state} facingRight={facingRight} />
        </motion.div>
      </motion.div>
    </div>
  );
}
