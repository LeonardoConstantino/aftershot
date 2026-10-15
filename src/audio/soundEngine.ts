/**
 * AFTERSHOT Web Audio Engine & Memory Chorus
 * Procedural tactile synthesis: bowstring tension, wooden impact, harmonic chime,
 * dry clack collision, and ambient memory drone.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private chorusGain: GainNode | null = null;
  private chorusOsc1: OscillatorNode | null = null;
  private chorusOsc2: OscillatorNode | null = null;
  private chorusFilter: BiquadFilterNode | null = null;
  private isUnlocked: boolean = false;

  private soundEnabled: boolean = true;
  private sfxVolume: number = 0.8;
  private chorusEnabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initContext() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.soundEnabled ? this.sfxVolume : 0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.initChorus();
      this.isUnlocked = true;
    } catch {
      // Audio not supported or blocked
    }
  }

  public unlock() {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public configure(soundEnabled: boolean, sfxVolume: number, chorusEnabled: boolean) {
    this.soundEnabled = soundEnabled;
    this.sfxVolume = sfxVolume;
    this.chorusEnabled = chorusEnabled;

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.soundEnabled ? this.sfxVolume : 0, this.ctx.currentTime, 0.05);
    }
    if (this.chorusGain && this.ctx) {
      const targetGain = (this.soundEnabled && this.chorusEnabled) ? 0.08 : 0;
      this.chorusGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
    }
  }

  /**
   * Ambient Memory Chorus: A subtle, evolving harmonic bed that mirrors
   * the physical memory of past attempts.
   */
  private initChorus() {
    if (!this.ctx || !this.masterGain) return;
    try {
      this.chorusGain = this.ctx.createGain();
      this.chorusGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.chorusFilter = this.ctx.createBiquadFilter();
      this.chorusFilter.type = 'lowpass';
      this.chorusFilter.frequency.setValueAtTime(280, this.ctx.currentTime);
      this.chorusFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

      this.chorusOsc1 = this.ctx.createOscillator();
      this.chorusOsc1.type = 'triangle';
      this.chorusOsc1.frequency.setValueAtTime(110, this.ctx.currentTime); // A2

      this.chorusOsc2 = this.ctx.createOscillator();
      this.chorusOsc2.type = 'sine';
      this.chorusOsc2.frequency.setValueAtTime(165, this.ctx.currentTime); // E3 perfect fifth

      this.chorusOsc1.connect(this.chorusFilter);
      this.chorusOsc2.connect(this.chorusFilter);
      this.chorusFilter.connect(this.chorusGain);
      this.chorusGain.connect(this.masterGain);

      this.chorusOsc1.start();
      this.chorusOsc2.start();
    } catch {
      // Ignore background audio failures
    }
  }

  public updateMemoryChorus(persistentCount: number) {
    if (!this.ctx || !this.chorusGain || !this.chorusFilter) return;
    if (!this.soundEnabled || !this.chorusEnabled) {
      this.chorusGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
      return;
    }

    // Density modulation: empty field has near silence; 8+ persistent arrows introduces warmth
    const density = Math.min(persistentCount / 12, 1.0);
    const targetGain = 0.02 + density * 0.09;
    const cutoff = 240 + density * 320; // Filter opens up subtly as history stacks

    this.chorusGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.3);
    this.chorusFilter.frequency.setTargetAtTime(cutoff, this.ctx.currentTime, 0.4);
  }

  /**
   * Quick bowstring release sound: sharp snap with brief high-frequency air puff
   */
  public playRelease() {
    if (!this.soundEnabled) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    // String snap (damped triangle)
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(260, t);
    snapOsc.frequency.exponentialRampToValueAtTime(70, t + 0.07);

    snapGain.gain.setValueAtTime(0.5, t);
    snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    snapOsc.connect(snapGain);
    snapGain.connect(this.masterGain);
    snapOsc.start(t);
    snapOsc.stop(t + 0.09);

    // Whoosh / air buffer (short noise burst)
    this.playNoiseBurst(0.05, 1200, 400, 0.2);
  }

  /**
   * Crisp wooden target hit: tactile snap with controlled body resonance
   */
  public playHit() {
    if (!this.soundEnabled) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    // High transient snap (wood striking wood)
    const transient = this.ctx.createOscillator();
    const transGain = this.ctx.createGain();
    transient.type = 'sine';
    transient.frequency.setValueAtTime(820, t);
    transient.frequency.exponentialRampToValueAtTime(140, t + 0.05);

    transGain.gain.setValueAtTime(0.7, t);
    transGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    transient.connect(transGain);
    transGain.connect(this.masterGain);
    transient.start(t);
    transient.stop(t + 0.07);

    // Low wood body resonance
    const bodyOsc = this.ctx.createOscillator();
    const bodyGain = this.ctx.createGain();
    bodyOsc.type = 'triangle';
    bodyOsc.frequency.setValueAtTime(180, t);
    bodyOsc.frequency.exponentialRampToValueAtTime(80, t + 0.14);

    bodyGain.gain.setValueAtTime(0.5, t);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(this.masterGain);
    bodyOsc.start(t);
    bodyOsc.stop(t + 0.18);
  }

  /**
   * Bullseye / High precision hit: Crisp wooden snap accompanied by a pure crystal overtone
   */
  public playPrecisionHit() {
    this.playHit();
    if (!this.soundEnabled || !this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    // Harmonic chime (pure crystal bell shimmer)
    const bell1 = this.ctx.createOscillator();
    const bell2 = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();

    bell1.type = 'sine';
    bell1.frequency.setValueAtTime(1320, t); // E6
    bell2.type = 'sine';
    bell2.frequency.setValueAtTime(1980, t); // B6

    chimeGain.gain.setValueAtTime(0.35, t);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    bell1.connect(chimeGain);
    bell2.connect(chimeGain);
    chimeGain.connect(this.masterGain);

    bell1.start(t);
    bell2.start(t);
    bell1.stop(t + 0.36);
    bell2.stop(t + 0.36);
  }

  /**
   * Collision with persistent arrow shaft: Dry, coarse, short wooden knock
   */
  public playCollision() {
    if (!this.soundEnabled) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    const clack = this.ctx.createOscillator();
    const clackGain = this.ctx.createGain();
    clack.type = 'square';
    clack.frequency.setValueAtTime(420, t);
    clack.frequency.exponentialRampToValueAtTime(180, t + 0.04);

    // Filter to soften the square wave into dry wood
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, t);
    filter.Q.setValueAtTime(2.5, t);

    clackGain.gain.setValueAtTime(0.55, t);
    clackGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    clack.connect(filter);
    filter.connect(clackGain);
    clackGain.connect(this.masterGain);

    clack.start(t);
    clack.stop(t + 0.07);
  }

  /**
   * Embedding into boundary/wall
   */
  public playWallEmbed() {
    if (!this.soundEnabled) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  /**
   * Discrete UI tap
   */
  public playButton() {
    if (!this.soundEnabled) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.02);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.04);
  }

  private playNoiseBurst(duration: number, startFreq: number, endFreq: number, gainVal: number) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start();
    } catch {
      // Noise generation fallback
    }
  }
}

export const soundEngine = new SoundEngine();
