/* Tiny WebAudio engine — every sound is synthesized, no asset files. */

let ctx: AudioContext | null = null
let enabled = true
let master: GainNode | null = null

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/** Call from a real user gesture so the browser lets audio play. */
export function unlockAudio(): void {
  ac()
}

function out(): GainNode | null {
  const c = ac()
  if (!c) return null
  if (!master) {
    master = c.createGain()
    master.gain.value = 1
    master.connect(c.destination)
  }
  return master
}

export function setAudioEnabled(v: boolean): void {
  enabled = v
  if (!v) stopMusic()
}

/* --------------------------------- SFX ----------------------------------- */

function tone(
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType,
  vol = 0.06,
  glideTo?: number,
): void {
  const c = ac()
  const dest = out()
  if (!c || !dest || !enabled) return
  const t0 = c.currentTime + start
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, glideTo), t0 + dur)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g)
  g.connect(dest)
  osc.start(t0)
  osc.stop(t0 + dur + 0.05)
}

/** A burst of filtered noise — relays clacking, wires fizzing, or a low rumble. */
function noiseHit(
  start: number,
  dur: number,
  vol: number,
  freq: number,
  type: BiquadFilterType = 'bandpass',
): void {
  const c = ac()
  const dest = out()
  const buf = noise()
  if (!c || !dest || !buf || !enabled) return
  const t0 = c.currentTime + start
  const src = c.createBufferSource()
  src.buffer = buf
  src.loop = true
  const filter = c.createBiquadFilter()
  filter.type = type
  filter.frequency.value = freq
  filter.Q.value = 1.2
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.03)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  src.connect(filter)
  filter.connect(g)
  g.connect(dest)
  src.start(t0)
  src.stop(t0 + dur + 0.05)
}

/** A cold, glassy strain: a sine with a lightly detuned octave partial on top,
    so a UI cue reads as synthetic rather than as a nursery chime. */
function glassTone(freq: number, start: number, dur: number, vol: number): void {
  tone(freq, start, dur, 'sine', vol)
  tone(freq * 2.01, start, Math.max(0.06, dur * 0.6), 'sine', vol * 0.3)
}

let lastTick = 0

export const sfx = {
  click() {
    tone(760, 0, 0.045, 'square', 0.022)
    tone(1520, 0.008, 0.05, 'sine', 0.013)
  },
  /** Soft keys tick while the story types itself out (throttled). */
  type() {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
    if (now - lastTick < 32) return
    lastTick = now
    tone(1150 + Math.random() * 320, 0, 0.038, 'triangle', 0.075)
  },
  whoosh() {
    duckMusic(0.7)
    tone(180, 0, 0.35, 'sine', 0.05, 520)
    tone(240, 0.05, 0.3, 'triangle', 0.03, 640)
  },
  chime() {
    duckMusic(1.0)
    glassTone(587.33, 0, 0.3, 0.05)
    glassTone(880.0, 0.09, 0.34, 0.04)
    glassTone(1174.66, 0.18, 0.4, 0.03)
  },
  upload() {
    duckMusic(0.9)
    glassTone(587.33, 0, 0.09, 0.045)
    glassTone(880.0, 0.07, 0.11, 0.042)
    glassTone(1174.66, 0.15, 0.16, 0.034)
  },
  alarm() {
    duckMusic(0.9)
    tone(300, 0, 0.16, 'sawtooth', 0.045, 180)
    tone(300, 0.22, 0.16, 'sawtooth', 0.045, 180)
  },
  /** The whole grid giving out under Echo: the mains groan and sag for a long,
      heavy few seconds, then everything lands on one deep, final thud. */
  blackout() {
    duckMusic(3.4)
    // a short circuit fizz as the wrong line is cut
    noiseHit(0, 0.6, 0.055, 2600)
    // the mains hum sags away — two detuned voices sliding down together
    tone(196, 0, 2.6, 'sawtooth', 0.05, 42)
    tone(197.5, 0.04, 2.7, 'sawtooth', 0.035, 40)
    tone(98, 0.08, 2.9, 'triangle', 0.045, 30)
    tone(49, 0.14, 3.1, 'sine', 0.09, 24)
    // a low rumble rolls underneath, then the last light drops
    noiseHit(0.2, 2.4, 0.03, 220, 'lowpass')
    tone(58, 2.1, 1.0, 'sine', 0.09, 26)
  },
  boot() {
    duckMusic(1.0)
    // a low servo winding up, then one clean glass strike as the unit comes on
    tone(150, 0, 0.34, 'sawtooth', 0.03, 560)
    tone(75, 0.02, 0.36, 'sine', 0.05, 280)
    glassTone(660, 0.26, 0.3, 0.045)
  },
  success() {
    duckMusic(1.6)
    // open fifths rather than a major arpeggio — lifted, not nursery-bright
    ;[587.33, 880.0, 1174.66].forEach((f, i) => glassTone(f, i * 0.1, 0.26, 0.05))
    glassTone(1567.98, 0.34, 0.44, 0.038)
  },
  /** Gentle "not quite" for wrong answers — never scary. */
  nudge() {
    tone(300, 0, 0.14, 'sine', 0.045)
    tone(240, 0.14, 0.18, 'sine', 0.04)
  },
  /** A picture lands in the right crate. */
  sort() {
    duckMusic(0.6)
    tone(660, 0, 0.08, 'triangle', 0.04, 990)
    glassTone(990, 0.09, 0.26, 0.045)
  },
  /** District 0-3 shutting down, left to right: a relay clacks, the line drains
      away, and each district lands a little lower and heavier than the last. */
  powerDown(step = 0) {
    duckMusic(2.8)
    const base = 300 - step * 42
    noiseHit(0, 0.18, 0.06, 900) // relay clack
    tone(base, 0.02, 1.0, 'sawtooth', 0.05, 46 + step)
    tone(base * 0.5, 0.05, 1.2, 'triangle', 0.045, 32)
    tone(64 - step * 5, 0.45, 1.2, 'sine', 0.09, 26) // deep thud as it dies
  },
  /** One light coming back on — brighter for each light in a district. */
  lightOn(step = 0) {
    glassTone(587.33 + step * 146.83, 0, 0.26, 0.05)
    glassTone(1174.66 + step * 293.66, 0.05, 0.3, 0.028)
  },
  /** A whole station finished — small fanfare. */
  fanfare() {
    duckMusic(1.8)
    ;[587.33, 880.0, 1174.66].forEach((f, i) => glassTone(f, i * 0.12, 0.32, 0.05))
    glassTone(1760.0, 0.46, 0.55, 0.034)
  },
}

/* -------------------------------- Music ---------------------------------- */

/* The score is written for the *feeling of the world*, not a genre. Lumen is a
   cold, enormous machine-city that is quietly thinking, so the bed is built
   from evolving textures rather than a tune: a deep sub drone that never sits
   still, wide detuned pads, a dry 16-step "processing" grid ticking like a
   system working through a task, and a sparse FM-bell motif for the
   intelligence watching it all. Deliberately no drums, no arpeggio chase and
   no theremin glide — this future is calm and precise, not cartoon sci-fi. */

/** Slow enough that each chord is a place you sit in, not a beat you tap. */
const BAR = 4.8
/** Sixteenth-note grid inside one bar — the machine's processing pulse. */
const STEP = BAR / 16

/* Open, add9-ish voicings: fifths and added seconds left unresolved so the
   harmony reads vast rather than sentimental. The low voice is the root an
   octave below the pad. */
const CHORDS: number[][] = [
  [73.42, 220.0, 329.63, 369.99, 554.37], // Dmaj9  — home, open sky
  [61.74, 185.0, 246.94, 277.18, 440.0], // Bm9    — searching, unsettled
  [98.0, 196.0, 246.94, 293.66, 392.0], // Gmaj9  — lift, resolve outward
  [55.0, 164.81, 246.94, 329.63, 415.3], // Asus   — suspension, pulls home
]

/* The signature: a few FM bells per bar in D major pentatonic, sparse on
   purpose — the silence between them is what makes the city feel big.
   Positions are in beats; `v` is that note's own level. */
const MOTIF: { at: number; f: number; v: number }[][] = [
  [
    { at: 0, f: 587.33, v: 0.02 },
    { at: 2.5, f: 739.99, v: 0.014 },
    { at: 3.5, f: 880.0, v: 0.017 },
  ],
  [
    { at: 1, f: 659.25, v: 0.016 },
    { at: 3, f: 587.33, v: 0.013 },
  ],
  [
    { at: 0.5, f: 880.0, v: 0.017 },
    { at: 2, f: 739.99, v: 0.014 },
    { at: 3.25, f: 987.77, v: 0.012 },
  ],
  [
    { at: 1, f: 880.0, v: 0.015 },
    { at: 2.75, f: 587.33, v: 0.012 },
  ],
]

/* Which of the sixteen steps carry the dry processing tick — a regular count
   with an accent on the downbeat and the midpoint. */
const PULSE_STEPS = [0, 2, 4, 6, 8, 10, 12, 14]
const PULSE_ACCENT = new Set([0, 8])

interface Music {
  gain: GainNode
  timer: number
  nextBarTime: number
  bar: number
}
let music: Music | null = null

/* The music is a bed under the story, never the main event, so it sits well
   back and eases even further down for stings and for typed-out dialogue. */
const MUSIC_FULL = 0.36
const MUSIC_DUCK = MUSIC_FULL * 0.3
const MUSIC_HUSH = MUSIC_FULL * 0.16

/** Eases the music down while a bigger sound plays, then swells it back. */
export function duckMusic(seconds = 1.2, level = MUSIC_DUCK): void {
  if (!music || !ctx) return
  const now = ctx.currentTime
  const p = music.gain.gain
  p.cancelScheduledValues(now)
  p.setValueAtTime(p.value, now)
  p.linearRampToValueAtTime(level, now + 0.12)
  p.setValueAtTime(level, now + seconds)
  p.linearRampToValueAtTime(MUSIC_FULL, now + seconds + 0.8)
}

/** Holds the music down for as long as needed (e.g. a line typing itself out). */
export function hushMusic(level = MUSIC_HUSH): void {
  if (!music || !ctx) return
  const now = ctx.currentTime
  const p = music.gain.gain
  p.cancelScheduledValues(now)
  p.setValueAtTime(p.value, now)
  p.linearRampToValueAtTime(level, now + 0.25)
}

/** Brings the music back to full after `hushMusic`. */
export function clearHush(): void {
  if (!music || !ctx) return
  const now = ctx.currentTime
  const p = music.gain.gain
  p.cancelScheduledValues(now)
  p.setValueAtTime(p.value, now)
  p.linearRampToValueAtTime(MUSIC_FULL, now + 0.7)
}

/** A wide, cold pad. Two slightly detuned triangle voices per note through a
    gentle lowpass: the shimmer between the detunes keeps the space alive
    without any melody doing the work. */
function pad(freq: number, t: number, dur: number, vol: number, dest: AudioNode): void {
  const c = ac()
  if (!c || !enabled) return
  const g = c.createGain()
  const filter = c.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 900
  filter.Q.value = 0.7
  const attack = Math.min(2.6, dur * 0.42)
  const release = Math.min(2.0, dur * 0.34)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(vol, t + attack)
  g.gain.setValueAtTime(vol, Math.max(t + attack + 0.05, t + dur - release))
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  filter.connect(g)
  g.connect(dest)
  ;[-7, 7].forEach((detune) => {
    const osc = c.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = freq
    osc.detune.value = detune
    osc.connect(filter)
    osc.start(t)
    osc.stop(t + dur + 0.05)
  })
}

/** The floor of the mix: two detuned saws behind a lowpass whose cutoff drifts
    on a very slow LFO. It never plays a riff — it just breathes, so the world
    underneath never feels static. */
function subDrone(freq: number, t: number, dur: number, vol: number, dest: AudioNode): void {
  const c = ac()
  if (!c || !enabled) return
  const g = c.createGain()
  const filter = c.createBiquadFilter()
  filter.type = 'lowpass'
  filter.Q.value = 2.4
  filter.frequency.setValueAtTime(160, t)
  filter.frequency.linearRampToValueAtTime(320, t + dur * 0.5)
  filter.frequency.linearRampToValueAtTime(150, t + dur)
  const lfo = c.createOscillator()
  const lfoGain = c.createGain()
  lfo.type = 'sine'
  lfo.frequency.value = 0.055
  lfoGain.gain.value = 70
  lfo.connect(lfoGain)
  lfoGain.connect(filter.frequency)
  const attack = Math.min(3.0, dur * 0.45)
  const release = Math.min(2.2, dur * 0.32)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(vol, t + attack)
  g.gain.setValueAtTime(vol, Math.max(t + attack + 0.05, t + dur - release))
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  filter.connect(g)
  g.connect(dest)
  ;[-4, 4].forEach((detune) => {
    const osc = c.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = freq
    osc.detune.value = detune
    osc.connect(filter)
    osc.start(t)
    osc.stop(t + dur + 0.05)
  })
  lfo.start(t)
  lfo.stop(t + dur + 0.05)
}

let noiseBuffer: AudioBuffer | null = null
function noise(): AudioBuffer | null {
  const c = ac()
  if (!c) return null
  if (!noiseBuffer) {
    const len = Math.floor(c.sampleRate * 0.5)
    noiseBuffer = c.createBuffer(1, len, c.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  }
  return noiseBuffer
}

/** An FM bell: a sine carrier whose frequency is pushed by a fast sine
    modulator, with the modulation index decaying so the strike is metallic and
    the tail rings pure. Glassy and unmistakably synthetic — the score's
    signature timbre, never a music box. */
function fmBell(
  freq: number,
  t: number,
  vol: number,
  dest: AudioNode,
  ratio = 2.01,
  index = 240,
): void {
  const c = ac()
  if (!c || !enabled) return
  const dur = 3.2
  const carrier = c.createOscillator()
  const modulator = c.createOscillator()
  const modGain = c.createGain()
  const g = c.createGain()
  carrier.type = 'sine'
  carrier.frequency.value = freq
  modulator.type = 'sine'
  modulator.frequency.value = freq * ratio
  modGain.gain.setValueAtTime(index, t)
  modGain.gain.exponentialRampToValueAtTime(1, t + 0.5)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.015)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  modulator.connect(modGain)
  modGain.connect(carrier.frequency)
  carrier.connect(g)
  g.connect(dest)
  carrier.start(t)
  modulator.start(t)
  carrier.stop(t + dur + 0.05)
  modulator.stop(t + dur + 0.05)
}

/** The processing pulse: a dry, bandpassed click on the grid, with no low end
    at all. It reads as a system stepping through work, not as percussion. */
function pulse(t: number, vol: number, dest: AudioNode, accent = false): void {
  const c = ac()
  const buf = noise()
  if (!c || !buf || !enabled) return
  const src = c.createBufferSource()
  src.buffer = buf
  src.loop = true
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = accent ? 2400 : 3200
  bp.Q.value = 6
  const g = c.createGain()
  const dur = accent ? 0.06 : 0.035
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.004)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(bp)
  bp.connect(g)
  g.connect(dest)
  src.start(t)
  src.stop(t + dur + 0.03)
}

/** A short digital pluck: a sine with a fast decay and a small downward pitch
    drop. Precise — no body, no reverb. */
function pluck(freq: number, t: number, dur: number, vol: number, dest: AudioNode): void {
  const c = ac()
  if (!c || !enabled) return
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq, t)
  osc.frequency.exponentialRampToValueAtTime(freq * 0.985, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g)
  g.connect(dest)
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

/** A filtered-noise swell whose band climbs as it opens. Used once per phrase
    as a transition, never as a "whoosh" effect. */
function swell(
  t: number,
  dur: number,
  vol: number,
  dest: AudioNode,
  from: number,
  to: number,
): void {
  const c = ac()
  const buf = noise()
  if (!c || !buf || !enabled) return
  const src = c.createBufferSource()
  src.buffer = buf
  src.loop = true
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.Q.value = 1.1
  bp.frequency.setValueAtTime(from, t)
  bp.frequency.exponentialRampToValueAtTime(to, t + dur)
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(vol, t + dur * 0.7)
  g.gain.linearRampToValueAtTime(0.0001, t + dur)
  src.connect(bp)
  bp.connect(g)
  g.connect(dest)
  src.start(t)
  src.stop(t + dur + 0.05)
}

function scheduleBar(bar: number, t: number, dest: AudioNode): void {
  const chord = CHORDS[bar % CHORDS.length]
  const beat = BAR / 4

  // Foundation: the sub drone grounds the bar, the detuned pads open the space.
  subDrone(chord[0], t, BAR + 1.8, 0.026, dest)
  chord.slice(1).forEach((f, i) => pad(f, t, BAR + 1.3, i === 0 ? 0.016 : 0.0085, dest))

  // The processing grid: a dry count across the bar. Quiet enough to be felt
  // more than heard, so it never turns into a beat to dance to.
  PULSE_STEPS.forEach((s) =>
    pulse(t + s * STEP, PULSE_ACCENT.has(s) ? 0.0075 : 0.0035, dest, PULSE_ACCENT.has(s)),
  )

  // The motif: sparse FM bells ringing out over the pads.
  MOTIF[bar % MOTIF.length].forEach(({ at, f, v }) => fmBell(f, t + at * beat, v, dest))

  // Every other bar, one low inharmonic blip as a distant sonar ping — the
  // world noticing something. Kept rare so it always lands.
  if (bar % 2 === 0) fmBell(chord[0] * 2, t + 0.06, 0.012, dest, 3.5, 340)

  // Resolving run on the phrase-closing bar: a short rising sequence of dry
  // digital plucks, like the system working a problem and finding the answer,
  // under a single gentle swell. This is the score's own signature.
  if (bar % 4 === 3) {
    const run = [587.33, 659.25, 739.99, 880.0, 987.77, 1174.66]
    run.forEach((f, i) => pluck(f, t + beat * (2.0 + i * 0.24), 1.3, 0.0085, dest))
    swell(t + BAR * 0.35, BAR * 0.62, 0.011, dest, 260, 3600)
  }
}

export function startMusic(): void {
  const c = ac()
  const dest = out()
  if (!c || !dest || !enabled || music) return
  const gain = c.createGain()
  gain.gain.value = MUSIC_FULL
  gain.connect(dest)
  music = { gain, timer: 0, nextBarTime: c.currentTime + 0.12, bar: 0 }

  const schedule = () => {
    if (!music || !ctx) return
    // If the tab was throttled or the context resumed late, don't dump a pile
    // of bars into the past — jump forward to now.
    if (music.nextBarTime < ctx.currentTime) music.nextBarTime = ctx.currentTime + 0.08
    while (music.nextBarTime < ctx.currentTime + 1.3) {
      scheduleBar(music.bar, music.nextBarTime, music.gain)
      music.bar += 1
      music.nextBarTime += BAR
    }
  }

  schedule()
  music.timer = window.setInterval(schedule, 300)
}

export function stopMusic(): void {
  if (!music || !ctx) return
  const current = music
  const now = ctx.currentTime
  current.gain.gain.cancelScheduledValues(now)
  current.gain.gain.setValueAtTime(current.gain.gain.value, now)
  current.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8)
  window.clearInterval(current.timer)
  music = null
  window.setTimeout(() => {
    try {
      current.gain.disconnect()
    } catch {
      /* already disconnected */
    }
  }, 1200)
}
