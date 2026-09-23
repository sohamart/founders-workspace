// Web Audio API Synthesized Sound Effects (Zero external audio file dependencies)

class SoundFX {
  constructor() {
    this.audioCtx = null;
    this.isMuted = typeof window !== 'undefined' ? localStorage.getItem('founders_sound_muted') === 'true' : false;
    this.hasUserInteracted = false;

    // Auto-unlock Web Audio API on first user interaction (click, touch, keydown)
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        this.hasUserInteracted = true;
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
          this.audioCtx.resume().catch(() => {});
        }
        ['click', 'touchstart', 'keydown'].forEach(evt => {
          window.removeEventListener(evt, unlockAudio);
        });
      };

      ['click', 'touchstart', 'keydown'].forEach(evt => {
        window.addEventListener(evt, unlockAudio, { passive: true });
      });
    }
  }

  // Safely get or resume AudioContext only when allowed by browser policy
  getSafeAudioContext() {
    if (typeof window === 'undefined') return null;

    // Check if user has interacted or if browser has user activation
    const canPlay = this.hasUserInteracted || 
      (typeof navigator !== 'undefined' && navigator.userActivation && navigator.userActivation.hasBeenActive);

    if (!canPlay && !this.audioCtx) {
      return null;
    }

    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return null;
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        if (canPlay) {
          this.audioCtx.resume().catch(() => {});
        } else {
          return null;
        }
      }

      return this.audioCtx;
    } catch (e) {
      return null;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('founders_sound_muted', this.isMuted ? 'true' : 'false');
    }
    if (!this.isMuted) this.playPop();
    return this.isMuted;
  }

  playPop() {
    if (this.isMuted) return;
    try {
      const ctx = this.getSafeAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {}
  }

  playNotification() {
    if (this.isMuted) return;
    try {
      const ctx = this.getSafeAudioContext();
      if (!ctx) return;
      // High-clarity 2-tone notification ping
      const tones = [
        { freq: 587.33, delay: 0, dur: 0.1 },      // D5
        { freq: 880.00, delay: 0.08, dur: 0.22 }   // A5
      ];
      tones.forEach(t => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(t.freq, ctx.currentTime + t.delay);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + t.delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t.delay + t.dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + t.delay);
        osc.stop(ctx.currentTime + t.delay + t.dur);
      });
    } catch (e) {}
  }

  playSuccess() {
    if (this.isMuted) return;
    try {
      const ctx = this.getSafeAudioContext();
      if (!ctx) return;
      // Harmonious ascending success chime (C5 -> E5 -> G5)
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.25);
      });
    } catch (e) {}
  }

  playChime() {
    if (this.isMuted) return;
    try {
      const ctx = this.getSafeAudioContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.3);
      });
    } catch (e) {}
  }

  playWarning() {
    if (this.isMuted) return;
    try {
      const ctx = this.getSafeAudioContext();
      if (!ctx) return;
      const freqs = [350, 220];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.15);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.15 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.15);
        osc.stop(ctx.currentTime + idx * 0.15 + 0.2);
      });
    } catch (e) {}
  }

  playDangerAlarm() {
    if (this.isMuted) return;
    try {
      const ctx = this.getSafeAudioContext();
      if (!ctx) return;
      // High-urgency disciplinary danger alarm siren
      const pulses = [
        { freq: 880, start: 0, dur: 0.18 },
        { freq: 659, start: 0.18, dur: 0.18 },
        { freq: 880, start: 0.36, dur: 0.18 },
        { freq: 659, start: 0.54, dur: 0.24 }
      ];
      pulses.forEach((p) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(p.freq, ctx.currentTime + p.start);
        gain.gain.setValueAtTime(0.22, ctx.currentTime + p.start);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + p.start + p.dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + p.start);
        osc.stop(ctx.currentTime + p.start + p.dur);
      });
    } catch (e) {}
  }
}

export const sound = new SoundFX();

