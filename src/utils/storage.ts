import { BestStats, GameSettings } from '../types/game';

const SETTINGS_KEY = 'aftershot_settings_v2';
const STATS_KEY = 'aftershot_stats_v2';
const ONBOARDING_KEY = 'aftershot_onboarded_v2';

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  sfxVolume: 0.8,
  chorusEnabled: true,
  hapticsEnabled: true,
  reducedMotion: false,
  zenMode: false,
};

export const DEFAULT_STATS: BestStats = {
  highScore: 0,
  bestStreak: 0,
  totalPrecision: 0,
  totalGames: 0,
  totalArrowsShot: 0,
  runCompositions: [],
};

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // fallback
  }
}

export function loadStats(): BestStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      return { ...DEFAULT_STATS, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_STATS;
}

export function saveStats(stats: BestStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // fallback
  }
}

export function isOnboarded(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setOnboarded(): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, 'true');
  } catch {
    // fallback
  }
}
