/**
 * Procedural library ambience, synthesized entirely with WebAudio — no audio
 * files. Three layers:
 *
 *  - room tone: looped brown noise through a low-pass filter, slowly breathing
 *  - drone: two barely-detuned deep oscillators, like the hum of an old hall
 *  - events: distant soft chimes and page-turn rustles at random intervals
 *
 * The engine is created lazily on the first user gesture (browsers require
 * one before audio can start).
 */

const CHIME_NOTES = [220, 246.9, 293.7, 329.6, 392, 440];

export class Ambience {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private stopped = true;
  private timers: ReturnType<typeof setTimeout>[] = [];
  private volume = 0.6;

  setVolume(volume: number) {
    this.volume = volume;
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(volume * 0.5, this.ctx.currentTime, 0.15);
    }
  }

  get playing() {
    return !this.stopped;
  }

  start(volume: number) {
    this.volume = volume;
    this.stopped = false;

    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.ctx.destination);
      this.buildBed();
    }

    void this.ctx.resume();
    this.master!.gain.setTargetAtTime(volume * 0.5, this.ctx.currentTime, 1.2);
    this.scheduleChime();
    this.scheduleRustle();
  }

  stop() {
    this.stopped = true;
    this.timers.forEach(clearTimeout);
    this.timers = [];
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
      const ctx = this.ctx;
      setTimeout(() => {
        if (this.stopped) void ctx.suspend();
      }, 2000);
    }
  }

  /* ------------------------------------------------------------ layers */

  private buildBed() {
    const ctx = this.ctx!;
    const master = this.master!;

    /* room tone: brown noise, low-passed, breathing via a slow LFO */
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.value = 320;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.5;

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.045;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.14;
    lfo.connect(lfoGain);
    lfoGain.connect(noiseGain.gain);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);
    noise.start();
    lfo.start();

    /* drone: deep, slightly detuned pair */
    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = "lowpass";
    droneFilter.frequency.value = 220;
    droneFilter.connect(master);

    const droneA = ctx.createOscillator();
    droneA.type = "sine";
    droneA.frequency.value = 55;
    const gainA = ctx.createGain();
    gainA.gain.value = 0.16;
    droneA.connect(gainA);
    gainA.connect(droneFilter);
    droneA.start();

    const droneB = ctx.createOscillator();
    droneB.type = "triangle";
    droneB.frequency.value = 110.4;
    const gainB = ctx.createGain();
    gainB.gain.value = 0.05;
    droneB.connect(gainB);
    gainB.connect(droneFilter);
    droneB.start();
  }

  /** A distant, soft bell — one partial + its octave, long decay. */
  playChime(note?: number) {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const freq = note ?? CHIME_NOTES[Math.floor(Math.random() * CHIME_NOTES.length)];
    const now = ctx.currentTime;

    const pan = ctx.createStereoPanner();
    pan.pan.value = Math.random() * 1.4 - 0.7;
    pan.connect(this.master);

    for (const [mult, level] of [
      [1, 0.09],
      [2.01, 0.03]
    ] as const) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq * mult;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(level, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 5.5);
      osc.connect(gain);
      gain.connect(pan);
      osc.start(now);
      osc.stop(now + 6);
    }
  }

  /**
   * A whisper-soft interaction tick for hovers — barely audible, like a
   * fingertip brushing paper. Throttled by the caller.
   */
  playHover() {
    if (!this.ctx || !this.master || this.stopped) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(640 + Math.random() * 120, now);
    osc.frequency.exponentialRampToValueAtTime(340, now + 0.12);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.016, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.master);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  /** A soft paper rustle: a short band-passed noise breath. */
  private playRustle() {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const duration = 0.5;

    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const env = Math.sin((i / data.length) * Math.PI);
      data[i] = (Math.random() * 2 - 1) * env * env;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1400 + Math.random() * 800;
    filter.Q.value = 0.8;

    const gain = ctx.createGain();
    gain.gain.value = 0.05;

    const pan = ctx.createStereoPanner();
    pan.pan.value = Math.random() * 1.2 - 0.6;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(pan);
    pan.connect(this.master);
    source.start(now);
  }

  private scheduleChime() {
    if (this.stopped) return;
    const delay = 16000 + Math.random() * 26000;
    this.timers.push(
      setTimeout(() => {
        if (!this.stopped) {
          this.playChime();
          this.scheduleChime();
        }
      }, delay)
    );
  }

  private scheduleRustle() {
    if (this.stopped) return;
    const delay = 22000 + Math.random() * 38000;
    this.timers.push(
      setTimeout(() => {
        if (!this.stopped) {
          this.playRustle();
          this.scheduleRustle();
        }
      }, delay)
    );
  }
}

export const ambience = new Ambience();

export const AMBIENCE_STORAGE_KEY = "library-ambience";
