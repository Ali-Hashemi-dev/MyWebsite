/**
 * Procedural library ambience, synthesized entirely with WebAudio — no audio
 * files. The mood: wandering and mysterious, like a vast old library at
 * night. Layers:
 *
 *  - room tone: looped brown noise through a low-pass filter, slowly breathing
 *  - drone: two barely-detuned deep oscillators, the hum of an old hall
 *  - celesta: a generative music box wandering through A harmonic minor —
 *    sparse three-to-six-note phrases, echoed so they sound rooms away
 *  - events: soft page-turn rustles at long random intervals
 *
 * The engine is created lazily on the first user gesture (browsers require
 * one before audio can start).
 */

/* A harmonic minor — the raised seventh gives the wondering, spellbound color */
const SCALE = [440, 493.88, 523.25, 587.33, 659.25, 698.46, 830.61, 880];

export class Ambience {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private echo: GainNode | null = null;
  private stopped = true;
  private timers: ReturnType<typeof setTimeout>[] = [];
  private volume = 0.6;
  private scaleIndex = 0;

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
      this.buildEcho();
    }

    void this.ctx.resume();
    this.master!.gain.setTargetAtTime(volume * 0.5, this.ctx.currentTime, 1.2);
    this.schedulePhrase(4000);
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
    noiseFilter.frequency.value = 360;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.42;

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.035;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.13;
    lfo.connect(lfoGain);
    lfoGain.connect(noiseGain.gain);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);
    noise.start();
    lfo.start();

    /* drone: deep, slightly detuned pair on A — the tonic of the celesta */
    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = "lowpass";
    droneFilter.frequency.value = 200;
    droneFilter.connect(master);

    const droneA = ctx.createOscillator();
    droneA.type = "sine";
    droneA.frequency.value = 55;
    const gainA = ctx.createGain();
    gainA.gain.value = 0.15;
    droneA.connect(gainA);
    gainA.connect(droneFilter);
    droneA.start();

    const droneB = ctx.createOscillator();
    droneB.type = "triangle";
    droneB.frequency.value = 110.3;
    const gainB = ctx.createGain();
    gainB.gain.value = 0.045;
    droneB.connect(gainB);
    gainB.connect(droneFilter);
    droneB.start();
  }

  /** Feedback echo: celesta notes repeat softly, rooms away. */
  private buildEcho() {
    const ctx = this.ctx!;
    const master = this.master!;

    const send = ctx.createGain();
    send.gain.value = 0.55;

    const delay = ctx.createDelay(2);
    delay.delayTime.value = 0.46;

    const feedback = ctx.createGain();
    feedback.gain.value = 0.42;

    const color = ctx.createBiquadFilter();
    color.type = "lowpass";
    color.frequency.value = 2400;

    send.connect(delay);
    delay.connect(color);
    color.connect(feedback);
    feedback.connect(delay);
    color.connect(master);

    this.echo = send;
  }

  /** One celesta / music-box note: pure partials, sharp attack, long fade. */
  private playCelesta(freq: number, when = 0, level = 1) {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const now = ctx.currentTime + when;

    const pan = ctx.createStereoPanner();
    pan.pan.value = Math.random() * 1.2 - 0.6;
    pan.connect(this.master);
    if (this.echo) pan.connect(this.echo);

    for (const [mult, partial, decay] of [
      [1, 0.075, 3.4],
      [4, 0.014, 1.1],
      [10.05, 0.004, 0.5]
    ] as const) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq * mult;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(partial * level, now + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);
      osc.connect(gain);
      gain.connect(pan);
      osc.start(now);
      osc.stop(now + decay + 0.1);
    }
  }

  /**
   * A wandering phrase: a short random walk through the scale, sometimes
   * dipping an octave, always ending unresolved — a question, not an answer.
   */
  private playPhrase() {
    const length = 3 + Math.floor(Math.random() * 4);
    let step = 0;
    let index = this.scaleIndex;
    for (let i = 0; i < length; i++) {
      index = Math.max(0, Math.min(SCALE.length - 1, index + Math.floor(Math.random() * 5) - 2));
      const octave = Math.random() < 0.22 ? 0.5 : 1;
      const gap = 0.42 + Math.random() * 0.3;
      this.playCelesta(SCALE[index] * octave, step, i === 0 ? 1 : 0.75 + Math.random() * 0.25);
      step += gap;
    }
    this.scaleIndex = index;
  }

  /** Public single note — used by the game for catch feedback. */
  playChime(note?: number) {
    this.playCelesta(note ?? SCALE[Math.floor(Math.random() * SCALE.length)]);
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

  private schedulePhrase(initialDelay?: number) {
    if (this.stopped) return;
    const delay = initialDelay ?? 11000 + Math.random() * 17000;
    this.timers.push(
      setTimeout(() => {
        if (!this.stopped) {
          this.playPhrase();
          this.schedulePhrase();
        }
      }, delay)
    );
  }

  private scheduleRustle() {
    if (this.stopped) return;
    const delay = 24000 + Math.random() * 36000;
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
