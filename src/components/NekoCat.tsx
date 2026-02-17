import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

/* ─── Thought Bubble ─── */
function ThoughtBubble({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -5, scale: 0.8 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="absolute -top-14 left-1/2 -translate-x-1/2 pointer-events-none"
      style={{ width: 'max-content', maxWidth: 180 }}
    >
      <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl px-2.5 py-1.5 shadow-lg border border-border/30">
        <p className="text-[9px] leading-tight text-foreground/80 font-medium whitespace-nowrap overflow-hidden text-ellipsis" style={{ maxWidth: 160 }}>
          {message}
        </p>
        {/* Bubble tail */}
        <svg className="absolute -bottom-2 left-1/2 -translate-x-1/2" width="12" height="8" viewBox="0 0 12 8">
          <path d="M2,0 Q6,7 10,0" fill="white" className="dark:fill-slate-800" opacity="0.9" />
        </svg>
      </div>
      {/* Small thought dots */}
      <motion.div
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white/80 dark:bg-slate-700/80"
        animate={{ scale: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-6 left-[calc(50%-4px)] w-1 h-1 rounded-full bg-white/60 dark:bg-slate-700/60"
        animate={{ scale: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
      />
    </motion.div>
  );
}

/* ─── Realistic 3D-style Cat SVG ─── */
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
      viewBox="0 0 80 80"
      className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20"
      style={{
        transform: facingRight ? 'scaleX(1)' : 'scaleX(-1)',
        filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.15)) drop-shadow(0 1px 2px rgba(0,0,0,0.08))',
      }}
    >
      <defs>
        {/* Realistic fur gradient with depth */}
        <radialGradient id="neko3d-body" cx="45%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FAFAFA" />
          <stop offset="35%" stopColor="#F2EFEB" />
          <stop offset="70%" stopColor="#E6E0D8" />
          <stop offset="100%" stopColor="#D4CCC2" />
        </radialGradient>
        {/* Belly highlight */}
        <radialGradient id="neko3d-belly" cx="50%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F0EDE8" />
        </radialGradient>
        {/* Head gradient with light from top-left */}
        <radialGradient id="neko3d-head" cx="40%" cy="30%" r="55%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#F5F2EE" />
          <stop offset="80%" stopColor="#E8E2DA" />
          <stop offset="100%" stopColor="#D8D0C6" />
        </radialGradient>
        {/* Realistic eye - deep blue with light refraction */}
        <radialGradient id="neko3d-iris" cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#6CB8E0" />
          <stop offset="40%" stopColor="#4A9CC8" />
          <stop offset="75%" stopColor="#2D7AA0" />
          <stop offset="100%" stopColor="#1B5C7A" />
        </radialGradient>
        {/* Ambient shadow under cat */}
        <radialGradient id="neko3d-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.12)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        {/* Nose gradient */}
        <radialGradient id="neko3d-nose" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#E8A0A0" />
          <stop offset="100%" stopColor="#D08080" />
        </radialGradient>
        {/* Ear inner pink */}
        <linearGradient id="neko3d-ear-inner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0B8B8" />
          <stop offset="100%" stopColor="#E09898" />
        </linearGradient>
        {/* Tail gradient */}
        <linearGradient id="neko3d-tail" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#EDE8E2" />
          <stop offset="50%" stopColor="#F5F2EE" />
          <stop offset="100%" stopColor="#E0D8CE" />
        </linearGradient>
        {/* Paw pad */}
        <radialGradient id="neko3d-pawpad" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#E8A8A8" />
          <stop offset="100%" stopColor="#D09090" />
        </radialGradient>
      </defs>

      {/* Ground shadow */}
      <motion.ellipse
        fill="url(#neko3d-shadow)"
        animate={{
          cx: 40, cy: isSleeping || isLying || isRolling ? 66 : 68,
          rx: isStretching ? 22 : isSleeping ? 18 : 16,
          ry: 3,
        }}
        transition={{ duration: 0.4 }}
      />

      {/* === TAIL (fluffy, volumetric) === */}
      <motion.path
        fill="none"
        stroke="url(#neko3d-tail)"
        strokeWidth="5.5"
        strokeLinecap="round"
        animate={{
          d: isSleeping
            ? ['M28,58 Q16,52 18,42 Q20,36 24,40', 'M28,58 Q14,54 16,44 Q18,38 22,42', 'M28,58 Q16,52 18,42 Q20,36 24,40']
            : isPlaying
            ? ['M54,52 Q66,36 60,22 Q56,16 52,20', 'M54,52 Q70,30 64,16 Q60,10 56,14', 'M54,52 Q66,36 60,22 Q56,16 52,20']
            : isLying || isRolling
            ? ['M24,56 Q14,50 16,40 Q18,34 22,38', 'M24,56 Q12,52 14,42 Q16,36 20,40', 'M24,56 Q14,50 16,40 Q18,34 22,38']
            : ['M54,52 Q64,40 58,26 Q54,20 50,24', 'M54,52 Q68,42 62,28 Q58,22 54,26', 'M54,52 Q64,40 58,26 Q54,20 50,24'],
        }}
        transition={{ duration: isPlaying ? 0.9 : 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Tail highlight */}
      <motion.path
        fill="none" stroke="#FEFEFE" strokeWidth="2" strokeLinecap="round" opacity="0.5"
        animate={{
          d: isSleeping
            ? ['M28,58 Q17,52 19,43', 'M28,58 Q15,54 17,45', 'M28,58 Q17,52 19,43']
            : ['M54,52 Q63,41 59,28', 'M54,52 Q67,43 63,30', 'M54,52 Q63,41 59,28'],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* === BODY (3D volumetric form) === */}
      <motion.ellipse
        fill="url(#neko3d-body)"
        animate={{
          cx: isStretching ? 36 : 40,
          cy: isSleeping ? 58 : isLying || isRolling ? 56 : 52,
          rx: isStretching ? 20 : isSleeping ? 18 : isLying || isRolling ? 18 : 15,
          ry: isStretching ? 7 : isSleeping ? 9 : isLying || isRolling ? 8 : 12,
        }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      />
      {/* Body contour line (subtle) */}
      <motion.ellipse
        fill="none" stroke="#C8BEB2" strokeWidth="0.4" opacity="0.3"
        animate={{
          cx: isStretching ? 36 : 40,
          cy: isSleeping ? 58 : isLying || isRolling ? 56 : 52,
          rx: isStretching ? 20 : isSleeping ? 18 : isLying || isRolling ? 18 : 15,
          ry: isStretching ? 7 : isSleeping ? 9 : isLying || isRolling ? 8 : 12,
        }}
        transition={{ duration: 0.5 }}
      />
      {/* Belly/chest highlight */}
      {!(isSleeping || isLying || isRolling) && (
        <motion.ellipse
          fill="url(#neko3d-belly)" opacity="0.7"
          animate={{ cx: 40, cy: 46, rx: 8, ry: 5 }}
        />
      )}

      {/* === LEGS === */}
      {isWalking && (
        <>
          {/* Back legs (behind body) */}
          <motion.path
            fill="#DDD6CC" stroke="#C8BEB2" strokeWidth="0.3"
            animate={{
              d: ['M34,60 Q32,66 33,70 Q34,72 36,70 Q37,66 35,60',
                  'M34,60 Q30,64 31,70 Q32,72 34,70 Q35,64 35,60',
                  'M34,60 Q32,66 33,70 Q34,72 36,70 Q37,66 35,60'],
            }}
            transition={{ duration: 0.4, repeat: Infinity }}
          />
          <motion.path
            fill="#DDD6CC" stroke="#C8BEB2" strokeWidth="0.3"
            animate={{
              d: ['M46,60 Q48,64 47,70 Q46,72 44,70 Q43,64 45,60',
                  'M46,60 Q50,66 49,70 Q48,72 46,70 Q45,66 45,60',
                  'M46,60 Q48,64 47,70 Q46,72 44,70 Q43,64 45,60'],
            }}
            transition={{ duration: 0.4, repeat: Infinity, delay: 0.1 }}
          />
          {/* Front legs */}
          <motion.path
            fill="#E8E2DA" stroke="#C8BEB2" strokeWidth="0.3"
            animate={{
              d: ['M36,58 Q34,64 35,70 Q36,72 38,70 Q39,64 37,58',
                  'M36,58 Q32,62 33,70 Q34,72 36,70 Q37,62 37,58',
                  'M36,58 Q34,64 35,70 Q36,72 38,70 Q39,64 37,58'],
            }}
            transition={{ duration: 0.4, repeat: Infinity, delay: 0.05 }}
          />
          <motion.path
            fill="#E8E2DA" stroke="#C8BEB2" strokeWidth="0.3"
            animate={{
              d: ['M44,58 Q46,62 45,70 Q44,72 42,70 Q41,62 43,58',
                  'M44,58 Q48,64 47,70 Q46,72 44,70 Q43,64 43,58',
                  'M44,58 Q46,62 45,70 Q44,72 42,70 Q41,62 43,58'],
            }}
            transition={{ duration: 0.4, repeat: Infinity, delay: 0.15 }}
          />
          {/* Paw pads */}
          <motion.ellipse fill="url(#neko3d-pawpad)" rx="1.8" ry="1"
            animate={{ cx: 36, cy: [70, 66, 70] }}
            transition={{ duration: 0.4, repeat: Infinity, delay: 0.05 }}
          />
          <motion.ellipse fill="url(#neko3d-pawpad)" rx="1.8" ry="1"
            animate={{ cx: 44, cy: [66, 70, 66] }}
            transition={{ duration: 0.4, repeat: Infinity, delay: 0.15 }}
          />
        </>
      )}

      {/* Sitting front paws */}
      {!isWalking && !isSleeping && !isLying && !isRolling && !isStretching && !isGrooming && (
        <>
          <ellipse cx="34" cy="62" rx="3" ry="2" fill="#E8E2DA" stroke="#C8BEB2" strokeWidth="0.3" />
          <ellipse cx="46" cy="62" rx="3" ry="2" fill="#E8E2DA" stroke="#C8BEB2" strokeWidth="0.3" />
          {/* Tiny toe lines */}
          <path d="M32.5,62.5 L33,61.5" stroke="#D0C8BC" strokeWidth="0.3" opacity="0.5" />
          <path d="M34,62.5 L34,61.5" stroke="#D0C8BC" strokeWidth="0.3" opacity="0.5" />
          <path d="M44.5,62.5 L44.5,61.5" stroke="#D0C8BC" strokeWidth="0.3" opacity="0.5" />
          <path d="M46,62.5 L46,61.5" stroke="#D0C8BC" strokeWidth="0.3" opacity="0.5" />
        </>
      )}

      {/* Stretching paws */}
      {isStretching && (
        <>
          <motion.ellipse fill="#E8E2DA" stroke="#C8BEB2" strokeWidth="0.3" ry="2"
            animate={{ cx: [34, 24, 34], cy: 62, rx: [3, 4, 3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <ellipse cx="46" cy="62" rx="3" ry="2" fill="#E8E2DA" stroke="#C8BEB2" strokeWidth="0.3" />
        </>
      )}

      {/* Grooming paw */}
      {isGrooming && (
        <motion.ellipse fill="#E8E2DA" stroke="#C8BEB2" strokeWidth="0.3" rx="2.5" ry="2"
          animate={{ cx: [30, 33, 30], cy: [42, 36, 42] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Playing paw */}
      {isPlaying && (
        <>
          <motion.circle r="1.5" fill="#E8C8C8" opacity="0.3"
            animate={{ cx: [50, 56, 50], cy: [44, 38, 44], opacity: [0.1, 0.5, 0.1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
          <motion.ellipse fill="#E8E2DA" stroke="#C8BEB2" strokeWidth="0.3" ry="2"
            animate={{ cx: [46, 52, 46], cy: [58, 44, 58], rx: [3, 2, 3] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        </>
      )}

      {/* Rolling belly */}
      {isRolling && (
        <motion.ellipse cx="40" fill="url(#neko3d-belly)" opacity="0.6"
          animate={{ cy: [56, 55, 56], rx: [12, 13, 12], ry: [5, 6, 5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Falling paw flail */}
      {isFalling && (
        <>
          <motion.path fill="#E8E2DA" stroke="#C8BEB2" strokeWidth="0.3"
            animate={{
              d: ['M32,56 Q28,50 26,52 Q24,54 28,56',
                  'M32,56 Q26,48 24,50 Q22,52 26,54',
                  'M32,56 Q28,50 26,52 Q24,54 28,56'],
            }}
            transition={{ duration: 0.35, repeat: Infinity }}
          />
          <motion.path fill="#E8E2DA" stroke="#C8BEB2" strokeWidth="0.3"
            animate={{
              d: ['M48,56 Q52,50 54,52 Q56,54 52,56',
                  'M48,56 Q54,48 56,50 Q58,52 54,54',
                  'M48,56 Q52,50 54,52 Q56,54 52,56'],
            }}
            transition={{ duration: 0.35, repeat: Infinity }}
          />
        </>
      )}

      {/* === HEAD === */}
      <motion.ellipse
        fill="url(#neko3d-head)"
        animate={{
          cx: isGrooming ? 36 : 40,
          cy: isSleeping ? 50 : isLying || isRolling ? 48 : 34,
          rx: isSleeping ? 12 : 13,
          ry: isSleeping ? 10 : 12,
        }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      />
      {/* Head contour */}
      <motion.ellipse
        fill="none" stroke="#C0B6AA" strokeWidth="0.4" opacity="0.25"
        animate={{
          cx: isGrooming ? 36 : 40,
          cy: isSleeping ? 50 : isLying || isRolling ? 48 : 34,
          rx: isSleeping ? 12 : 13,
          ry: isSleeping ? 10 : 12,
        }}
        transition={{ duration: 0.4 }}
      />
      {/* Cheek fluff */}
      {!isSleeping && (
        <>
          <motion.ellipse fill="#FEFEFE" opacity="0.35"
            animate={{ cx: 32, cy: isLying ? 50 : 37, rx: 5, ry: 4 }}
            transition={{ duration: 0.4 }}
          />
          <motion.ellipse fill="#FEFEFE" opacity="0.35"
            animate={{ cx: 48, cy: isLying ? 50 : 37, rx: 5, ry: 4 }}
            transition={{ duration: 0.4 }}
          />
        </>
      )}

      {/* === EARS (3D with depth) === */}
      {/* Left ear outer */}
      <motion.path
        fill="url(#neko3d-head)" stroke="#C0B6AA" strokeWidth="0.4"
        animate={{
          d: isSleeping || isLying
            ? 'M30,46 Q28,38 34,44'
            : 'M28,26 Q30,10 36,22',
        }}
        transition={{ duration: 0.4 }}
      />
      {/* Left ear inner */}
      <motion.path
        fill="url(#neko3d-ear-inner)" opacity="0.7"
        animate={{
          d: isSleeping || isLying
            ? 'M31,45 Q29,40 33,44'
            : 'M29.5,25 Q31,14 35,22',
        }}
        transition={{ duration: 0.4 }}
      />
      {/* Right ear outer */}
      <motion.path
        fill="url(#neko3d-head)" stroke="#C0B6AA" strokeWidth="0.4"
        animate={{
          d: isSleeping || isLying
            ? 'M46,44 Q48,38 50,46'
            : 'M44,22 Q46,10 52,26',
        }}
        transition={{ duration: 0.4 }}
      />
      {/* Right ear inner */}
      <motion.path
        fill="url(#neko3d-ear-inner)" opacity="0.7"
        animate={{
          d: isSleeping || isLying
            ? 'M47,44 Q48.5,40 49,45'
            : 'M45,22 Q46.5,14 50.5,25',
        }}
        transition={{ duration: 0.4 }}
      />

      {/* === EYES (realistic with depth) === */}
      {isSleeping ? (
        <>
          <motion.path
            d="M34,50 Q36,52 38,50" fill="none"
            stroke="#8B7D72" strokeWidth="0.9" strokeLinecap="round"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 3.5, repeat: Infinity }}
          />
          <motion.path
            d="M42,50 Q44,52 46,50" fill="none"
            stroke="#8B7D72" strokeWidth="0.9" strokeLinecap="round"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 3.5, repeat: Infinity }}
          />
        </>
      ) : isWaking ? (
        <>
          <motion.ellipse cx="36" cy="33" fill="url(#neko3d-iris)"
            animate={{ rx: [0.5, 3], ry: [0.3, 3] }}
            transition={{ duration: 0.9 }}
          />
          <motion.ellipse cx="44" cy="33" fill="url(#neko3d-iris)"
            animate={{ rx: [0.5, 3], ry: [0.3, 3] }}
            transition={{ duration: 0.9 }}
          />
        </>
      ) : isLying || isRolling ? (
        <>
          {/* Relaxed eyes */}
          <ellipse cx="36" cy="47" rx="3.2" ry="2.8" fill="white" />
          <ellipse cx="36" cy="47" rx="2.2" ry="2" fill="url(#neko3d-iris)" />
          <circle cx="35" cy="46.2" r="0.6" fill="white" opacity="0.9" />
          <ellipse cx="44" cy="47" rx="3.2" ry="2.8" fill="white" />
          <ellipse cx="44" cy="47" rx="2.2" ry="2" fill="url(#neko3d-iris)" />
          <circle cx="43" cy="46.2" r="0.6" fill="white" opacity="0.9" />
        </>
      ) : (
        <>
          {/* Left eye */}
          <ellipse cx="36" cy="33" rx="3.5" ry="3.2" fill="white" />
          <ellipse cx="36" cy="33" rx="3.3" ry="3" fill="#F8F8FF" />
          <motion.ellipse
            fill="url(#neko3d-iris)"
            animate={isLooking
              ? { cx: [36, 34, 38, 36], cy: [33, 32, 32, 33], rx: 2.4, ry: 2.4 }
              : isFalling
              ? { cx: 36, cy: 33, rx: [2.4, 3, 2.4], ry: [2.4, 3, 2.4] }
              : { cx: 36, cy: 33, rx: 2.4, ry: 2.4 }
            }
            transition={isLooking
              ? { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 3, repeat: Infinity }
            }
          />
          {/* Pupil */}
          <motion.circle fill="#1A3A4A" r="1.2"
            animate={isLooking
              ? { cx: [36, 34.5, 37.5, 36], cy: [33, 32.5, 32.5, 33] }
              : { cx: 36, cy: 33 }
            }
            transition={isLooking ? { duration: 4.5, repeat: Infinity } : {}}
          />
          {/* Eye shine */}
          <circle cx="37.2" cy="31.8" r="0.9" fill="white" opacity="0.95" />
          <circle cx="35" cy="34" r="0.4" fill="white" opacity="0.5" />

          {/* Right eye */}
          <ellipse cx="44" cy="33" rx="3.5" ry="3.2" fill="white" />
          <ellipse cx="44" cy="33" rx="3.3" ry="3" fill="#F8F8FF" />
          <motion.ellipse
            fill="url(#neko3d-iris)"
            animate={isLooking
              ? { cx: [44, 42, 46, 44], cy: [33, 32, 32, 33], rx: 2.4, ry: 2.4 }
              : isFalling
              ? { cx: 44, cy: 33, rx: [2.4, 3, 2.4], ry: [2.4, 3, 2.4] }
              : { cx: 44, cy: 33, rx: 2.4, ry: 2.4 }
            }
            transition={isLooking
              ? { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 3, repeat: Infinity, delay: 0.15 }
            }
          />
          <motion.circle fill="#1A3A4A" r="1.2"
            animate={isLooking
              ? { cx: [44, 42.5, 45.5, 44], cy: [33, 32.5, 32.5, 33] }
              : { cx: 44, cy: 33 }
            }
            transition={isLooking ? { duration: 4.5, repeat: Infinity } : {}}
          />
          <circle cx="45.2" cy="31.8" r="0.9" fill="white" opacity="0.95" />
          <circle cx="43" cy="34" r="0.4" fill="white" opacity="0.5" />

          {/* Blink overlay */}
          <motion.rect
            x="32" y="29" width="9" height="8" rx="3" fill="url(#neko3d-head)"
            animate={{ scaleY: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '36px 33px' }}
          />
          <motion.rect
            x="40" y="29" width="9" height="8" rx="3" fill="url(#neko3d-head)"
            animate={{ scaleY: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.02 }}
            style={{ transformOrigin: '44px 33px' }}
          />
        </>
      )}

      {/* === NOSE === */}
      {!isSleeping && (
        <motion.path
          fill="url(#neko3d-nose)"
          animate={{
            d: isGrooming
              ? 'M35,38 Q36,37 37,38 Q36,39.5 35,38'
              : isLying
              ? 'M39,50.5 Q40,49.5 41,50.5 Q40,52 39,50.5'
              : 'M39,37.5 Q40,36.5 41,37.5 Q40,39 39,37.5',
          }}
          transition={{ duration: 0.4 }}
        />
      )}

      {/* === MOUTH === */}
      {!isSleeping && !isLying && !isWaking && (
        <motion.path
          fill="none" stroke="#B8A090" strokeWidth="0.5" strokeLinecap="round"
          d="M38,39 Q40,40.5 42,39"
        />
      )}
      {isWaking && (
        <motion.ellipse cx="40" fill="#D8A0A0" opacity="0.4"
          animate={{ cy: 39, rx: [0, 2.5, 0], ry: [0, 2, 0] }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />
      )}

      {/* === WHISKERS (fine, realistic) === */}
      {!isSleeping && !isLying && (
        <g opacity="0.45">
          <motion.line stroke="#B8AEA0" strokeWidth="0.35" strokeLinecap="round"
            animate={{ x1: 22, y1: 35, x2: 33, y2: 37 }}
          />
          <motion.line stroke="#B8AEA0" strokeWidth="0.35" strokeLinecap="round"
            animate={{ x1: 20, y1: 38, x2: 33, y2: 38 }}
          />
          <motion.line stroke="#B8AEA0" strokeWidth="0.35" strokeLinecap="round"
            animate={{ x1: 22, y1: 41, x2: 33, y2: 39 }}
          />
          <motion.line stroke="#B8AEA0" strokeWidth="0.35" strokeLinecap="round"
            animate={{ x1: 47, y1: 37, x2: 58, y2: 35 }}
          />
          <motion.line stroke="#B8AEA0" strokeWidth="0.35" strokeLinecap="round"
            animate={{ x1: 47, y1: 38, x2: 60, y2: 38 }}
          />
          <motion.line stroke="#B8AEA0" strokeWidth="0.35" strokeLinecap="round"
            animate={{ x1: 47, y1: 39, x2: 58, y2: 41 }}
          />
        </g>
      )}

      {/* === SLEEP Zzz === */}
      {isSleeping && (
        <>
          <motion.ellipse cx="40" fill="url(#neko3d-body)" opacity="0.25"
            animate={{ cy: [58, 57.5, 58], rx: [17, 17.5, 17], ry: [8.5, 9, 8.5] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.text x="54" fontSize="7" fill="hsl(200, 40%, 65%)" fontFamily="sans-serif" fontWeight="600"
            animate={{ opacity: [0, 0.6, 0], y: [44, 34, 24] }}
            transition={{ duration: 3.5, repeat: Infinity }}>z</motion.text>
          <motion.text x="58" fontSize="5.5" fill="hsl(200, 40%, 65%)" fontFamily="sans-serif" fontWeight="600"
            animate={{ opacity: [0, 0.4, 0], y: [36, 26, 16] }}
            transition={{ duration: 3.5, repeat: Infinity, delay: 1.2 }}>z</motion.text>
          <motion.text x="61" fontSize="4" fill="hsl(200, 40%, 65%)" fontFamily="sans-serif" fontWeight="600"
            animate={{ opacity: [0, 0.3, 0], y: [28, 18, 8] }}
            transition={{ duration: 3.5, repeat: Infinity, delay: 2.4 }}>z</motion.text>
        </>
      )}
    </svg>
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
  const stateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const walkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const thoughtTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  // Thought bubble cycle
  useEffect(() => {
    const showThought = () => {
      const stateNow = stateRef.current;
      if (stateNow === 'sleep' || stateNow === 'jump') return;

      let msg: string;
      // Show schedule reminder if available
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
        style={{ transform: 'translateX(-50%)', opacity: 0.82 }}
      >
        <AnimatePresence>
          {thought && <ThoughtBubble message={thought} />}
        </AnimatePresence>
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
