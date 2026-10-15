export type GameScreen = 
  | 'SPLASH' 
  | 'MENU' 
  | 'PLAYING' 
  | 'PAUSED' 
  | 'GAME_OVER' 
  | 'RECORDS' 
  | 'SETTINGS' 
  | 'HOW_TO_PLAY';

export interface Point {
  x: number;
  y: number;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface Target {
  x: number;
  y: number;
  radius: number;
  baseRadius: number;
  pulsePhase: number;
  hitCount: number;
  vx?: number;
  vy?: number;
}

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  radius: number; // strictly smaller than target (target is 22-28px, obstacle is 9-12px)
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  oscillationRange: number;
  oscillationSpeed: number;
  phase: number;
  shape: 'circle' | 'diamond';
}

export interface FlyingArrow {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  angle: number;
  trail: Point[];
  bornAt: number;
  sourceX: number;
  sourceY: number;
}

export interface PersistentArrow {
  id: string;
  startX: number;
  startY: number;
  tipX: number;
  tipY: number;
  length: number;
  angle: number;
  settledAt: number; // timestamp
  wobbleAmount: number;
  wobbleSpeed: number;
  isHitTarget: boolean; // true if lodged into target, false if missed obstacle
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
  life: number;
  maxLife: number;
  type: 'spark' | 'ring' | 'line' | 'clack';
  angle?: number;
  length?: number;
}

export interface ShotRecord {
  shotIndex: number;
  from: Point;
  to: Point;
  hit: boolean;
  precision: boolean;
  collidedWithArrow: boolean;
  scoreGained: number;
  timestamp: number;
}

export interface GameSession {
  id: string;
  score: number;
  streak: number;
  maxStreak: number;
  precisionHits: number;
  totalShots: number;
  misses: number;
  maxMisses: number;
  startedAt: number;
  endedAt: number;
  shots: ShotRecord[];
  persistentArrows: PersistentArrow[];
  finalFieldDensity: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  sfxVolume: number;
  chorusEnabled: boolean;
  hapticsEnabled: boolean;
  reducedMotion: boolean;
  zenMode: boolean; // infinite attempts without game over
}

export interface BestStats {
  highScore: number;
  bestStreak: number;
  totalPrecision: number;
  totalGames: number;
  totalArrowsShot: number;
  runCompositions: {
    id: string;
    score: number;
    date: string;
    arrowCount: number;
  }[];
}
