/**
 * 8-bit style sound generator using Web Audio API
 * Generates retro game sounds programmatically
 */

class SoundSystemClass {
  private audioContext: AudioContext | null = null;
  private masterVolume = 0.3;
  private enabled = true;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Play a punch sound - quick sharp sound
   */
  public playPunch(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);

    gain.gain.setValueAtTime(this.masterVolume * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * Play a kick sound - deeper, more impact
   */
  public playKick(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

    gain.gain.setValueAtTime(this.masterVolume * 0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * Play a hit sound - when attack connects
   */
  public playHit(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;

    // Noise burst for impact
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.masterVolume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    // Add a bass thump
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.1);
    oscGain.gain.setValueAtTime(this.masterVolume * 0.5, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    noise.connect(gain);
    gain.connect(ctx.destination);
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    noise.start(now);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * Play a block sound - metallic clang
   */
  public playBlock(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'square';
    osc1.frequency.setValueAtTime(800, now);
    osc1.frequency.exponentialRampToValueAtTime(400, now + 0.1);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(1200, now);
    osc2.frequency.exponentialRampToValueAtTime(600, now + 0.1);

    gain.gain.setValueAtTime(this.masterVolume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.1);
    osc2.stop(now + 0.1);
  }

  /**
   * Play jump sound - rising tone
   */
  public playJump(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);

    gain.gain.setValueAtTime(this.masterVolume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * Play round start sound - fanfare
   */
  public playRoundStart(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const notes = [262, 330, 392, 523]; // C4, E4, G4, C5
    const duration = 0.15;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + i * duration);

      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(this.masterVolume * 0.3, now + i * duration);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * duration + duration * 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * duration);
      osc.stop(now + i * duration + duration);
    });
  }

  /**
   * Play KO sound - dramatic descending tone
   */
  public playKO(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);

    gain.gain.setValueAtTime(this.masterVolume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  /**
   * Play victory sound - triumphant melody
   */
  public playVictory(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const notes = [523, 659, 784, 1047, 784, 1047]; // C5, E5, G5, C6, G5, C6
    const durations = [0.15, 0.15, 0.15, 0.3, 0.15, 0.4];

    let time = now;
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(this.masterVolume * 0.25, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + durations[i] * 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + durations[i]);

      time += durations[i];
    });
  }

  /**
   * Play menu select sound
   */
  public playSelect(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(880, now + 0.05);

    gain.gain.setValueAtTime(this.masterVolume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * Play menu navigate sound
   */
  public playNavigate(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(330, now);

    gain.gain.setValueAtTime(this.masterVolume * 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Play timer warning beep
   */
  public playTimerWarning(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(880, now);

    gain.gain.setValueAtTime(this.masterVolume * 0.2, now);
    gain.gain.setValueAtTime(0, now + 0.1);
    gain.gain.setValueAtTime(this.masterVolume * 0.2, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }
}

export const SoundSystem = new SoundSystemClass();
