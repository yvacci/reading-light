import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

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

/* ─── 3D Cat Materials ─── */
const furColor = new THREE.Color('#F5EDE4');
const furDarkColor = new THREE.Color('#E0D5C8');
const pinkColor = new THREE.Color('#E8A0A0');
const noseColor = new THREE.Color('#D08888');
const eyeWhite = new THREE.Color('#FFFFFF');
const irisColor = new THREE.Color('#4A9CC8');
const pupilColor = new THREE.Color('#1A2A35');

/* ─── 3D Animated Cat Component ─── */
function Cat3D({ state, facingRight }: { state: NekoState; facingRight: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  const tailSeg1 = useRef<THREE.Group>(null);
  const tailSeg2 = useRef<THREE.Group>(null);
  const tailSeg3 = useRef<THREE.Group>(null);
  const frontLeftLeg = useRef<THREE.Group>(null);
  const frontRightLeg = useRef<THREE.Group>(null);
  const backLeftLeg = useRef<THREE.Group>(null);
  const backRightLeg = useRef<THREE.Group>(null);
  const leftEyelid = useRef<THREE.Mesh>(null);
  const rightEyelid = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const leftEye = useRef<THREE.Group>(null);
  const rightEye = useRef<THREE.Group>(null);

  const isWalking = state === 'walk-left' || state === 'walk-right';
  const isSleeping = state === 'sleep';
  const isLying = state === 'idle-liedown' || state === 'idle-roll';
  const isPlaying = state === 'idle-play';
  const isStretching = state === 'idle-stretch';
  const isGrooming = state === 'idle-groom';
  const isLooking = state === 'idle-look';

  // Blink timer
  const blinkRef = useRef(0);
  const nextBlink = useRef(3 + Math.random() * 4);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const t = performance.now() * 0.001;

    // Flip direction
    groupRef.current.scale.x = facingRight ? 1 : -1;

    // ── Body breathing ──
    if (bodyRef.current) {
      const breathScale = isSleeping ? 0.03 : 0.015;
      const breathSpeed = isSleeping ? 1.2 : 2;
      bodyRef.current.scale.y = 1 + Math.sin(t * breathSpeed) * breathScale;
      bodyRef.current.scale.x = 1 - Math.sin(t * breathSpeed) * breathScale * 0.5;
    }

    // ── Body position for lying/sleeping ──
    if (isLying || isSleeping) {
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -0.3, delta * 3);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, -0.15, delta * 3);
    } else if (isStretching) {
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -0.15, delta * 3);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, -0.05, delta * 3);
    } else {
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, delta * 4);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, delta * 4);
    }

    // ── Walking leg animation ──
    const walkSpeed = 8;
    const walkAmp = 0.4;
    if (frontLeftLeg.current) {
      frontLeftLeg.current.rotation.x = isWalking ? Math.sin(t * walkSpeed) * walkAmp : 0;
    }
    if (frontRightLeg.current) {
      frontRightLeg.current.rotation.x = isWalking ? Math.sin(t * walkSpeed + Math.PI) * walkAmp : 0;
    }
    if (backLeftLeg.current) {
      backLeftLeg.current.rotation.x = isWalking ? Math.sin(t * walkSpeed + Math.PI) * walkAmp * 0.8 : 0;
    }
    if (backRightLeg.current) {
      backRightLeg.current.rotation.x = isWalking ? Math.sin(t * walkSpeed) * walkAmp * 0.8 : 0;
    }

    // ── Walking body bob ──
    if (isWalking && groupRef.current) {
      groupRef.current.position.y = Math.abs(Math.sin(t * walkSpeed * 2)) * 0.02;
    }

    // ── Head animation ──
    if (headRef.current) {
      if (isLooking) {
        headRef.current.rotation.y = Math.sin(t * 0.5) * 0.5;
        headRef.current.rotation.z = Math.sin(t * 0.7) * 0.1;
      } else if (isGrooming) {
        headRef.current.rotation.x = Math.sin(t * 2) * 0.2 + 0.3;
        headRef.current.rotation.y = -0.2;
      } else if (isSleeping) {
        headRef.current.rotation.x = 0.2;
        headRef.current.rotation.y = 0;
      } else if (isPlaying) {
        headRef.current.rotation.y = Math.sin(t * 3) * 0.3;
        headRef.current.rotation.x = Math.sin(t * 2) * -0.15;
      } else {
        headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, Math.sin(t * 0.3) * 0.15, delta * 2);
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, 0, delta * 3);
        headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, 0, delta * 3);
      }
    }

    // ── Tail sway ──
    const tailSpeed = isPlaying ? 4 : isSleeping ? 0.5 : 1.5;
    const tailAmp = isPlaying ? 0.5 : isSleeping ? 0.1 : 0.3;
    if (tailSeg1.current) tailSeg1.current.rotation.z = Math.sin(t * tailSpeed) * tailAmp;
    if (tailSeg2.current) tailSeg2.current.rotation.z = Math.sin(t * tailSpeed + 0.5) * tailAmp * 0.8;
    if (tailSeg3.current) tailSeg3.current.rotation.z = Math.sin(t * tailSpeed + 1) * tailAmp * 0.6;

    // ── Blink animation ──
    blinkRef.current += delta;
    const blinkProgress = blinkRef.current - nextBlink.current;
    let eyelidScale = 0;
    if (isSleeping) {
      eyelidScale = 1;
    } else if (blinkProgress > 0 && blinkProgress < 0.15) {
      eyelidScale = Math.sin((blinkProgress / 0.15) * Math.PI);
    }
    if (blinkProgress > 0.15) {
      blinkRef.current = 0;
      nextBlink.current = 2 + Math.random() * 5;
    }
    if (leftEyelid.current) leftEyelid.current.scale.y = eyelidScale;
    if (rightEyelid.current) rightEyelid.current.scale.y = eyelidScale;

    // ── Eye look direction ──
    if (leftEye.current && rightEye.current) {
      if (isLooking) {
        const lookX = Math.sin(t * 0.5) * 0.03;
        const lookY = Math.cos(t * 0.7) * 0.02;
        leftEye.current.position.x = -0.15 + lookX;
        leftEye.current.position.y = 0.05 + lookY;
        rightEye.current.position.x = 0.15 + lookX;
        rightEye.current.position.y = 0.05 + lookY;
      }
    }

    // ── Playing paw raise ──
    if (isPlaying && frontRightLeg.current) {
      frontRightLeg.current.rotation.x = Math.sin(t * 3) * 0.6 - 0.3;
      frontRightLeg.current.rotation.z = Math.sin(t * 4) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh ref={bodyRef} position={[0, 0, 0]}>
        <sphereGeometry args={[0.35, 24, 16]} />
        <meshStandardMaterial color={furColor} roughness={0.9} />
      </mesh>
      {/* Body back half */}
      <mesh position={[-0.15, -0.02, 0]}>
        <sphereGeometry args={[0.32, 24, 16]} />
        <meshStandardMaterial color={furColor} roughness={0.9} />
      </mesh>
      {/* Chest highlight */}
      <mesh position={[0.15, 0.05, 0.1]}>
        <sphereGeometry args={[0.18, 16, 12]} />
        <meshStandardMaterial color="#FEFEFE" roughness={0.85} transparent opacity={0.6} />
      </mesh>

      {/* Head */}
      <group ref={headRef} position={[0.35, 0.2, 0]}>
        <mesh>
          <sphereGeometry args={[0.25, 24, 20]} />
          <meshStandardMaterial color={furColor} roughness={0.85} />
        </mesh>
        {/* Cheeks */}
        <mesh position={[0.05, -0.05, 0.15]}>
          <sphereGeometry args={[0.12, 12, 8]} />
          <meshStandardMaterial color="#FEFEFE" roughness={0.9} transparent opacity={0.5} />
        </mesh>
        <mesh position={[0.05, -0.05, -0.15]}>
          <sphereGeometry args={[0.12, 12, 8]} />
          <meshStandardMaterial color="#FEFEFE" roughness={0.9} transparent opacity={0.5} />
        </mesh>

        {/* Left ear */}
        <group position={[0.05, 0.22, 0.12]} rotation={[0, 0, 0.2]}>
          <mesh>
            <coneGeometry args={[0.07, 0.18, 8]} />
            <meshStandardMaterial color={furColor} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.01, 0.01]} scale={[0.6, 0.7, 0.6]}>
            <coneGeometry args={[0.07, 0.18, 8]} />
            <meshStandardMaterial color={pinkColor} roughness={0.7} />
          </mesh>
        </group>
        {/* Right ear */}
        <group position={[0.05, 0.22, -0.12]} rotation={[0, 0, 0.2]}>
          <mesh>
            <coneGeometry args={[0.07, 0.18, 8]} />
            <meshStandardMaterial color={furColor} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.01, -0.01]} scale={[0.6, 0.7, 0.6]}>
            <coneGeometry args={[0.07, 0.18, 8]} />
            <meshStandardMaterial color={pinkColor} roughness={0.7} />
          </mesh>
        </group>

        {/* Eyes */}
        <group ref={leftEye} position={[0.18, 0.05, 0.1]}>
          {/* Eye white */}
          <mesh>
            <sphereGeometry args={[0.055, 16, 12]} />
            <meshStandardMaterial color={eyeWhite} roughness={0.3} />
          </mesh>
          {/* Iris */}
          <mesh position={[0.02, 0, 0]}>
            <sphereGeometry args={[0.038, 14, 10]} />
            <meshStandardMaterial color={irisColor} roughness={0.2} metalness={0.1} />
          </mesh>
          {/* Pupil */}
          <mesh position={[0.04, 0, 0]}>
            <sphereGeometry args={[0.02, 10, 8]} />
            <meshStandardMaterial color={pupilColor} roughness={0.1} />
          </mesh>
          {/* Eye shine */}
          <mesh position={[0.045, 0.015, 0.015]}>
            <sphereGeometry args={[0.008, 8, 6]} />
            <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.5} />
          </mesh>
          {/* Eyelid */}
          <mesh ref={leftEyelid} position={[0.02, 0.04, 0]} scale={[1, 0, 1]}>
            <sphereGeometry args={[0.058, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={furColor} roughness={0.9} side={THREE.DoubleSide} />
          </mesh>
        </group>

        <group ref={rightEye} position={[0.18, 0.05, -0.1]}>
          <mesh>
            <sphereGeometry args={[0.055, 16, 12]} />
            <meshStandardMaterial color={eyeWhite} roughness={0.3} />
          </mesh>
          <mesh position={[0.02, 0, 0]}>
            <sphereGeometry args={[0.038, 14, 10]} />
            <meshStandardMaterial color={irisColor} roughness={0.2} metalness={0.1} />
          </mesh>
          <mesh position={[0.04, 0, 0]}>
            <sphereGeometry args={[0.02, 10, 8]} />
            <meshStandardMaterial color={pupilColor} roughness={0.1} />
          </mesh>
          <mesh position={[0.045, 0.015, -0.015]}>
            <sphereGeometry args={[0.008, 8, 6]} />
            <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.5} />
          </mesh>
          <mesh ref={rightEyelid} position={[0.02, 0.04, 0]} scale={[1, 0, 1]}>
            <sphereGeometry args={[0.058, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={furColor} roughness={0.9} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* Nose */}
        <mesh position={[0.23, -0.02, 0]}>
          <sphereGeometry args={[0.025, 10, 8]} />
          <meshStandardMaterial color={noseColor} roughness={0.5} />
        </mesh>

        {/* Mouth lines */}
        {/* Whiskers - thin cylinders */}
        {[0.08, 0, -0.08].map((yOff, i) => (
          <group key={`whisker-l-${i}`}>
            <mesh position={[0.2, -0.04 + yOff * 0.3, 0.12]} rotation={[0, 0.3 + yOff * 0.3, yOff * 0.2]}>
              <cylinderGeometry args={[0.002, 0.001, 0.15, 4]} />
              <meshStandardMaterial color="#C8BEB2" roughness={0.5} transparent opacity={0.4} />
            </mesh>
            <mesh position={[0.2, -0.04 + yOff * 0.3, -0.12]} rotation={[0, -0.3 - yOff * 0.3, yOff * 0.2]}>
              <cylinderGeometry args={[0.002, 0.001, 0.15, 4]} />
              <meshStandardMaterial color="#C8BEB2" roughness={0.5} transparent opacity={0.4} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Front left leg */}
      <group ref={frontLeftLeg} position={[0.15, -0.25, 0.13]}>
        <mesh position={[0, -0.1, 0]}>
          <capsuleGeometry args={[0.04, 0.15, 8, 8]} />
          <meshStandardMaterial color={furColor} roughness={0.9} />
        </mesh>
        {/* Paw */}
        <mesh position={[0.01, -0.2, 0]}>
          <sphereGeometry args={[0.045, 10, 8]} />
          <meshStandardMaterial color={furDarkColor} roughness={0.85} />
        </mesh>
        {/* Paw pad */}
        <mesh position={[0.01, -0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.025, 8]} />
          <meshStandardMaterial color={pinkColor} roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Front right leg */}
      <group ref={frontRightLeg} position={[0.15, -0.25, -0.13]}>
        <mesh position={[0, -0.1, 0]}>
          <capsuleGeometry args={[0.04, 0.15, 8, 8]} />
          <meshStandardMaterial color={furColor} roughness={0.9} />
        </mesh>
        <mesh position={[0.01, -0.2, 0]}>
          <sphereGeometry args={[0.045, 10, 8]} />
          <meshStandardMaterial color={furDarkColor} roughness={0.85} />
        </mesh>
        <mesh position={[0.01, -0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.025, 8]} />
          <meshStandardMaterial color={pinkColor} roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Back left leg */}
      <group ref={backLeftLeg} position={[-0.2, -0.22, 0.14]}>
        <mesh position={[0, -0.1, 0]}>
          <capsuleGeometry args={[0.05, 0.12, 8, 8]} />
          <meshStandardMaterial color={furColor} roughness={0.9} />
        </mesh>
        <mesh position={[0.02, -0.19, 0]}>
          <sphereGeometry args={[0.05, 10, 8]} />
          <meshStandardMaterial color={furDarkColor} roughness={0.85} />
        </mesh>
      </group>

      {/* Back right leg */}
      <group ref={backRightLeg} position={[-0.2, -0.22, -0.14]}>
        <mesh position={[0, -0.1, 0]}>
          <capsuleGeometry args={[0.05, 0.12, 8, 8]} />
          <meshStandardMaterial color={furColor} roughness={0.9} />
        </mesh>
        <mesh position={[0.02, -0.19, 0]}>
          <sphereGeometry args={[0.05, 10, 8]} />
          <meshStandardMaterial color={furDarkColor} roughness={0.85} />
        </mesh>
      </group>

      {/* Tail - 3 articulated segments */}
      <group ref={tailRef} position={[-0.4, 0.1, 0]}>
        <group ref={tailSeg1} rotation={[0, 0, 0.5]}>
          <mesh position={[-0.08, 0.05, 0]}>
            <capsuleGeometry args={[0.035, 0.12, 8, 6]} />
            <meshStandardMaterial color={furColor} roughness={0.9} />
          </mesh>
          <group ref={tailSeg2} position={[-0.12, 0.12, 0]} rotation={[0, 0, 0.3]}>
            <mesh position={[-0.06, 0.04, 0]}>
              <capsuleGeometry args={[0.03, 0.1, 8, 6]} />
              <meshStandardMaterial color={furColor} roughness={0.9} />
            </mesh>
            <group ref={tailSeg3} position={[-0.08, 0.1, 0]} rotation={[0, 0, 0.2]}>
              <mesh position={[-0.04, 0.03, 0]}>
                <capsuleGeometry args={[0.025, 0.08, 8, 6]} />
                <meshStandardMaterial color={furDarkColor} roughness={0.9} />
              </mesh>
              {/* Tail tip fluff */}
              <mesh position={[-0.06, 0.08, 0]}>
                <sphereGeometry args={[0.03, 8, 6]} />
                <meshStandardMaterial color={furColor} roughness={0.95} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

/* ─── Sparkle Particles in 3D ─── */
function Particles3D({ active }: { active: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const particles = useRef<{ pos: THREE.Vector3; vel: THREE.Vector3; life: number; maxLife: number; type: 'sparkle' | 'petal' }[]>([]);
  const spawnTimer = useRef(0);

  useFrame((_, delta) => {
    if (!ref.current) return;
    spawnTimer.current += delta;

    if (active && spawnTimer.current > 0.3 && particles.current.length < 8) {
      spawnTimer.current = 0;
      particles.current.push({
        pos: new THREE.Vector3((Math.random() - 0.5) * 0.8, Math.random() * 0.3, (Math.random() - 0.5) * 0.4),
        vel: new THREE.Vector3((Math.random() - 0.5) * 0.1, 0.15 + Math.random() * 0.1, (Math.random() - 0.5) * 0.05),
        life: 0,
        maxLife: 1.5 + Math.random(),
        type: Math.random() > 0.5 ? 'sparkle' : 'petal',
      });
    }

    // Update particles
    particles.current = particles.current.filter(p => {
      p.life += delta;
      p.pos.add(p.vel.clone().multiplyScalar(delta));
      p.vel.y -= delta * 0.05;
      return p.life < p.maxLife;
    });

    // Update meshes
    const children = ref.current.children;
    for (let i = 0; i < children.length; i++) {
      const p = particles.current[i];
      if (p) {
        children[i].visible = true;
        children[i].position.copy(p.pos);
        const alpha = 1 - p.life / p.maxLife;
        children[i].scale.setScalar(alpha * 0.5);
        children[i].rotation.y += delta * 2;
        children[i].rotation.z += delta;
      } else {
        children[i].visible = false;
      }
    }
  });

  return (
    <group ref={ref}>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} visible={false}>
          <octahedronGeometry args={[0.02, 0]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#FFD700' : '#FFB0C8'}
            emissive={i % 2 === 0 ? '#FFD700' : '#FFB0C8'}
            emissiveIntensity={0.5}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
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
      className="absolute -top-10 left-1/2 -translate-x-1/2 pointer-events-none"
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
    </motion.div>
  );
}

/* ─── 3D Canvas Wrapper ─── */
function CatCanvas({ state, facingRight, showParticles }: { state: NekoState; facingRight: boolean; showParticles: boolean }) {
  return (
    <div className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }}>
      <Canvas
        camera={{ position: [0.3, 0.5, 2.2], fov: 26, near: 0.1, far: 10 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
        style={{ background: 'transparent' }}
        dpr={[1, 1.5]}
        frameloop="always"
      >
        <ambientLight intensity={1.4} />
        <directionalLight position={[3, 5, 3]} intensity={1.6} color="#FFFAF0" />
        <directionalLight position={[-2, 3, -1]} intensity={0.7} color="#E8EEFF" />
        <pointLight position={[1, 0, 1]} intensity={0.5} color="#FFF0E0" />
        <hemisphereLight args={['#FFEEDD', '#DDEEFF', 0.6]} />

        <Suspense fallback={null}>
          <Cat3D state={state} facingRight={facingRight} />
          <Particles3D active={showParticles} />
          {/* Ground shadow */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]}>
            <circleGeometry args={[0.35, 24]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.08} />
          </mesh>
        </Suspense>
      </Canvas>
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
  const stateRef = useRef(state);

  useEffect(() => { stateRef.current = state; }, [state]);

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
          setFacingRight(Math.random() > 0.5);
          setState('idle-sit');
          stateTimerRef.current = setTimeout(cycle, IDLE_MIN_MS + Math.random() * (IDLE_MAX_MS - IDLE_MIN_MS));
        });
      } else {
        const randomIdle = IDLE_STATES[Math.floor(Math.random() * IDLE_STATES.length)];
        setState(randomIdle);
        if (Math.random() > 0.6) setFacingRight(Math.random() > 0.5);
        const duration = randomIdle === 'idle-groom' || randomIdle === 'idle-stretch'
          ? 3000 + Math.random() * 4000
          : IDLE_MIN_MS + Math.random() * (IDLE_MAX_MS - IDLE_MIN_MS);
        stateTimerRef.current = setTimeout(cycle, duration);
      }
    };
    stateTimerRef.current = setTimeout(cycle, IDLE_MIN_MS);
  }, [walkTo]);

  // Particle effect cycle
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
    const showThoughtFn = () => {
      const s = stateRef.current;
      if (s === 'sleep' || s === 'jump') return;
      let msg: string;
      if (reminders.length > 0 && Math.random() < 0.6) {
        const r = reminders[Math.floor(Math.random() * reminders.length)];
        msg = `📅 ${r.type}: ${r.name}${r.time ? ` @ ${r.time}` : ''}`;
      } else {
        msg = GENERIC_THOUGHTS[Math.floor(Math.random() * GENERIC_THOUGHTS.length)];
      }
      setThought(msg);
      setTimeout(() => setThought(null), THOUGHT_DURATION_MS);
      thoughtTimerRef.current = setTimeout(showThoughtFn, THOUGHT_INTERVAL_MS + Math.random() * 20000);
    };
    thoughtTimerRef.current = setTimeout(showThoughtFn, 15000 + Math.random() * 15000);
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
            : state === 'wobble' ? [0, -3, 3, -2, 0]
            : 0,
        }}
        transition={{
          left: { duration: 0.08, ease: 'linear' },
          y: { duration: state === 'fall' ? 0.6 : state === 'wobble' ? 0.5 : 0.45, ease: 'easeOut' },
        }}
        style={{ transform: 'translateX(-50%)' }}
      >
        <AnimatePresence>
          {thought && <ThoughtBubble message={thought} />}
        </AnimatePresence>
        <CatCanvas state={state} facingRight={facingRight} showParticles={showParticles} />
      </motion.div>
    </div>
  );
}
