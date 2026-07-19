/**
 * Procedural ambience engine — four soundscapes synthesized entirely with
 * WebAudio, no audio files. All of them live in the same wandering,
 * mysterious old-library family:
 *
 *  - library: breathing room tone, deep detuned drone, wandering celesta
 *  - bells:   deep inharmonic tolls ringing through a convolver "tower"
 *  - wind:    band-passed wind whose center wanders, chime gusts, sub drone
 *  - rain:    high-passed patter, droplet ticks, distant thunder swells
 *
 * The AudioContext is created lazily on the first user gesture (browsers
 * require one before audio can start). Each soundscape is an isolated
 * subgraph hung off the shared master; switching crossfades the old one
 * out and disposes it completely — nodes, loops and timers.
 */

export type SoundscapeId = "library" | "bells" | "wind" | "rain";

export const SOUNDSCAPES: Array<{ id: SoundscapeId; name: string; hint: string }> = [
  { id: "library", name: "همس المكتبة", hint: "رفوف تتنفّس ونغمات تائهة بين القاعات" },
  { id: "bells", name: "أجراس بعيدة", hint: "برجٌ يقرع على مهل في ليلٍ لا يُرى" },
  { id: "wind", name: "رياح الأقبية", hint: "هواءٌ قديم يعبر الممرات الحجرية" },
  { id: "rain", name: "مطر على النوافذ", hint: "قطراتٌ على الزجاج ورعدٌ خافت بعيد" }
];

/* A harmonic minor — the raised seventh gives the wondering, spellbound color */
const SCALE = [440, 493.88, 523.25, 587.33, 659.25, 698.46, 830.61, 880];

/* Classic inharmonic bell partials, relative to the strike tone */
const BELL_RATIOS = [0.56, 0.92, 1.19, 1.71, 2.0, 2.74] as const;
const BELL_LEVELS = [0.95, 0.7, 0.52, 0.38, 0.28, 0.2] as const;
const BELL_DECAYS = [1, 0.72, 0.54, 0.4, 0.3, 0.22] as const;

/* ------------------------------------------------------------ shared DSP */

function makeNoiseBuffer(ctx: BaseAudioContext, seconds: number, brown: boolean): AudioBuffer {
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    } else {
      data[i] = white;
    }
  }
  return buffer;
}

/** Stereo reverb from exponentially decaying noise — a stone tower at night. */
function makeReverb(ctx: AudioContext, seconds: number): ConvolverNode {
  const length = Math.floor(ctx.sampleRate * seconds);
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp((-3.4 * i) / length);
    }
  }
  const convolver = ctx.createConvolver();
  convolver.buffer = impulse;
  return convolver;
}

/** One celesta / music-box note: pure partials, sharp attack, long fade. */
function celestaNote(
  ctx: AudioContext,
  dest: AudioNode,
  echo: AudioNode | null,
  freq: number,
  when = 0,
  level = 1
) {
  const now = ctx.currentTime + when;
  const pan = ctx.createStereoPanner();
  pan.pan.value = Math.random() * 1.2 - 0.6;
  pan.connect(dest);
  if (echo) pan.connect(echo);

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
 * A bell strike built from an inharmonic partial stack. `humDecay` is the
 * ring of the lowest partial; higher partials die progressively faster.
 * `partialCount` trims the stack for small bright bells and chimes.
 */
function strikeBell(
  ctx: AudioContext,
  dest: AudioNode,
  fundamental: number,
  level: number,
  humDecay: number,
  when = 0,
  partialCount: number = BELL_RATIOS.length,
  withClick = false
) {
  const now = ctx.currentTime + when;
  const pan = ctx.createStereoPanner();
  pan.pan.value = Math.random() * 0.9 - 0.45;
  pan.connect(dest);

  for (let i = 0; i < partialCount; i++) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = fundamental * BELL_RATIOS[i] * (1 + (Math.random() - 0.5) * 0.004);
    const amp = level * BELL_LEVELS[i];
    const decay = Math.max(0.4, humDecay * BELL_DECAYS[i]);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(amp, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);
    osc.connect(gain);
    gain.connect(pan);
    osc.start(now);
    osc.stop(now + decay + 0.2);
  }

  if (withClick) {
    /* the clapper's first touch: a breath of band-passed noise */
    const buffer = makeNoiseBuffer(ctx, 0.05, false);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = fundamental * 3.2;
    filter.Q.value = 1.2;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(level * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(pan);
    source.start(now);
  }
}

/* ---------------------------------------------------------- scape shell */

type Scape = { gain: GainNode; dispose(): void };

/**
 * Every soundscape is built inside a shell: one output gain (used for
 * crossfades), a self-cleaning random-interval scheduler, and a registry
 * of looping sources so dispose() truly silences and frees everything.
 */
function createShell(ctx: AudioContext, master: GainNode) {
  const out = ctx.createGain();
  out.gain.value = 0;
  out.connect(master);

  let disposed = false;
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const loops: AudioScheduledSourceNode[] = [];

  const after = (ms: number, fn: () => void) => {
    const timer = setTimeout(() => {
      timers.delete(timer);
      if (!disposed) fn();
    }, ms);
    timers.add(timer);
  };

  const every = (minMs: number, maxMs: number, fn: () => void) => {
    const tick = () => {
      after(minMs + Math.random() * (maxMs - minMs), () => {
        fn();
        tick();
      });
    };
    tick();
  };

  const keep = <T extends AudioScheduledSourceNode>(source: T): T => {
    loops.push(source);
    return source;
  };

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    timers.forEach(clearTimeout);
    timers.clear();
    for (const source of loops) {
      try {
        source.stop();
      } catch {
        /* already stopped */
      }
    }
    out.disconnect();
  };

  return { out, after, every, keep, dispose };
}

type Shell = ReturnType<typeof createShell>;

/* ------------------------------------------------- scape 1: the library */

function buildLibrary(ctx: AudioContext, shell: Shell) {
  const out = shell.out;

  /* room tone: brown noise, low-passed, breathing via a slow LFO */
  const noise = shell.keep(ctx.createBufferSource());
  noise.buffer = makeNoiseBuffer(ctx, 4, true);
  noise.loop = true;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "lowpass";
  noiseFilter.frequency.value = 360;

  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.42;

  const lfo = shell.keep(ctx.createOscillator());
  lfo.frequency.value = 0.035;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.13;
  lfo.connect(lfoGain);
  lfoGain.connect(noiseGain.gain);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(out);
  noise.start();
  lfo.start();

  /* drone: deep, slightly detuned pair on A — the tonic of the celesta */
  const droneFilter = ctx.createBiquadFilter();
  droneFilter.type = "lowpass";
  droneFilter.frequency.value = 200;
  droneFilter.connect(out);

  const droneA = shell.keep(ctx.createOscillator());
  droneA.type = "sine";
  droneA.frequency.value = 55;
  const gainA = ctx.createGain();
  gainA.gain.value = 0.15;
  droneA.connect(gainA);
  gainA.connect(droneFilter);
  droneA.start();

  const droneB = shell.keep(ctx.createOscillator());
  droneB.type = "triangle";
  droneB.frequency.value = 110.3;
  const gainB = ctx.createGain();
  gainB.gain.value = 0.045;
  droneB.connect(gainB);
  gainB.connect(droneFilter);
  droneB.start();

  /* feedback echo: celesta notes repeat softly, rooms away */
  const echoSend = ctx.createGain();
  echoSend.gain.value = 0.55;
  const delay = ctx.createDelay(2);
  delay.delayTime.value = 0.46;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.42;
  const color = ctx.createBiquadFilter();
  color.type = "lowpass";
  color.frequency.value = 2400;
  echoSend.connect(delay);
  delay.connect(color);
  color.connect(feedback);
  feedback.connect(delay);
  color.connect(out);

  /* a wandering phrase: a short random walk through the scale, sometimes
     dipping an octave, always ending unresolved — a question, not an answer */
  let scaleIndex = 0;
  const playPhrase = () => {
    const length = 3 + Math.floor(Math.random() * 4);
    let step = 0;
    for (let i = 0; i < length; i++) {
      scaleIndex = Math.max(
        0,
        Math.min(SCALE.length - 1, scaleIndex + Math.floor(Math.random() * 5) - 2)
      );
      const octave = Math.random() < 0.22 ? 0.5 : 1;
      celestaNote(
        ctx,
        out,
        echoSend,
        SCALE[scaleIndex] * octave,
        step,
        i === 0 ? 1 : 0.75 + Math.random() * 0.25
      );
      step += 0.42 + Math.random() * 0.3;
    }
  };

  /* a soft paper rustle: a short band-passed noise breath */
  const playRustle = () => {
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
    pan.connect(out);
    source.start();
  };

  shell.after(4000, () => {
    playPhrase();
    shell.every(11000, 28000, playPhrase);
  });
  shell.every(24000, 60000, playRustle);
}

/* ------------------------------------------- scape 2: distant bells */

function buildBells(ctx: AudioContext, shell: Shell) {
  const out = shell.out;

  /* the tower: everything rings through a 5s convolver reverb */
  const reverb = makeReverb(ctx, 5);
  const wet = ctx.createGain();
  wet.gain.value = 0.6;
  reverb.connect(wet);
  wet.connect(out);

  /* strikes feed both the dry room and the tower */
  const strikeBus = ctx.createGain();
  strikeBus.gain.value = 1;
  const dry = ctx.createGain();
  dry.gain.value = 0.45;
  strikeBus.connect(dry);
  dry.connect(out);
  strikeBus.connect(reverb);

  /* deep drone bed: a slow-beating pair on C, with faint air above */
  const droneFilter = ctx.createBiquadFilter();
  droneFilter.type = "lowpass";
  droneFilter.frequency.value = 160;
  droneFilter.connect(out);
  const droneSend = ctx.createGain();
  droneSend.gain.value = 0.3;
  droneFilter.connect(droneSend);
  droneSend.connect(reverb);

  const droneA = shell.keep(ctx.createOscillator());
  droneA.type = "sine";
  droneA.frequency.value = 65.4;
  const gainA = ctx.createGain();
  gainA.gain.value = 0.11;
  droneA.connect(gainA);
  gainA.connect(droneFilter);
  droneA.start();

  const droneB = shell.keep(ctx.createOscillator());
  droneB.type = "sine";
  droneB.frequency.value = 65.85;
  const gainB = ctx.createGain();
  gainB.gain.value = 0.07;
  droneB.connect(gainB);
  gainB.connect(droneFilter);
  droneB.start();

  const air = shell.keep(ctx.createBufferSource());
  air.buffer = makeNoiseBuffer(ctx, 4, true);
  air.loop = true;
  const airFilter = ctx.createBiquadFilter();
  airFilter.type = "lowpass";
  airFilter.frequency.value = 240;
  const airGain = ctx.createGain();
  airGain.gain.value = 0.12;
  air.connect(airFilter);
  airFilter.connect(airGain);
  airGain.connect(out);
  air.start();

  /* deep tolls: hum partial rings 8-12s; sometimes the bell swings twice */
  const FUNDAMENTALS = [65.4, 73.4, 82.4, 98];
  const toll = () => {
    const fundamental = FUNDAMENTALS[Math.floor(Math.random() * FUNDAMENTALS.length)];
    const level = 0.22 + Math.random() * 0.1;
    const humDecay = 8 + Math.random() * 4;
    strikeBell(ctx, strikeBus, fundamental, level, humDecay, 0, BELL_RATIOS.length, true);
    if (Math.random() < 0.4) {
      strikeBell(
        ctx,
        strikeBus,
        fundamental,
        level * 0.7,
        humDecay * 0.85,
        1.6 + Math.random() * 0.9,
        BELL_RATIOS.length,
        true
      );
    }
  };

  /* high shimmer bells: quiet 2-4 kHz partials, almost imagined */
  const shimmer = () => {
    const fundamental = 1600 + Math.random() * 900;
    strikeBell(ctx, strikeBus, fundamental, 0.02 + Math.random() * 0.012, 3 + Math.random() * 2, 0, 4);
  };

  shell.after(2500 + Math.random() * 3500, toll);
  shell.every(14000, 40000, toll);
  shell.every(18000, 45000, shimmer);
}

/* ------------------------------------------- scape 3: cellar winds */

function buildWind(ctx: AudioContext, shell: Shell) {
  const out = shell.out;

  /* wind: band-passed noise whose center wanders between 300 and 900 Hz */
  const wind = shell.keep(ctx.createBufferSource());
  wind.buffer = makeNoiseBuffer(ctx, 4, false);
  wind.loop = true;

  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 600;
  band.Q.value = 0.9;

  const windGain = ctx.createGain();
  windGain.gain.value = 0.16;

  const wander = shell.keep(ctx.createOscillator());
  wander.frequency.value = 0.03;
  const wanderDepth = ctx.createGain();
  wanderDepth.gain.value = 280;
  wander.connect(wanderDepth);
  wanderDepth.connect(band.frequency);

  const gust = shell.keep(ctx.createOscillator());
  gust.frequency.value = 0.012;
  const gustDepth = ctx.createGain();
  gustDepth.gain.value = 0.08;
  gust.connect(gustDepth);
  gustDepth.connect(windGain.gain);

  wind.connect(band);
  band.connect(windGain);
  windGain.connect(out);
  wind.start();
  wander.start();
  gust.start();

  /* sub drone: the building itself, humming below hearing's edge */
  const subFilter = ctx.createBiquadFilter();
  subFilter.type = "lowpass";
  subFilter.frequency.value = 120;
  subFilter.connect(out);

  const subA = shell.keep(ctx.createOscillator());
  subA.type = "sine";
  subA.frequency.value = 48;
  const subGainA = ctx.createGain();
  subGainA.gain.value = 0.13;
  subA.connect(subGainA);
  subGainA.connect(subFilter);
  subA.start();

  const subB = shell.keep(ctx.createOscillator());
  subB.type = "sine";
  subB.frequency.value = 48.4;
  const subGainB = ctx.createGain();
  subGainB.gain.value = 0.05;
  subB.connect(subGainB);
  subGainB.connect(subFilter);
  subB.start();

  /* distant wind chimes: small bright bells stirred in 2-5 note gusts */
  const chimeBus = ctx.createGain();
  chimeBus.gain.value = 1;
  chimeBus.connect(out);

  const echoSend = ctx.createGain();
  echoSend.gain.value = 0.5;
  const delay = ctx.createDelay(2);
  delay.delayTime.value = 0.38;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.45;
  const color = ctx.createBiquadFilter();
  color.type = "lowpass";
  color.frequency.value = 3200;
  chimeBus.connect(echoSend);
  echoSend.connect(delay);
  delay.connect(color);
  color.connect(feedback);
  feedback.connect(delay);
  color.connect(out);

  const CHIMES = [1975.5, 2217.5, 2637, 2959.9, 3322.4];
  const chimeGust = () => {
    const count = 2 + Math.floor(Math.random() * 4);
    let when = 0;
    for (let i = 0; i < count; i++) {
      const note = CHIMES[Math.floor(Math.random() * CHIMES.length)];
      strikeBell(ctx, chimeBus, note, 0.014 + Math.random() * 0.016, 1.6 + Math.random() * 1.2, when, 3);
      when += 0.12 + Math.random() * 0.35;
    }
  };

  shell.after(5000 + Math.random() * 4000, chimeGust);
  shell.every(12000, 30000, chimeGust);
}

/* ------------------------------------------- scape 4: rain on windows */

function buildRain(ctx: AudioContext, shell: Shell) {
  const out = shell.out;

  /* patter: high-passed noise at low gain, breathing in slow waves */
  const patter = shell.keep(ctx.createBufferSource());
  patter.buffer = makeNoiseBuffer(ctx, 4, false);
  patter.loop = true;

  const highpass = ctx.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 4000;

  const soften = ctx.createBiquadFilter();
  soften.type = "lowpass";
  soften.frequency.value = 8500;

  const patterGain = ctx.createGain();
  patterGain.gain.value = 0.045;

  const wave = shell.keep(ctx.createOscillator());
  wave.frequency.value = 0.07;
  const waveDepth = ctx.createGain();
  waveDepth.gain.value = 0.012;
  wave.connect(waveDepth);
  waveDepth.connect(patterGain.gain);

  patter.connect(highpass);
  highpass.connect(soften);
  soften.connect(patterGain);
  patterGain.connect(out);
  patter.start();
  wave.start();

  /* single droplets finding the glass */
  const droplet = () => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    const freq = 2600 + Math.random() * 2600;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.55, now + 0.05);
    const gain = ctx.createGain();
    const decay = 0.05 + Math.random() * 0.06;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.006 + Math.random() * 0.012, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);
    const pan = ctx.createStereoPanner();
    pan.pan.value = Math.random() * 1.4 - 0.7;
    osc.connect(gain);
    gain.connect(pan);
    pan.connect(out);
    osc.start(now);
    osc.stop(now + decay + 0.05);
  };

  /* distant thunder: a low-passed noise swell, more felt than heard */
  const thunder = () => {
    const now = ctx.currentTime;
    const source = ctx.createBufferSource();
    source.buffer = makeNoiseBuffer(ctx, 4, true);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 100 + Math.random() * 60;
    const gain = ctx.createGain();
    const attack = 0.8 + Math.random() * 1.0;
    const release = 3 + Math.random() * 3;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.12 + Math.random() * 0.08, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + attack + release);
    const pan = ctx.createStereoPanner();
    pan.pan.value = Math.random() * 0.8 - 0.4;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(pan);
    pan.connect(out);
    source.start(now);
    source.stop(now + attack + release + 0.2);
  };

  /* rare muted celesta: a note remembered through a closed door */
  const muted = ctx.createBiquadFilter();
  muted.type = "lowpass";
  muted.frequency.value = 1100;
  muted.connect(out);
  const mutedNotes = () => {
    const count = 1 + Math.floor(Math.random() * 2);
    let when = 0;
    for (let i = 0; i < count; i++) {
      celestaNote(ctx, muted, null, SCALE[Math.floor(Math.random() * SCALE.length)] * 0.5, when, 0.5);
      when += 0.5 + Math.random() * 0.4;
    }
  };

  shell.every(180, 900, droplet);
  shell.every(20000, 60000, thunder);
  shell.every(25000, 65000, mutedNotes);
}

/* --------------------------------------------------------- the engine */

export class Ambience {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private fx: GainNode | null = null;
  private fxEcho: GainNode | null = null;
  private current: Scape | null = null;
  private currentId: SoundscapeId | null = null;
  private scapeId: SoundscapeId = "library";
  private stopped = true;
  private volume = 0.6;
  private sleepTimer: ReturnType<typeof setTimeout> | null = null;

  get playing() {
    return !this.stopped;
  }

  get scape(): SoundscapeId {
    return this.scapeId;
  }

  setVolume(volume: number) {
    this.volume = volume;
    if (this.ctx) {
      if (this.master && !this.stopped) {
        this.master.gain.setTargetAtTime(volume * 0.5, this.ctx.currentTime, 0.15);
      }
      if (this.fx) {
        this.fx.gain.setTargetAtTime(volume * 0.5, this.ctx.currentTime, 0.15);
      }
    }
  }

  start(volume: number) {
    this.volume = volume;
    this.stopped = false;
    this.ensureContext();
    this.wake();

    if (this.current && this.currentId !== this.scapeId) {
      this.current.dispose();
      this.current = null;
      this.currentId = null;
    }
    if (!this.current) {
      this.current = this.buildScape(this.scapeId);
      this.currentId = this.scapeId;
      this.current.gain.gain.value = 1;
    }

    const ctx = this.ctx!;
    this.master!.gain.setTargetAtTime(volume * 0.5, ctx.currentTime, 1.2);
    this.fx!.gain.setTargetAtTime(volume * 0.5, ctx.currentTime, 0.15);
  }

  stop() {
    this.stopped = true;
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
      this.scheduleSleep(2000);
    }
  }

  /**
   * Choose a soundscape. While playing this crossfades — the old scape's
   * gain rides down, its nodes and timers are torn down, the new one rides
   * up. While off it only records the choice for the next start.
   */
  setScape(id: SoundscapeId) {
    if (id === this.scapeId && this.currentId === id) return;
    this.scapeId = id;

    if (!this.ctx || this.stopped) {
      if (this.current) {
        this.current.dispose();
        this.current = null;
        this.currentId = null;
      }
      return;
    }

    const ctx = this.ctx;
    const old = this.current;
    if (old) {
      old.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.18);
      setTimeout(() => old.dispose(), 1000);
    }

    const next = this.buildScape(id);
    next.gain.gain.setValueAtTime(0, ctx.currentTime);
    next.gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.9);
    this.current = next;
    this.currentId = id;
  }

  /**
   * Public single note — used by the game for catch feedback. Called from
   * a click (a user gesture), so it may lazily create the context and must
   * ring even while the ambience is off, whatever the active scape.
   */
  playChime(note?: number) {
    this.ensureContext();
    this.wake();
    celestaNote(this.ctx!, this.fx!, this.fxEcho, note ?? SCALE[Math.floor(Math.random() * SCALE.length)]);
    if (this.stopped) this.scheduleSleep(6000);
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

  /* ------------------------------------------------------------ internals */

  private ensureContext() {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.ctx.destination);

    /* chime bus: outside the master fade so game chimes ring while off */
    this.fx = this.ctx.createGain();
    this.fx.gain.value = this.volume * 0.5;
    this.fx.connect(this.ctx.destination);

    const send = this.ctx.createGain();
    send.gain.value = 0.55;
    const delay = this.ctx.createDelay(2);
    delay.delayTime.value = 0.46;
    const feedback = this.ctx.createGain();
    feedback.gain.value = 0.42;
    const color = this.ctx.createBiquadFilter();
    color.type = "lowpass";
    color.frequency.value = 2400;
    send.connect(delay);
    delay.connect(color);
    color.connect(feedback);
    feedback.connect(delay);
    color.connect(this.fx);
    this.fxEcho = send;
  }

  private buildScape(id: SoundscapeId): Scape {
    const shell = createShell(this.ctx!, this.master!);
    if (id === "library") buildLibrary(this.ctx!, shell);
    else if (id === "bells") buildBells(this.ctx!, shell);
    else if (id === "wind") buildWind(this.ctx!, shell);
    else buildRain(this.ctx!, shell);
    return { gain: shell.out, dispose: shell.dispose };
  }

  /** After the fade-out settles: free the scape and suspend the context. */
  private scheduleSleep(ms: number) {
    if (this.sleepTimer) clearTimeout(this.sleepTimer);
    this.sleepTimer = setTimeout(() => {
      this.sleepTimer = null;
      if (!this.stopped || !this.ctx) return;
      if (this.current) {
        this.current.dispose();
        this.current = null;
        this.currentId = null;
      }
      void this.ctx.suspend();
    }, ms);
  }

  private wake() {
    if (this.sleepTimer) {
      clearTimeout(this.sleepTimer);
      this.sleepTimer = null;
    }
    if (this.ctx && this.ctx.state === "suspended") void this.ctx.resume();
  }
}

export const ambience = new Ambience();

export const AMBIENCE_STORAGE_KEY = "library-ambience";
