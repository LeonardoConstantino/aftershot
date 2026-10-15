/**
 * Tactile feedback utility utilizing the Navigator Vibration API
 */

export type HapticPattern = 'tap' | 'release' | 'hit' | 'precision' | 'collision';

class HapticEngine {
  private enabled: boolean = true;

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public trigger(type: HapticPattern) {
    if (!this.enabled || typeof window === 'undefined' || !navigator.vibrate) {
      return;
    }

    try {
      switch (type) {
        case 'tap':
          navigator.vibrate(8);
          break;
        case 'release':
          navigator.vibrate(12);
          break;
        case 'hit':
          navigator.vibrate(24);
          break;
        case 'precision':
          navigator.vibrate([16, 30, 30]);
          break;
        case 'collision':
          navigator.vibrate([35, 20, 15]);
          break;
      }
    } catch {
      // Ignore vibration errors if restricted by device
    }
  }
}

export const haptics = new HapticEngine();
