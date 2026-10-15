import React, { useRef, useEffect, useCallback, useState } from 'react';
import { 
  Target, 
  FlyingArrow, 
  PersistentArrow, 
  Particle, 
  Point, 
  ShotRecord, 
  GameSession, 
  GameSettings,
  Obstacle 
} from '../types/game';
import { 
  calculateTrajectory, 
  checkPersistentArrowCollision, 
  checkObstacleCollision,
  checkTargetCollision, 
  generateNextTargetPosition,
  generateObstaclesForScore,
  updateObstacles,
  pointToSegmentDistance
} from '../game/physics';
import { renderGameScene } from '../game/canvasRenderer';
import { soundEngine } from '../audio/soundEngine';
import { haptics } from '../utils/haptics';

interface GameCanvasProps {
  settings: GameSettings;
  score: number;
  streak: number;
  misses: number;
  maxMisses: number;
  onScoreUpdate: (score: number, streak: number, precision: boolean) => void;
  onMissUpdate: (misses: number) => void;
  onGameOver: (session: GameSession) => void;
  onFirstShot?: () => void;
  isPaused: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  settings,
  score,
  streak,
  misses,
  maxMisses,
  onScoreUpdate,
  onMissUpdate,
  onGameOver,
  onFirstShot,
  isPaused,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Active game entities in refs for 60fps loop without React re-render lag
  const targetRef = useRef<Target | null>(null);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const flyingArrowRef = useRef<FlyingArrow | null>(null);
  const persistentArrowsRef = useRef<PersistentArrow[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const shotsHistoryRef = useRef<ShotRecord[]>([]);

  // Drag state
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<Point>({ x: 0, y: 0 });
  const dragCurrentRef = useRef<Point>({ x: 0, y: 0 });
  const bowOriginRef = useRef<Point>({ x: 0, y: 0 });

  // Camera shake
  const shakeRef = useRef<{ x: number; y: number; duration: number }>({ x: 0, y: 0, duration: 0 });

  // Cinematic slowdown
  const slowdownUntilRef = useRef<number>(0);

  // Session metadata
  const sessionStartRef = useRef<number>(performance.now());
  const precisionCountRef = useRef<number>(0);
  const totalShotsRef = useRef<number>(0);

  // Micro-feedback badge ("PRECISO")
  const [precisionToast, setPrecisionToast] = useState<{ id: number; text: string; x: number; y: number } | null>(null);

  // Dynamic canvas sizing
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 390, height: 750 });

  /**
   * Resize handling with high pixel ratio
   */
  const handleResize = useCallback(() => {
    if (!containerRef.current || !canvasRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5); // Cap to 2.5 for mobile battery efficiency

    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);

    canvasRef.current.width = w * dpr;
    canvasRef.current.height = h * dpr;
    canvasRef.current.style.width = `${w}px`;
    canvasRef.current.style.height = `${h}px`;

    setDimensions({ width: w, height: h });

    // Position bow in the lower ergonomic thumb zone
    bowOriginRef.current = { x: w / 2, y: h * 0.82 };

    // Initialize or adapt target
    if (!targetRef.current) {
      targetRef.current = generateNextTargetPosition(w, h, 0, persistentArrowsRef.current);
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [handleResize]);

  // Dynamically generate/adapt obstacles as score advances (strictly smaller than target)
  useEffect(() => {
    obstaclesRef.current = generateObstaclesForScore(
      score,
      dimensions.width,
      dimensions.height,
      targetRef.current
    );
  }, [score, dimensions.width, dimensions.height]);

  // Audio configuration sync
  useEffect(() => {
    soundEngine.configure(settings.soundEnabled, settings.sfxVolume, settings.chorusEnabled);
    haptics.setEnabled(settings.hapticsEnabled);
  }, [settings]);

  /**
   * Helper: add visual particles
   */
  const addHitParticles = useCallback((x: number, y: number, isPrecision: boolean) => {
    const particles: Particle[] = [];
    const count = isPrecision ? 12 : 7;

    // Radial line ticks
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const speed = isPrecision ? 90 + Math.random() * 80 : 60 + Math.random() * 60;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: isPrecision ? 2.5 : 2.0,
        alpha: 1.0,
        color: isPrecision ? '#E9A23B' : '#D94336',
        life: 0,
        maxLife: isPrecision ? 0.4 : 0.3,
        type: 'line',
        length: isPrecision ? 10 : 7,
        angle,
      });
    }

    // Precision wave expansion ring
    if (isPrecision) {
      particles.push({
        x,
        y,
        vx: 0,
        vy: 0,
        radius: 6,
        alpha: 0.9,
        color: '#E9A23B',
        life: 0,
        maxLife: 0.35,
        type: 'ring',
      });
    }

    particlesRef.current.push(...particles);
  }, []);

  const addCollisionParticles = useCallback((x: number, y: number) => {
    const particles: Particle[] = [];
    // Dry wooden splinters
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 70;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1.8,
        alpha: 0.9,
        color: '#222321',
        life: 0,
        maxLife: 0.28,
        type: 'clack',
        length: 6,
        angle,
      });
    }
    particlesRef.current.push(...particles);
  }, []);

  /**
   * Pointer & Touch Interactions
   */
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isPaused || flyingArrowRef.current) return;

    // Unlock Web Audio context on user gesture
    soundEngine.unlock();

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.x;
    const y = e.clientY - rect.y;

    isDraggingRef.current = true;
    dragStartRef.current = { x, y };
    dragCurrentRef.current = { x, y };

    // Capture pointer to track outside bounds smoothly
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    haptics.trigger('tap');
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragCurrentRef.current = {
      x: e.clientX - rect.x,
      y: e.clientY - rect.y,
    };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer already lost
    }

    const dx = dragCurrentRef.current.x - dragStartRef.current.x;
    const dy = dragCurrentRef.current.y - dragStartRef.current.y;
    const dist = Math.hypot(dx, dy);

    // Minimum drag threshold to prevent accidental release
    if (dist < 18) {
      return;
    }

    // Call first shot onboarding dismissal if needed
    if (onFirstShot) {
      onFirstShot();
    }

    // Standard archery slingshot mechanic:
    // Dragging down pulls the arrow backwards; upon release it flies forward!
    const pullAngle = Math.atan2(dy, dx);
    const releaseAngle = pullAngle + Math.PI; // Opposite direction

    // Power scaling: capped for balanced physics
    const power = Math.min(Math.max(dist * 6.8, 380), 880);
    const vx = Math.cos(releaseAngle) * power;
    const vy = Math.sin(releaseAngle) * power;

    const bow = bowOriginRef.current;
    const arrowLength = 40;

    flyingArrowRef.current = {
      x: bow.x,
      y: bow.y,
      vx,
      vy,
      length: arrowLength,
      angle: releaseAngle,
      trail: [{ x: bow.x, y: bow.y }],
      bornAt: performance.now(),
      sourceX: bow.x,
      sourceY: bow.y,
    };

    totalShotsRef.current += 1;

    soundEngine.playRelease();
    haptics.trigger('release');
  };

  /**
   * End session and trigger Game Over flow
   */
  const triggerSessionEnd = useCallback(() => {
    const session: GameSession = {
      id: `session_${Date.now()}`,
      score,
      streak,
      maxStreak: streak,
      precisionHits: precisionCountRef.current,
      totalShots: totalShotsRef.current,
      misses: misses + 1,
      maxMisses,
      startedAt: sessionStartRef.current,
      endedAt: performance.now(),
      shots: [...shotsHistoryRef.current],
      persistentArrows: [...persistentArrowsRef.current],
      finalFieldDensity: persistentArrowsRef.current.length,
    };

    onGameOver(session);
  }, [score, streak, misses, maxMisses, onGameOver]);

  /**
   * Main 60FPS Game Loop
   */
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      let dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Clamp dt to avoid physics exploding during tab switch
      if (dt > 0.1) dt = 0.1;

      // Handle cinematic slowdown during precision hits
      if (currentTime < slowdownUntilRef.current) {
        dt *= 0.25;
      }

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (!canvas || !ctx || isPaused) {
        animationFrameId = requestAnimationFrame(loop);
        return;
      }

      const { width, height } = dimensions;
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

      // 1. Update Camera Shake
      let shakeOffset = { x: 0, y: 0 };
      if (shakeRef.current.duration > 0) {
        shakeRef.current.duration -= dt;
        const mag = Math.min(shakeRef.current.duration * 25, 4);
        shakeOffset = {
          x: (Math.random() - 0.5) * mag,
          y: (Math.random() - 0.5) * mag,
        };
      }

      // 2. Aim vector calculation
      let aimVector: { x: number; y: number } | null = null;
      let trajectoryPoints: Point[] = [];
      let highlightNearMiss: Point | null = null;

      if (isDraggingRef.current && !flyingArrowRef.current) {
        const dx = dragCurrentRef.current.x - dragStartRef.current.x;
        const dy = dragCurrentRef.current.y - dragStartRef.current.y;
        const dist = Math.hypot(dx, dy);

        if (dist >= 12) {
          const pullAngle = Math.atan2(dy, dx);
          const releaseAngle = pullAngle + Math.PI;
          const power = Math.min(Math.max(dist * 6.8, 380), 880);
          const vel = {
            x: Math.cos(releaseAngle) * power,
            y: Math.sin(releaseAngle) * power,
          };

          aimVector = {
            x: Math.cos(releaseAngle) * Math.min(dist, 100),
            y: Math.sin(releaseAngle) * Math.min(dist, 100),
          };

          // Trajectory prediction
          trajectoryPoints = calculateTrajectory(bowOriginRef.current, vel, 28, 0.04);

          // Check for proximity with persistent arrows (tactile tension feedback)
          for (const pt of trajectoryPoints) {
            for (const pa of persistentArrowsRef.current) {
              const { dist: d } = pointToSegmentDistance(pt.x, pt.y, pa.startX, pa.startY, pa.tipX, pa.tipY);
              if (d < 10) {
                highlightNearMiss = { x: pt.x, y: pt.y };
                break;
              }
            }
            if (highlightNearMiss) break;
          }

          // Check for proximity with dynamic obstacles
          if (!highlightNearMiss) {
            for (const pt of trajectoryPoints) {
              for (const obs of obstaclesRef.current) {
                const d = Math.hypot(pt.x - obs.x, pt.y - obs.y);
                if (d < obs.radius + 8) {
                  highlightNearMiss = { x: pt.x, y: pt.y };
                  break;
                }
              }
              if (highlightNearMiss) break;
            }
          }
        }
      }

      // 3. Update Dynamic Obstacles Physics
      updateObstacles(obstaclesRef.current, dt);

      // 4. Update Flying Arrow Physics
      const arrow = flyingArrowRef.current;
      if (arrow) {
        const prevX = arrow.x;
        const prevY = arrow.y;

        // Gravity & Velocity
        arrow.x += arrow.vx * dt;
        arrow.y += arrow.vy * dt;
        arrow.vy += 80 * dt; // slight ballistic curve
        arrow.angle = Math.atan2(arrow.vy, arrow.vx);

        arrow.trail.push({ x: arrow.x, y: arrow.y });
        if (arrow.trail.length > 8) arrow.trail.shift();

        let arrowSettled = false;

        // A. Collision with Target
        if (targetRef.current) {
          const col = checkTargetCollision(arrow, targetRef.current);
          if (col.hit) {
            arrowSettled = true;

            // Audio & Haptics
            if (col.precision) {
              soundEngine.playPrecisionHit();
              haptics.trigger('precision');
              slowdownUntilRef.current = currentTime + 80; // 80ms micro-pause
              setPrecisionToast({
                id: Date.now(),
                text: 'PRECISO',
                x: targetRef.current.x,
                y: targetRef.current.y - 36,
              });
              precisionCountRef.current += 1;
            } else {
              soundEngine.playHit();
              haptics.trigger('hit');
            }

            // Visual Particles
            addHitParticles(targetRef.current.x, targetRef.current.y, col.precision);

            // Record shot
            shotsHistoryRef.current.push({
              shotIndex: totalShotsRef.current,
              from: { x: arrow.sourceX, y: arrow.sourceY },
              to: { x: arrow.x, y: arrow.y },
              hit: true,
              precision: col.precision,
              collidedWithArrow: false,
              scoreGained: col.precision ? 2 : 1,
              timestamp: currentTime,
            });

            // Target spawns at fresh, challenging coordinates
            const nextHitCount = (targetRef.current?.hitCount || 0) + 1;
            targetRef.current = generateNextTargetPosition(
              width,
              height,
              nextHitCount,
              persistentArrowsRef.current
            );

            // Score update
            onScoreUpdate(score + (col.precision ? 2 : 1), streak + 1, col.precision);

            // Flying arrow finishes its duty
            flyingArrowRef.current = null;
          }
        }

        // B. Collision with Obstacles (Dynamic smaller physical pins)
        if (!arrowSettled && arrow) {
          const obsCol = checkObstacleCollision(arrow, prevX, prevY, obstaclesRef.current);
          if (obsCol.collided && obsCol.contactPoint) {
            arrowSettled = true;

            soundEngine.playCollision();
            haptics.trigger('collision');
            shakeRef.current = { x: 0, y: 0, duration: 0.16 };
            addCollisionParticles(obsCol.contactPoint.x, obsCol.contactPoint.y);

            const newPersistent: PersistentArrow = {
              id: `arr_obs_${Date.now()}_${Math.random()}`,
              startX: obsCol.contactPoint.x - Math.cos(arrow.angle) * arrow.length,
              startY: obsCol.contactPoint.y - Math.sin(arrow.angle) * arrow.length,
              tipX: obsCol.contactPoint.x,
              tipY: obsCol.contactPoint.y,
              length: arrow.length,
              angle: arrow.angle,
              settledAt: currentTime,
              wobbleAmount: 0.14,
              wobbleSpeed: 30,
              isHitTarget: false,
            };

            persistentArrowsRef.current.push(newPersistent);
            soundEngine.updateMemoryChorus(persistentArrowsRef.current.length);

            shotsHistoryRef.current.push({
              shotIndex: totalShotsRef.current,
              from: { x: arrow.sourceX, y: arrow.sourceY },
              to: { x: obsCol.contactPoint.x, y: obsCol.contactPoint.y },
              hit: false,
              precision: false,
              collidedWithArrow: true,
              scoreGained: 0,
              timestamp: currentTime,
            });

            flyingArrowRef.current = null;

            const newMisses = misses + 1;
            onMissUpdate(newMisses);

            if (!settings.zenMode && newMisses >= maxMisses) {
              setTimeout(() => {
                triggerSessionEnd();
              }, 450);
            }
          }
        }

        // C. Collision with Persistent Arrow Shaft ("Passado persistente")
        if (!arrowSettled && arrow) {
          const arrowCol = checkPersistentArrowCollision(
            arrow,
            prevX,
            prevY,
            persistentArrowsRef.current
          );

          if (arrowCol.collided && arrowCol.contactPoint) {
            arrowSettled = true;

            // Audio, Haptics & Screen Shake
            soundEngine.playCollision();
            haptics.trigger('collision');
            shakeRef.current = { x: 0, y: 0, duration: 0.14 };

            // Collision particles
            addCollisionParticles(arrowCol.contactPoint.x, arrowCol.contactPoint.y);

            // The flying arrow stops, vibrates, and embeds permanently into the field!
            const newPersistent: PersistentArrow = {
              id: `arr_${Date.now()}_${Math.random()}`,
              startX: arrowCol.contactPoint.x - Math.cos(arrow.angle) * arrow.length,
              startY: arrowCol.contactPoint.y - Math.sin(arrow.angle) * arrow.length,
              tipX: arrowCol.contactPoint.x,
              tipY: arrowCol.contactPoint.y,
              length: arrow.length,
              angle: arrow.angle,
              settledAt: currentTime,
              wobbleAmount: 0.12,
              wobbleSpeed: 28,
              isHitTarget: false,
            };

            persistentArrowsRef.current.push(newPersistent);
            soundEngine.updateMemoryChorus(persistentArrowsRef.current.length);

            shotsHistoryRef.current.push({
              shotIndex: totalShotsRef.current,
              from: { x: arrow.sourceX, y: arrow.sourceY },
              to: { x: arrowCol.contactPoint.x, y: arrowCol.contactPoint.y },
              hit: false,
              precision: false,
              collidedWithArrow: true,
              scoreGained: 0,
              timestamp: currentTime,
            });

            flyingArrowRef.current = null;

            // Increment miss count & reset streak
            const newMisses = misses + 1;
            onMissUpdate(newMisses);

            if (!settings.zenMode && newMisses >= maxMisses) {
              setTimeout(() => {
                triggerSessionEnd();
              }, 450);
            }
          }
        }

        // D. Collision with Field Boundary / Walls (Missed past the target)
        if (!arrowSettled && arrow) {
          const margin = 14;
          const isOutOfBounds = 
            arrow.x < margin || 
            arrow.x > width - margin || 
            arrow.y < margin || 
            arrow.y > height - margin;

          if (isOutOfBounds) {
            arrowSettled = true;

            // Clamp into margin border
            const clampedX = Math.max(margin, Math.min(width - margin, arrow.x));
            const clampedY = Math.max(margin, Math.min(height - margin, arrow.y));

            soundEngine.playWallEmbed();
            haptics.trigger('hit');

            const newPersistent: PersistentArrow = {
              id: `arr_wall_${Date.now()}_${Math.random()}`,
              startX: clampedX - Math.cos(arrow.angle) * arrow.length,
              startY: clampedY - Math.sin(arrow.angle) * arrow.length,
              tipX: clampedX,
              tipY: clampedY,
              length: arrow.length,
              angle: arrow.angle,
              settledAt: currentTime,
              wobbleAmount: 0.08,
              wobbleSpeed: 22,
              isHitTarget: false,
            };

            persistentArrowsRef.current.push(newPersistent);
            soundEngine.updateMemoryChorus(persistentArrowsRef.current.length);

            shotsHistoryRef.current.push({
              shotIndex: totalShotsRef.current,
              from: { x: arrow.sourceX, y: arrow.sourceY },
              to: { x: clampedX, y: clampedY },
              hit: false,
              precision: false,
              collidedWithArrow: false,
              scoreGained: 0,
              timestamp: currentTime,
            });

            flyingArrowRef.current = null;

            const newMisses = misses + 1;
            onMissUpdate(newMisses);

            if (!settings.zenMode && newMisses >= maxMisses) {
              setTimeout(() => {
                triggerSessionEnd();
              }, 450);
            }
          }
        }
      }

      // 4. Update Particle Physics
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.type === 'ring') {
          p.radius += 80 * dt;
        }
        p.alpha = 1 - (p.life / p.maxLife);

        if (p.life >= p.maxLife) {
          particlesRef.current.splice(i, 1);
        }
      }

      // 5. Render Scene onto Canvas
      ctx.save();
      ctx.scale(dpr, dpr);

      renderGameScene({
        ctx,
        width,
        height,
        pixelRatio: dpr,
        target: targetRef.current,
        obstacles: obstaclesRef.current,
        flyingArrow: flyingArrowRef.current,
        persistentArrows: persistentArrowsRef.current,
        particles: particlesRef.current,
        bowOrigin: bowOriginRef.current,
        aimVector,
        trajectoryPoints,
        shakeOffset,
        highlightNearMiss,
      });

      ctx.restore();

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [
    dimensions,
    isPaused,
    score,
    streak,
    misses,
    maxMisses,
    settings.zenMode,
    onScoreUpdate,
    onMissUpdate,
    triggerSessionEnd,
    addHitParticles,
    addCollisionParticles,
  ]);

  // Clean precision toast after 700ms
  useEffect(() => {
    if (!precisionToast) return;
    const t = setTimeout(() => {
      setPrecisionToast(null);
    }, 700);
    return () => clearTimeout(t);
  }, [precisionToast]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none touch-none overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="block w-full h-full touch-none cursor-crosshair"
      />

      {/* Ephemeral precision hit toast */}
      {precisionToast && (
        <div
          className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 animate-bounce text-[#E9A23B] font-display font-bold text-xs tracking-widest uppercase transition-opacity"
          style={{ left: precisionToast.x, top: precisionToast.y }}
        >
          {precisionToast.text}
        </div>
      )}
    </div>
  );
};
