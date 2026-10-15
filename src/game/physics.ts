import { Point, Vector2D, Target, PersistentArrow, FlyingArrow } from '../types/game';

/**
 * Distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.hypot(dx, dy);
}

/**
 * Shortest distance from point P to line segment AB
 */
export function pointToSegmentDistance(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number
): { dist: number; closestX: number; closestY: number } {
  const l2 = (bx - ax) * (bx - ax) + (by - ay) * (by - ay);
  if (l2 === 0) {
    return {
      dist: Math.hypot(px - ax, py - ay),
      closestX: ax,
      closestY: ay,
    };
  }

  // Projection scalar t onto line AB clamped to [0, 1]
  const t = Math.max(0, Math.min(1, ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / l2));
  const closestX = ax + t * (bx - ax);
  const closestY = ay + t * (by - ay);

  return {
    dist: Math.hypot(px - closestX, py - closestY),
    closestX,
    closestY,
  };
}

/**
 * Line segment intersection check between segment 1 (p1->p2) and segment 2 (p3->p4)
 */
export function segmentsIntersect(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number
): { intersect: boolean; ix?: number; iy?: number } {
  const d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(d) < 1e-6) return { intersect: false };

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / d;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / d;

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      intersect: true,
      ix: x1 + t * (x2 - x1),
      iy: y1 + t * (y2 - y1),
    };
  }

  return { intersect: false };
}

/**
 * Predict arrow trajectory points given start position and release velocity
 */
export function calculateTrajectory(
  origin: Point,
  velocity: Vector2D,
  steps: number = 32,
  dt: number = 0.05
): Point[] {
  const points: Point[] = [{ x: origin.x, y: origin.y }];
  let currX = origin.x;
  let currY = origin.y;
  let vx = velocity.x;
  let vy = velocity.y;
  const gravity = 80; // subtle, realistic drop for tactical depth

  for (let i = 0; i < steps; i++) {
    currX += vx * dt;
    currY += vy * dt;
    vy += gravity * dt;
    points.push({ x: currX, y: currY });
  }

  return points;
}

/**
 * Checks if a flying arrow collides with any persistent arrow in the field.
 */
export function checkPersistentArrowCollision(
  arrow: FlyingArrow,
  prevX: number,
  prevY: number,
  persistentArrows: PersistentArrow[]
): { collided: boolean; hitArrow?: PersistentArrow; contactPoint?: Point } {
  // Arrow tip trajectory in this frame: from (prevX, prevY) to (arrow.x, arrow.y)
  const tipX = arrow.x;
  const tipY = arrow.y;

  for (const pa of persistentArrows) {
    // 1. Line segment intersection between arrow tip movement and persistent arrow shaft
    const hit = segmentsIntersect(
      prevX,
      prevY,
      tipX,
      tipY,
      pa.startX,
      pa.startY,
      pa.tipX,
      pa.tipY
    );

    if (hit.intersect && hit.ix !== undefined && hit.iy !== undefined) {
      return {
        collided: true,
        hitArrow: pa,
        contactPoint: { x: hit.ix, y: hit.iy },
      };
    }

    // 2. Proximity check with small shaft thickness (3.5px)
    const { dist, closestX, closestY } = pointToSegmentDistance(
      tipX,
      tipY,
      pa.startX,
      pa.startY,
      pa.tipX,
      pa.tipY
    );

    if (dist <= 4.0) {
      return {
        collided: true,
        hitArrow: pa,
        contactPoint: { x: closestX, y: closestY },
      };
    }
  }

  return { collided: false };
}

/**
 * Check if the flying arrow hit the target
 */
export function checkTargetCollision(
  arrow: FlyingArrow,
  target: Target
): { hit: boolean; precision: boolean; dist: number } {
  const d = Math.hypot(arrow.x - target.x, arrow.y - target.y);
  if (d <= target.radius) {
    const isBullseye = d <= target.baseRadius * 0.38;
    return {
      hit: true,
      precision: isBullseye,
      dist: d,
    };
  }
  return { hit: false, precision: false, dist: d };
}

/**
 * Generates an ideal target position that is challenging, well-spaced,
 * and within safe mobile viewport margins.
 */
export function generateNextTargetPosition(
  width: number,
  height: number,
  currentHitCount: number,
  existingPersistentArrows: PersistentArrow[]
): Target {
  // Safe margins for mobile: keep target well inside the upper 55% of the screen
  const marginX = Math.max(48, width * 0.12);
  const minX = marginX;
  const maxX = width - marginX;
  const minY = Math.max(90, height * 0.14);
  const maxY = height * 0.52; // Upper half of screen

  let bestX = width / 2;
  let bestY = height * 0.28;
  let bestScore = -1;

  // Try candidate positions to find one that creates interesting clearance with past arrows
  for (let attempt = 0; attempt < 8; attempt++) {
    const candX = minX + Math.random() * (maxX - minX);
    const candY = minY + Math.random() * (maxY - minY);

    // Evaluate distance to persistent arrows: don't spawn completely blocked
    let minOldDist = 9999;
    for (const pa of existingPersistentArrows) {
      const d = Math.hypot(candX - pa.tipX, candY - pa.tipY);
      if (d < minOldDist) minOldDist = d;
    }

    // We want some proximity to past errors (tension) but never completely overlapping
    if (minOldDist > 35 && minOldDist > bestScore) {
      bestScore = minOldDist;
      bestX = candX;
      bestY = candY;
    }
  }

  // Slight subtle size progression: starts generous (~28px) and levels at (~22px)
  const baseRadius = Math.max(22, 28 - Math.min(currentHitCount * 0.4, 6));

  return {
    x: bestX,
    y: bestY,
    radius: baseRadius,
    baseRadius: baseRadius,
    pulsePhase: 0,
    hitCount: currentHitCount,
  };
}
