import { Target, FlyingArrow, PersistentArrow, Particle, Point, Obstacle } from '../types/game';

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  pixelRatio: number;
  target: Target | null;
  obstacles: Obstacle[];
  flyingArrow: FlyingArrow | null;
  persistentArrows: PersistentArrow[];
  particles: Particle[];
  bowOrigin: Point;
  aimVector: { x: number; y: number } | null;
  trajectoryPoints: Point[];
  shakeOffset: { x: number; y: number };
  highlightNearMiss?: Point | null;
}

const COLOR_IVORY = '#F3EBDD';
const COLOR_CHARCOAL = '#222321';
const COLOR_IMPACT_RED = '#D94336';
const COLOR_AMBER = '#E9A23B';
const COLOR_MEMORY_GRAY = '#B7B2A8';
const COLOR_LIGHT_WHITE = '#FFFDF7';

export function renderGameScene(options: RenderContext): void {
  const {
    ctx,
    width,
    height,
    target,
    obstacles,
    flyingArrow,
    persistentArrows,
    particles,
    bowOrigin,
    aimVector,
    trajectoryPoints,
    shakeOffset,
    highlightNearMiss,
  } = options;

  ctx.save();

  // Clear canvas with ivory background
  ctx.fillStyle = COLOR_IVORY;
  ctx.fillRect(0, 0, width, height);

  // Apply camera micro-shake
  ctx.translate(shakeOffset.x, shakeOffset.y);

  // 1. Draw subtle boundary borders (clean editorial hairline)
  drawFieldBounds(ctx, width, height);

  // 2. Draw dynamic gameplay obstacles (smaller than target)
  if (obstacles && obstacles.length > 0) {
    drawObstacles(ctx, obstacles);
  }

  // 3. Draw persistent arrows (the living sculpture of the past)
  drawPersistentArrows(ctx, persistentArrows);

  // 4. Draw active target
  if (target) {
    drawTarget(ctx, target);
  }

  // 5. Draw trajectory & bow if aiming
  if (aimVector && trajectoryPoints.length > 0) {
    drawAimingTrajectory(ctx, trajectoryPoints, highlightNearMiss);
    drawBowAndArrow(ctx, bowOrigin, aimVector);
  } else if (!flyingArrow) {
    // Idle bow at rest
    drawRestingBow(ctx, bowOrigin);
  }

  // 6. Draw flying arrow
  if (flyingArrow) {
    drawFlyingArrow(ctx, flyingArrow);
  }

  // 7. Draw particles
  drawParticles(ctx, particles);

  ctx.restore();
}

/**
 * Editorial hairline border with subtle inner margin
 */
function drawFieldBounds(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const pad = 12;
  ctx.save();
  ctx.strokeStyle = 'rgba(34, 35, 33, 0.08)';
  ctx.lineWidth = 1;
  ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

  // Corner tick marks
  const tick = 8;
  ctx.strokeStyle = 'rgba(34, 35, 33, 0.18)';
  ctx.beginPath();
  // Top-left
  ctx.moveTo(pad, pad + tick);
  ctx.lineTo(pad, pad);
  ctx.lineTo(pad + tick, pad);
  // Top-right
  ctx.moveTo(width - pad - tick, pad);
  ctx.lineTo(width - pad, pad);
  ctx.lineTo(width - pad, pad + tick);
  // Bottom-left
  ctx.moveTo(pad, height - pad - tick);
  ctx.lineTo(pad, height - pad);
  ctx.lineTo(pad + tick, height - pad);
  // Bottom-right
  ctx.moveTo(width - pad - tick, height - pad);
  ctx.lineTo(width - pad, height - pad);
  ctx.lineTo(width - pad, height - pad - tick);
  ctx.stroke();

  ctx.restore();
}

/**
 * Render dynamic obstacles that appear as gameplay progresses.
 * STRICTLY smaller than the target (radius 9-11px vs target's 24-28px).
 */
function drawObstacles(ctx: CanvasRenderingContext2D, obstacles: Obstacle[]): void {
  for (const obs of obstacles) {
    ctx.save();
    ctx.translate(obs.x, obs.y);

    const r = obs.radius;

    if (obs.shape === 'diamond') {
      // Rotating geometric diamond pin
      ctx.rotate(obs.phase * 0.4);

      // Outer diamond
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(r, 0);
      ctx.lineTo(0, r);
      ctx.lineTo(-r, 0);
      ctx.closePath();
      ctx.fillStyle = COLOR_CHARCOAL;
      ctx.fill();
      ctx.strokeStyle = COLOR_LIGHT_WHITE;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Inner diamond
      const ir = r * 0.45;
      ctx.beginPath();
      ctx.moveTo(0, -ir);
      ctx.lineTo(ir, 0);
      ctx.lineTo(0, ir);
      ctx.lineTo(-ir, 0);
      ctx.closePath();
      ctx.fillStyle = COLOR_IVORY;
      ctx.fill();

      // Core micro-pin
      ctx.fillStyle = COLOR_AMBER;
      ctx.beginPath();
      ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Minimalist circular pillar pin
      // Outer subtle physical collision field
      ctx.beginPath();
      ctx.arc(0, 0, r + 2.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(34, 35, 33, 0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Main circular body
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = COLOR_CHARCOAL;
      ctx.fill();
      ctx.strokeStyle = COLOR_LIGHT_WHITE;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Middle ring
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.52, 0, Math.PI * 2);
      ctx.fillStyle = COLOR_LIGHT_WHITE;
      ctx.fill();

      // Center core
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = COLOR_CHARCOAL;
      ctx.fill();
    }

    ctx.restore();
  }
}

/**
 * Render the target with concentric editorial rings
 */
function drawTarget(ctx: CanvasRenderingContext2D, target: Target): void {
  ctx.save();
  ctx.translate(target.x, target.y);

  const r = target.radius;

  // Outer subtle impact zone
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(217, 67, 54, 0.08)';
  ctx.fill();
  ctx.strokeStyle = COLOR_IMPACT_RED;
  ctx.lineWidth = 2.2;
  ctx.stroke();

  // Middle ring (Ivory separation)
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2);
  ctx.fillStyle = COLOR_LIGHT_WHITE;
  ctx.fill();
  ctx.strokeStyle = 'rgba(217, 67, 54, 0.35)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Bullseye center (Precision spot)
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.32, 0, Math.PI * 2);
  ctx.fillStyle = COLOR_IMPACT_RED;
  ctx.fill();

  // Subtle center pin
  ctx.beginPath();
  ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
  ctx.fillStyle = COLOR_LIGHT_WHITE;
  ctx.fill();

  ctx.restore();
}

/**
 * Exquisite High-Craft Arrow Renderer
 * Renders an authentic broadhead razor arrow with:
 * - Tapered wooden shaft & cylindrical volume highlight
 * - Thread/sinew bindings at ferrule and fletching ends
 * - Parabolic feathered vanes with micro-barb cuts
 * - Carved string nock
 * - Faceted broadhead razor blade with center ridge
 */
export function drawDetailedArrow(
  ctx: CanvasRenderingContext2D,
  length: number,
  options: {
    strokeColor: string;
    alpha?: number;
    isFlying?: boolean;
    isHitTarget?: boolean;
    isRecent?: boolean;
  }
): void {
  const { strokeColor, alpha = 1.0, isFlying = false, isHitTarget = false, isRecent = true } = options;

  ctx.save();
  ctx.globalAlpha = alpha;

  const arrowLen = length || 40;

  // 1. Aerodynamic in-flight stream whiskers (only when flying)
  if (isFlying) {
    ctx.strokeStyle = 'rgba(34, 35, 33, 0.22)';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(-6, -4);
    ctx.lineTo(-18, -4);
    ctx.moveTo(-6, 4);
    ctx.lineTo(-18, 4);
    ctx.stroke();
  }

  // 2. Carved string nock at tail (x = 0 to 4)
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(0, -1.8);
  ctx.lineTo(4, -1.8);
  ctx.moveTo(0, 1.8);
  ctx.lineTo(4, 1.8);
  ctx.stroke();

  // 3. Wooden Shaft (x = 4 to arrowLen - 11)
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = isRecent ? 2.2 : 1.8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(4, 0);
  ctx.lineTo(arrowLen - 11, 0);
  ctx.stroke();

  // Subtle top highlight line giving the shaft cylindrical volume
  ctx.strokeStyle = isRecent ? 'rgba(255, 253, 247, 0.55)' : 'rgba(255, 253, 247, 0.25)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(6, -0.6);
  ctx.lineTo(arrowLen - 13, -0.6);
  ctx.stroke();

  // 4. Thread Binding Wraps
  ctx.strokeStyle = isRecent ? COLOR_MEMORY_GRAY : strokeColor;
  ctx.lineWidth = 1.2;
  // Near fletching
  ctx.beginPath();
  ctx.moveTo(5, -1.6); ctx.lineTo(5, 1.6);
  ctx.moveTo(19, -1.6); ctx.lineTo(19, 1.6);
  // Near arrowhead ferrule
  ctx.moveTo(arrowLen - 13, -1.8); ctx.lineTo(arrowLen - 13, 1.8);
  ctx.moveTo(arrowLen - 11, -1.8); ctx.lineTo(arrowLen - 11, 1.8);
  ctx.stroke();

  // 5. Parabolic Feather Fletchings (x = 5 to x = 19)
  // Upper feather vane
  ctx.fillStyle = strokeColor;
  ctx.beginPath();
  ctx.moveTo(5, 0);
  ctx.quadraticCurveTo(11, -5.5, 18, -5.2);
  ctx.lineTo(19, -1.2);
  ctx.lineTo(5, 0);
  ctx.closePath();
  ctx.fill();

  // Upper feather micro-rib cuts
  ctx.strokeStyle = COLOR_LIGHT_WHITE;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(10, -1.0); ctx.lineTo(12, -4.0);
  ctx.moveTo(14, -1.0); ctx.lineTo(16, -4.2);
  ctx.stroke();

  // Lower feather vane
  ctx.fillStyle = strokeColor;
  ctx.beginPath();
  ctx.moveTo(5, 0);
  ctx.quadraticCurveTo(11, 5.5, 18, 5.2);
  ctx.lineTo(19, 1.2);
  ctx.lineTo(5, 0);
  ctx.closePath();
  ctx.fill();

  // Lower feather micro-rib cuts
  ctx.strokeStyle = COLOR_LIGHT_WHITE;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(10, 1.0); ctx.lineTo(12, 4.0);
  ctx.moveTo(14, 1.0); ctx.lineTo(16, 4.2);
  ctx.stroke();

  // 6. Broadhead Razor Arrowhead (x = arrowLen - 11 to x = arrowLen)
  const tipX = arrowLen;
  const barbX = arrowLen - 10.5;
  const ferruleX = arrowLen - 8;

  // Solid broadhead body
  ctx.fillStyle = strokeColor;
  ctx.beginPath();
  ctx.moveTo(tipX, 0); // razor tip
  ctx.lineTo(barbX, -4.6); // top barb point
  ctx.lineTo(ferruleX, -1.4); // top barb notch
  ctx.lineTo(ferruleX, 1.4); // bottom barb notch
  ctx.lineTo(barbX, 4.6); // bottom barb point
  ctx.closePath();
  ctx.fill();

  // Center bevel ridge line & highlight
  ctx.strokeStyle = COLOR_LIGHT_WHITE;
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(ferruleX, 0);
  ctx.lineTo(tipX, 0);
  ctx.stroke();

  // 7. Hit target amber pin notch
  if (isHitTarget) {
    ctx.fillStyle = COLOR_AMBER;
    ctx.beginPath();
    ctx.arc(tipX, 0, 2.8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Render persistent arrows with graceful aging ("Cinza de Memória")
 */
function drawPersistentArrows(ctx: CanvasRenderingContext2D, arrows: PersistentArrow[]): void {
  const total = arrows.length;
  if (total === 0) return;

  const now = performance.now();

  for (let i = 0; i < total; i++) {
    const arrow = arrows[i];
    ctx.save();

    // Subtle aging: the oldest arrows shift towards memory gray, newest are charcoal
    const ageFactor = total > 1 ? (i / (total - 1)) : 1; // 0 for oldest, 1 for newest
    const isRecent = i >= total - 2;

    const strokeColor = isRecent 
      ? COLOR_CHARCOAL 
      : lerpColor(COLOR_MEMORY_GRAY, COLOR_CHARCOAL, ageFactor * 0.6);
    
    const alpha = isRecent ? 1.0 : (0.55 + ageFactor * 0.45);

    // Initial settle vibration / wobble
    let wobble = 0;
    const timeSinceSettle = (now - arrow.settledAt) / 1000;
    if (timeSinceSettle < 0.6) {
      wobble = Math.sin(timeSinceSettle * arrow.wobbleSpeed) * arrow.wobbleAmount * Math.exp(-timeSinceSettle * 6);
    }

    ctx.translate(arrow.startX, arrow.startY);
    ctx.rotate(arrow.angle + wobble);

    // Render with exquisite craftsmanship
    drawDetailedArrow(ctx, arrow.length, {
      strokeColor,
      alpha,
      isFlying: false,
      isHitTarget: arrow.isHitTarget,
      isRecent,
    });

    ctx.restore();
  }
}

/**
 * Render the flying arrow in mid-flight
 */
function drawFlyingArrow(ctx: CanvasRenderingContext2D, arrow: FlyingArrow): void {
  ctx.save();
  ctx.translate(arrow.x, arrow.y);
  ctx.rotate(arrow.angle);

  // Tip is at (0, 0), tail is at (-arrow.length, 0)
  // Translate so drawDetailedArrow operates from tail (0,0) to tip (length,0)
  ctx.translate(-arrow.length, 0);

  drawDetailedArrow(ctx, arrow.length, {
    strokeColor: COLOR_CHARCOAL,
    alpha: 1.0,
    isFlying: true,
    isRecent: true,
  });

  ctx.restore();
}

/**
 * Render the trajectory prediction curve with kinetic amber dashed styling
 */
function drawAimingTrajectory(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  nearMiss?: Point | null
): void {
  if (points.length < 2) return;

  ctx.save();
  ctx.strokeStyle = COLOR_AMBER;
  ctx.lineWidth = 1.8;
  ctx.setLineDash([5, 4]);

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();

  // Arrowhead indicator at the tip of the prediction
  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  const angle = Math.atan2(last.y - prev.y, last.x - prev.x);

  ctx.setLineDash([]);
  ctx.fillStyle = COLOR_AMBER;
  ctx.beginPath();
  ctx.translate(last.x, last.y);
  ctx.rotate(angle);
  ctx.moveTo(0, 0);
  ctx.lineTo(-8, -4.0);
  ctx.lineTo(-6, 0);
  ctx.lineTo(-8, 4.0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // If there's a near-miss clearance highlight point, draw a subtle amber ping
  if (nearMiss) {
    ctx.save();
    ctx.strokeStyle = COLOR_AMBER;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(nearMiss.x, nearMiss.y, 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * Draw resting bow at bowOrigin
 */
function drawRestingBow(ctx: CanvasRenderingContext2D, origin: Point): void {
  ctx.save();
  ctx.translate(origin.x, origin.y);

  // Subtle archer bow arc
  ctx.strokeStyle = 'rgba(34, 35, 33, 0.45)';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(0, 8, 24, -Math.PI * 0.85, -Math.PI * 0.15);
  ctx.stroke();

  // Bow string
  ctx.strokeStyle = 'rgba(34, 35, 33, 0.3)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-20, 0);
  ctx.lineTo(20, 0);
  ctx.stroke();

  // Ready arrow resting on bow (tail at string, pointing up)
  ctx.save();
  ctx.translate(0, 2);
  ctx.rotate(-Math.PI / 2);
  drawDetailedArrow(ctx, 36, {
    strokeColor: 'rgba(34, 35, 33, 0.7)',
    alpha: 0.85,
    isRecent: true,
  });
  ctx.restore();

  ctx.restore();
}

/**
 * Draw active bow and pulled arrow while aiming
 */
function drawBowAndArrow(
  ctx: CanvasRenderingContext2D,
  origin: Point,
  aimVector: { x: number; y: number }
): void {
  ctx.save();
  ctx.translate(origin.x, origin.y);

  const angle = Math.atan2(aimVector.y, aimVector.x);
  ctx.rotate(angle);

  const pullDist = Math.min(Math.hypot(aimVector.x, aimVector.y) * 0.2, 24);

  // Bow wood stave
  ctx.strokeStyle = COLOR_CHARCOAL;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.arc(0, 0, 24, -Math.PI * 0.45, Math.PI * 0.45);
  ctx.stroke();

  // Tensioned string
  ctx.strokeStyle = 'rgba(34, 35, 33, 0.7)';
  ctx.lineWidth = 1.4;
  const topTipX = Math.cos(-Math.PI * 0.45) * 24;
  const topTipY = Math.sin(-Math.PI * 0.45) * 24;
  const botTipX = Math.cos(Math.PI * 0.45) * 24;
  const botTipY = Math.sin(Math.PI * 0.45) * 24;

  ctx.beginPath();
  ctx.moveTo(topTipX, topTipY);
  ctx.lineTo(-pullDist, 0);
  ctx.lineTo(botTipX, botTipY);
  ctx.stroke();

  // Pulled arrow resting against tensioned string
  ctx.save();
  ctx.translate(-pullDist, 0);
  drawDetailedArrow(ctx, 40, {
    strokeColor: COLOR_CHARCOAL,
    alpha: 1.0,
    isRecent: true,
  });
  ctx.restore();

  ctx.restore();
}

/**
 * Render visual impact and precision particles
 */
function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);

    if (p.type === 'ring') {
      // Precision wave ring
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p.type === 'line' || p.type === 'clack') {
      // Radial stroke or wood splinter tick
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.type === 'clack' ? 1.8 : 1.4;
      ctx.beginPath();
      const length = p.length || 8;
      const angle = p.angle || Math.atan2(p.vy, p.vx);
      const half = length / 2;
      ctx.moveTo(p.x - Math.cos(angle) * half, p.y - Math.sin(angle) * half);
      ctx.lineTo(p.x + Math.cos(angle) * half, p.y + Math.sin(angle) * half);
      ctx.stroke();
    } else {
      // Small circular spark
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

/**
 * Color interpolation helper
 */
function lerpColor(c1: string, c2: string, factor: number): string {
  const parse = (hex: string) => {
    const clean = hex.replace('#', '');
    return [
      parseInt(clean.substring(0, 2), 16),
      parseInt(clean.substring(2, 4), 16),
      parseInt(clean.substring(4, 6), 16),
    ];
  };

  const [r1, g1, b1] = parse(c1);
  const [r2, g2, b2] = parse(c2);

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  return `rgb(${r}, ${g}, ${b})`;
}
