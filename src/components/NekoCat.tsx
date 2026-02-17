import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';

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

/* ─── Ghibli-style white fluffy cat SVG ─── */
function CatSprite({ state, facingRight }: { state: NekoState; facingRight: boolean }) {
  const isWalking = state === 'walk-left' || state === 'walk-right';
  const isSleeping = state === 'sleep';
  const isLying = state === 'idle-liedown';
  const isGrooming = state === 'idle-groom';
  const isStretching = state === 'idle-stretch';
  const isPlaying = state === 'idle-play';
  const isLooking = state === 'idle-look';
  const isRolling = state === 'idle-roll';
  const isFalling = state === 'fall';
  const isWaking = state === 'wake';

  return (
    <svg
      viewBox="0 0 64 64"
      className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16"
      style={{
        transform: facingRight ? 'scaleX(1)' : 'scaleX(-1)',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))',
      }}
    >
      <defs>
        {/* Soft watercolor-like filter */}
        <filter id="neko-soft">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.3" />
        </filter>
        {/* Fur texture gradient */}
        <radialGradient id="neko-fur" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FEFEFE" />
          <stop offset="60%" stopColor="#F5F0EB" />
          <stop offset="100%" stopColor="#E8E0D8" />
        </radialGradient>
        <radialGradient id="neko-fur-shadow" cx="50%" cy="70%" r="50%">
          <stop offset="0%" stopColor="#F0EBE5" />
          <stop offset="100%" stopColor="#DDD5CC" />
        </radialGradient>
        {/* Eye gradient */}
        <radialGradient id="neko-eye" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#7EC8E3" />
          <stop offset="50%" stopColor="#4A9EBF" />
          <stop offset="100%" stopColor="#2D7A9C" />
        </radialGradient>
        {/* Tail stripe pattern */}
        <linearGradient id="neko-tail-stripe" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F5F0EB" />
          <stop offset="30%" stopColor="#EDE5DC" />
          <stop offset="50%" stopColor="#F5F0EB" />
          <stop offset="70%" stopColor="#EDE5DC" />
          <stop offset="100%" stopColor="#F5F0EB" />
        </linearGradient>
      </defs>

      <g filter="url(#neko-soft)">
        {/* === BODY === */}
        {/* Main fluffy body */}
        <motion.ellipse
          fill="url(#neko-fur)"
          stroke="#E0D8D0"
          strokeWidth="0.3"
          animate={{
            cx: isStretching ? 30 : 32,
            cy: isSleeping ? 46 : isLying || isRolling ? 44 : 42,
            rx: isStretching ? 16 : isSleeping ? 14 : isLying || isRolling ? 14 : 12,
            ry: isStretching ? 6 : isSleeping ? 7 : isLying || isRolling ? 6 : 9,
          }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
        {/* Body shadow/depth */}
        <motion.ellipse
          fill="url(#neko-fur-shadow)"
          opacity="0.4"
          animate={{
            cx: 32, cy: isSleeping ? 48 : 45,
            rx: isStretching ? 14 : 10,
            ry: isStretching ? 4 : isSleeping ? 5 : 5,
          }}
          transition={{ duration: 0.5 }}
        />

        {/* === FLUFFY CHEST FUR === */}
        {!(isSleeping || isLying || isRolling) && (
          <motion.ellipse
            cx="32" fill="#FEFEFE" opacity="0.6"
            animate={{ cy: 36, rx: 6, ry: 4 }}
          />
        )}

        {/* === TAIL (bushy with subtle stripes) === */}
        <motion.path
          fill="none"
          stroke="url(#neko-tail-stripe)"
          strokeWidth="4"
          strokeLinecap="round"
          animate={{
            d: isSleeping
              ? ['M22,46 Q14,42 16,36 Q18,32 20,34', 'M22,46 Q13,43 15,37 Q17,33 19,35', 'M22,46 Q14,42 16,36 Q18,32 20,34']
              : isPlaying
              ? ['M44,42 Q54,30 50,20 Q48,16 46,18', 'M44,42 Q56,26 52,16 Q50,12 48,14', 'M44,42 Q54,30 50,20 Q48,16 46,18']
              : isLying || isRolling
              ? ['M20,44 Q12,40 14,34 Q16,30 18,32', 'M20,44 Q11,41 13,35 Q15,31 17,33', 'M20,44 Q12,40 14,34 Q16,30 18,32']
              : ['M44,42 Q52,32 48,22 Q46,18 44,20', 'M44,42 Q54,34 50,24 Q48,20 46,22', 'M44,42 Q52,32 48,22 Q46,18 44,20'],
          }}
          transition={{ duration: isPlaying ? 0.8 : 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Tail fur fluff overlay */}
        <motion.path
          fill="none"
          stroke="#FEFEFE"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
          animate={{
            d: isSleeping
              ? ['M22,46 Q15,42 17,37', 'M22,46 Q14,43 16,38', 'M22,46 Q15,42 17,37']
              : ['M44,42 Q51,33 48,24', 'M44,42 Q53,35 50,26', 'M44,42 Q51,33 48,24'],
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* === HEAD === */}
        <motion.circle
          fill="url(#neko-fur)"
          stroke="#E0D8D0"
          strokeWidth="0.3"
          animate={{
            cx: isGrooming ? 28 : 32,
            cy: isSleeping ? 40 : isLying || isRolling ? 38 : 28,
            r: isSleeping ? 9 : 10,
          }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
        {/* Head fluffy cheeks */}
        {!(isSleeping) && (
          <>
            <motion.ellipse fill="#FEFEFE" opacity="0.4"
              animate={{ cx: 25, cy: isLying ? 40 : 30, rx: 4, ry: 3 }}
              transition={{ duration: 0.4 }}
            />
            <motion.ellipse fill="#FEFEFE" opacity="0.4"
              animate={{ cx: 39, cy: isLying ? 40 : 30, rx: 4, ry: 3 }}
              transition={{ duration: 0.4 }}
            />
          </>
        )}

        {/* === EARS === */}
        {/* Left ear */}
        <motion.polygon
          fill="url(#neko-fur)"
          stroke="#E0D8D0"
          strokeWidth="0.3"
          animate={{
            points: isSleeping || isLying
              ? '24,36 26,28 30,35'
              : '22,20 26,8 30,18',
          }}
          transition={{ duration: 0.4 }}
        />
        {/* Left ear inner (pink) */}
        <motion.polygon
          fill="#F5C5C5"
          opacity="0.6"
          animate={{
            points: isSleeping || isLying
              ? '25,35 26.5,30 29,34'
              : '24,19 26.5,11 29,18',
          }}
          transition={{ duration: 0.4 }}
        />
        {/* Right ear */}
        <motion.polygon
          fill="url(#neko-fur)"
          stroke="#E0D8D0"
          strokeWidth="0.3"
          animate={{
            points: isSleeping || isLying
              ? '34,35 38,28 40,36'
              : '34,18 38,8 42,20',
          }}
          transition={{ duration: 0.4 }}
        />
        {/* Right ear inner (pink) */}
        <motion.polygon
          fill="#F5C5C5"
          opacity="0.6"
          animate={{
            points: isSleeping || isLying
              ? '35,34 37.5,30 39,35'
              : '35,18 37.5,11 40,19',
          }}
          transition={{ duration: 0.4 }}
        />

        {/* === EYES === */}
        {isSleeping ? (
          <>
            {/* Closed eyes - gentle curves */}
            <motion.path
              d="M27,39 Q29,41 31,39" fill="none"
              stroke="#8B7D72" strokeWidth="0.8" strokeLinecap="round"
              animate={{ opacity: [1, 0.8, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.path
              d="M33,39 Q35,41 37,39" fill="none"
              stroke="#8B7D72" strokeWidth="0.8" strokeLinecap="round"
              animate={{ opacity: [1, 0.8, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </>
        ) : isWaking ? (
          <>
            {/* Half-open eyes */}
            <motion.ellipse cx="29" cy="27" fill="url(#neko-eye)"
              animate={{ rx: [0.5, 2.5], ry: [0.3, 2.5] }}
              transition={{ duration: 0.8 }}
            />
            <motion.ellipse cx="35" cy="27" fill="url(#neko-eye)"
              animate={{ rx: [0.5, 2.5], ry: [0.3, 2.5] }}
              transition={{ duration: 0.8 }}
            />
          </>
        ) : isLying || isRolling ? (
          <>
            <circle cx="29" cy="37" r="2.2" fill="white" />
            <circle cx="29" cy="37" r="1.5" fill="url(#neko-eye)" />
            <circle cx="29.5" cy="36.5" r="0.5" fill="white" opacity="0.8" />
            <circle cx="35" cy="37" r="2.2" fill="white" />
            <circle cx="35" cy="37" r="1.5" fill="url(#neko-eye)" />
            <circle cx="35.5" cy="36.5" r="0.5" fill="white" opacity="0.8" />
          </>
        ) : (
          <>
            {/* Big expressive blue eyes */}
            <circle cx="29" cy="27" r="2.8" fill="white" />
            <motion.circle
              cx="29" cy="27" r="2" fill="url(#neko-eye)"
              animate={isLooking
                ? { cx: [29, 27, 31, 29], cy: [27, 26, 26, 27] }
                : isFalling
                ? { r: [2, 2.5, 2] }
                : { r: [2, 2.1, 2] }
              }
              transition={isLooking
                ? { duration: 4, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 3, repeat: Infinity }
              }
            />
            {/* Eye shine */}
            <circle cx="29.8" cy="26" r="0.7" fill="white" opacity="0.9" />
            <circle cx="28.5" cy="27.8" r="0.3" fill="white" opacity="0.6" />

            <circle cx="35" cy="27" r="2.8" fill="white" />
            <motion.circle
              cx="35" cy="27" r="2" fill="url(#neko-eye)"
              animate={isLooking
                ? { cx: [35, 33, 37, 35], cy: [27, 26, 26, 27] }
                : isFalling
                ? { r: [2, 2.5, 2] }
                : { r: [2, 2.1, 2] }
              }
              transition={isLooking
                ? { duration: 4, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 3, repeat: Infinity, delay: 0.2 }
              }
            />
            <circle cx="35.8" cy="26" r="0.7" fill="white" opacity="0.9" />
            <circle cx="34.5" cy="27.8" r="0.3" fill="white" opacity="0.6" />

            {/* Blink animation overlay */}
            <motion.rect
              x="26" y="24" width="7" height="6" rx="2" fill="url(#neko-fur)"
              animate={{ scaleY: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '29px 27px' }}
            />
            <motion.rect
              x="32" y="24" width="7" height="6" rx="2" fill="url(#neko-fur)"
              animate={{ scaleY: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.02 }}
              style={{ transformOrigin: '35px 27px' }}
            />
          </>
        )}

        {/* === NOSE (tiny pink) === */}
        {!(isSleeping) && (
          <motion.ellipse
            fill="#E8A0A0"
            animate={{
              cx: isGrooming ? 28 : 32,
              cy: isLying ? 40 : 30,
              rx: 1, ry: 0.7,
            }}
            transition={{ duration: 0.4 }}
          />
        )}

        {/* === MOUTH === */}
        {!(isSleeping || isLying) && !isWaking && (
          <motion.path
            fill="none" stroke="#C4A090" strokeWidth="0.5" strokeLinecap="round"
            d={isWaking ? "M30,31 Q32,33 34,31" : "M30,31 Q32,32.5 34,31"}
          />
        )}
        {/* Wake yawn */}
        {isWaking && (
          <motion.ellipse cx="32" cy="31" fill="#E8A0A0" opacity="0.5"
            animate={{ rx: [0, 2, 0], ry: [0, 1.5, 0] }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />
        )}

        {/* === WHISKERS (delicate) === */}
        {!(isSleeping || isLying) && (
          <>
            <line x1="18" y1="28" x2="26" y2="29.5" stroke="#D0C4B8" strokeWidth="0.3" opacity="0.6" />
            <line x1="17" y1="30.5" x2="26" y2="30.5" stroke="#D0C4B8" strokeWidth="0.3" opacity="0.6" />
            <line x1="18" y1="33" x2="26" y2="31.5" stroke="#D0C4B8" strokeWidth="0.3" opacity="0.6" />
            <line x1="38" y1="29.5" x2="46" y2="28" stroke="#D0C4B8" strokeWidth="0.3" opacity="0.6" />
            <line x1="38" y1="30.5" x2="47" y2="30.5" stroke="#D0C4B8" strokeWidth="0.3" opacity="0.6" />
            <line x1="38" y1="31.5" x2="46" y2="33" stroke="#D0C4B8" strokeWidth="0.3" opacity="0.6" />
          </>
        )}

        {/* === LEGS === */}
        {isWalking && (
          <>
            {/* Front legs */}
            <motion.line
              x1="27" x2="25" stroke="#E8E0D8" strokeWidth="2.5" strokeLinecap="round"
              animate={{ y1: 48, y2: [54, 50, 54] }}
              transition={{ duration: 0.35, repeat: Infinity }}
            />
            <motion.line
              x1="30" x2="29" stroke="#E8E0D8" strokeWidth="2.5" strokeLinecap="round"
              animate={{ y1: 48, y2: [50, 54, 50] }}
              transition={{ duration: 0.35, repeat: Infinity }}
            />
            {/* Back legs */}
            <motion.line
              x1="34" x2="35" stroke="#E8E0D8" strokeWidth="2.5" strokeLinecap="round"
              animate={{ y1: 48, y2: [54, 50, 54] }}
              transition={{ duration: 0.35, repeat: Infinity, delay: 0.08 }}
            />
            <motion.line
              x1="37" x2="39" stroke="#E8E0D8" strokeWidth="2.5" strokeLinecap="round"
              animate={{ y1: 48, y2: [50, 54, 50] }}
              transition={{ duration: 0.35, repeat: Infinity, delay: 0.08 }}
            />
            {/* Tiny paw circles */}
            <motion.circle r="1.2" fill="#F0EBE5"
              animate={{ cx: 25, cy: [54, 50, 54] }}
              transition={{ duration: 0.35, repeat: Infinity }}
            />
            <motion.circle r="1.2" fill="#F0EBE5"
              animate={{ cx: 39, cy: [50, 54, 50] }}
              transition={{ duration: 0.35, repeat: Infinity, delay: 0.08 }}
            />
          </>
        )}

        {/* Static front paws when sitting */}
        {!isWalking && !isSleeping && !isLying && !isRolling && !isStretching && (
          <>
            <ellipse cx="28" cy="48" rx="2" ry="1.5" fill="#F0EBE5" />
            <ellipse cx="36" cy="48" rx="2" ry="1.5" fill="#F0EBE5" />
          </>
        )}

        {/* Stretching pose front paws */}
        {isStretching && (
          <>
            <motion.ellipse fill="#F0EBE5" ry="1.5"
              animate={{ cx: [28, 22, 28], cy: 48, rx: [2, 3, 2] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <ellipse cx="36" cy="48" rx="2" ry="1.5" fill="#F0EBE5" />
          </>
        )}

        {/* Grooming paw to face */}
        {isGrooming && (
          <motion.circle r="2" fill="#F0EBE5"
            animate={{ cx: [24, 26, 24], cy: [32, 28, 32] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Playing - batting at imaginary object */}
        {isPlaying && (
          <>
            <motion.circle r="1" fill="#F5C5C5" opacity="0.4"
              animate={{ cx: [40, 44, 40], cy: [36, 32, 36], opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 0.7, repeat: Infinity }}
            />
            <motion.ellipse fill="#F0EBE5" ry="1.5"
              animate={{ cx: [36, 40, 36], cy: [46, 38, 46], rx: [2, 1.5, 2] }}
              transition={{ duration: 0.7, repeat: Infinity }}
            />
          </>
        )}

        {/* Rolling belly-up hint */}
        {isRolling && (
          <motion.ellipse cx="32" fill="#FEFEFE" opacity="0.5"
            animate={{ cy: [44, 43, 44], rx: [8, 9, 8], ry: [4, 5, 4], rotate: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Falling wide-eyed surprise */}
        {isFalling && (
          <>
            <motion.line x1="26" y1="46" x2="22" y2="42" stroke="#E8E0D8" strokeWidth="2" strokeLinecap="round"
              animate={{ x2: [22, 20, 22], y2: [42, 40, 42] }}
              transition={{ duration: 0.3, repeat: Infinity }}
            />
            <motion.line x1="38" y1="46" x2="42" y2="42" stroke="#E8E0D8" strokeWidth="2" strokeLinecap="round"
              animate={{ x2: [42, 44, 42], y2: [42, 40, 42] }}
              transition={{ duration: 0.3, repeat: Infinity }}
            />
          </>
        )}

        {/* === SLEEP breathing + Zzz === */}
        {isSleeping && (
          <>
            <motion.ellipse cx="32" fill="url(#neko-fur)" opacity="0.3"
              animate={{ cy: [46, 45.5, 46], rx: [13, 13.5, 13], ry: [6.5, 7, 6.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.text x="44" fontSize="6" fill="#A0C4D8" fontFamily="'Caveat', cursive" fontWeight="bold"
              animate={{ opacity: [0, 0.7, 0], y: [36, 28, 20] }}
              transition={{ duration: 3, repeat: Infinity }}>z</motion.text>
            <motion.text x="48" fontSize="4.5" fill="#A0C4D8" fontFamily="'Caveat', cursive" fontWeight="bold"
              animate={{ opacity: [0, 0.5, 0], y: [30, 22, 14] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}>z</motion.text>
            <motion.text x="51" fontSize="3.5" fill="#A0C4D8" fontFamily="'Caveat', cursive" fontWeight="bold"
              animate={{ opacity: [0, 0.4, 0], y: [24, 16, 8] }}
              transition={{ duration: 3, repeat: Infinity, delay: 2 }}>z</motion.text>
          </>
        )}
      </g>
    </svg>
  );
}

/* ─── Main Neko Component ─── */
const IDLE_STATES: NekoState[] = ['idle-sit', 'idle-look', 'idle-groom', 'idle-stretch', 'idle-liedown', 'idle-play', 'idle-roll'];
const WALK_DURATION_MS = 2200;
const IDLE_MIN_MS = 8000;
const IDLE_MAX_MS = 35000;
const SLEEP_AFTER_MS = 30000;

export default function NekoCat({ activeTabIndex }: { activeTabIndex: number }) {
  const [state, setState] = useState<NekoState>('idle-sit');
  const [posX, setPosX] = useState(50);
  const [facingRight, setFacingRight] = useState(true);
  const stateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const walkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
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
    sleepTimerRef.current = setTimeout(() => {
      setState('sleep');
    }, SLEEP_AFTER_MS);
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
          setState('idle-sit');
          stateTimerRef.current = setTimeout(cycle, IDLE_MIN_MS + Math.random() * (IDLE_MAX_MS - IDLE_MIN_MS));
        });
      } else {
        const randomIdle = IDLE_STATES[Math.floor(Math.random() * IDLE_STATES.length)];
        setState(randomIdle);
        const duration = randomIdle === 'idle-groom' || randomIdle === 'idle-stretch'
          ? 3000 + Math.random() * 4000
          : IDLE_MIN_MS + Math.random() * (IDLE_MAX_MS - IDLE_MIN_MS);
        stateTimerRef.current = setTimeout(cycle, duration);
      }
    };
    stateTimerRef.current = setTimeout(cycle, IDLE_MIN_MS);
  }, [walkTo]);

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
        style={{ transform: 'translateX(-50%)', opacity: 0.8 }}
      >
        <motion.div
          animate={
            state === 'wobble'
              ? { rotate: [-6, 6, -4, 4, -2, 0] }
              : state === 'jump'
              ? { scale: [1, 0.85, 1.15, 1] }
              : state === 'fall'
              ? { rotate: [0, 10, -10, 5, 0] }
              : state.startsWith('walk-')
              ? { y: [0, -1.5, 0, -1.5, 0] }
              : state === 'wake'
              ? { scale: [0.9, 1.05, 1] }
              : {}
          }
          transition={{
            duration: state.startsWith('walk-') ? 0.35 : state === 'wake' ? 0.8 : 0.5,
            repeat: state.startsWith('walk-') ? Infinity : 0,
          }}
        >
          <CatSprite state={state} facingRight={facingRight} />
        </motion.div>
      </motion.div>
    </div>
  );
}