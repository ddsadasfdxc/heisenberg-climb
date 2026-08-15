/** Lightweight synthesized sound effects; no network dependency. */
export class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = localStorage.getItem('climb-sound') !== 'off';
  }
  unlock() {
    if (!this.enabled) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx ||= new AC();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }
  tone(freq = 440, duration = 0.08, type = 'sine', gain = 0.035, slide = 0) {
    if (!this.enabled) return;
    this.unlock();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), now + duration);
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(gain, now + 0.008);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(amp).connect(this.ctx.destination);
    osc.start(now); osc.stop(now + duration + 0.02);
  }
  play(name) {
    const presets = {
      click: [520, .045, 'square', .018, 40],
      card: [260, .09, 'triangle', .035, 180],
      hit: [110, .12, 'sawtooth', .05, -65],
      block: [190, .08, 'square', .025, -45],
      heal: [460, .18, 'sine', .035, 280],
      gold: [820, .12, 'triangle', .035, 380],
      victory: [520, .3, 'triangle', .045, 520],
      defeat: [180, .4, 'sawtooth', .04, -120],
      page: [340, .07, 'sine', .02, 80],
    };
    this.tone(...(presets[name] || presets.click));
  }
  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('climb-sound', this.enabled ? 'on' : 'off');
    if (this.enabled) this.play('click');
    return this.enabled;
  }
}