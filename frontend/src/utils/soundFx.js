// Web Audio API Synthesized Sound Effects (Zero external audio file dependencies)

class SoundFX {
  constructor() {
    this.audioCtx = null;
    this.isMuted = localStorage.getItem('founders_sound_muted') === 'true';
  }

  init() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('founders_sound_muted', this.isMuted ? 'true' : 'false');
    if (!this.isMuted) this.playPop();
    return this.isMuted;
  }

  playPop() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.08);
    } catch (e) {
      // Audio autoplay policy catch
    }
  }

  playChime() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.audioCtx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + idx * 0.06 + 0.3);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(this.audioCtx.currentTime + idx * 0.06);
        osc.stop(this.audioCtx.currentTime + idx * 0.06 + 0.3);
      });
    } catch (e) {}
  }

  playWarning() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.audioCtx) return;
      const freqs = [350, 220];
      freqs.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + idx * 0.15);
        gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + idx * 0.15 + 0.2);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(this.audioCtx.currentTime + idx * 0.15);
        osc.stop(this.audioCtx.currentTime + idx * 0.15 + 0.2);
      });
    } catch (e) {}
  }

  playDangerAlarm() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.audioCtx) return;
      // High-urgency disciplinary danger alarm siren
      const pulses = [
        { freq: 880, start: 0, dur: 0.18 },
        { freq: 659, start: 0.18, dur: 0.18 },
        { freq: 880, start: 0.36, dur: 0.18 },
        { freq: 659, start: 0.54, dur: 0.24 }
      ];
      pulses.forEach((p) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(p.freq, this.audioCtx.currentTime + p.start);
        gain.gain.setValueAtTime(0.22, this.audioCtx.currentTime + p.start);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + p.start + p.dur);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(this.audioCtx.currentTime + p.start);
        osc.stop(this.audioCtx.currentTime + p.start + p.dur);
      });
    } catch (e) {}
  }
}

export const sound = new SoundFX();
