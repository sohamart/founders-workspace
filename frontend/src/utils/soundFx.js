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
        this.unlockAudio();
        const events = ['click', 'touchstart', 'touchend', 'keydown', 'pointerdown'];
        events.forEach(evt => {
          window.removeEventListener(evt, unlockAudio);
          document.removeEventListener(evt, unlockAudio);
        });
      };

      const events = ['click', 'touchstart', 'touchend', 'keydown', 'pointerdown'];
      events.forEach(evt => {
        window.addEventListener(evt, unlockAudio, { passive: true });
        document.addEventListener(evt, unlockAudio, { passive: true });
      });
    }
  }

  // Explicit audio unlock for mobile browsers (iOS Safari, Android Chrome)
  unlockAudio() {
    this.hasUserInteracted = true;
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }

      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

      if (this.audioCtx) {
        // Play a 1-sample silent buffer to unlock the audio hardware on iOS / Android
        const buffer = this.audioCtx.createBuffer(1, 1, 22050);
        const source = this.audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioCtx.destination);
        source.start(0);
      }
      return this.audioCtx;
    } catch (e) {
      return null;
    }
  }

  // Safely get or resume AudioContext only when allowed by browser policy
  getSafeAudioContext() {
    if (typeof window === 'undefined') return null;

    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return null;
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

      return this.audioCtx;
    } catch (e) {
      return null;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('founders_sound_muted', this.isMuted ? 'true' : 'false');
      } catch (e) {}
    }
    if (!this.isMuted) {
      this.unlockAudio();
      this.playSuccess();
    }
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
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  }

  playNotification() {
    if (this.isMuted) return;
    try {
      const ctx = this.getSafeAudioContext();
      if (!ctx) return;
      // High-clarity 2-tone notification ping
      const tones = [
        { freq: 587.33, delay: 0, dur: 0.12 },     // D5
        { freq: 880.00, delay: 0.09, dur: 0.25 }  // A5
      ];
      tones.forEach(t => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(t.freq, ctx.currentTime + t.delay);
        gain.gain.setValueAtTime(0.22, ctx.currentTime + t.delay);
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
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.22, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.28);
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
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);
        gain.gain.setValueAtTime(0.22, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.32);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.32);
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
        gain.gain.setValueAtTime(0.22, ctx.currentTime + idx * 0.15);
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
        gain.gain.setValueAtTime(0.25, ctx.currentTime + p.start);
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
