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

/* The score for a mind running flat out. Lumen is still a cold, enormous
   machine-city, but now it is sprinting: a driving 128 BPM pulse, a pumped
   synth bass on the offbeats, a bright sixteenth-note arpeggio climbing the
   same open harmony, and crisp hats over it all. Every sound is synthesized —
   there are no asset files. */

/** 128 BPM, four beats to the bar: fast enough to feel urgent, not frantic. */
const BAR = 1.875
/** Sixteenth-note grid inside one bar — the arpeggio and hats run on this. */
const STEP = BAR / 16
/** One beat, used to place the kick and the bell motif. */
const BEAT = BAR / 4

/* Open, add9-ish voicings: fifths and added seconds left unresolved so the
   harmony reads vast rather than sentimental. The low voice is the root an
   octave below the pad. */
const CHORDS: number[][] = [
  [73.42, 220.0, 329.63, 369.99, 554.37], // Dmaj9  — home, open sky
  [61.74, 185.0, 246.94, 277.18, 440.0], // Bm9    — searching, unsettled
  [98.0, 196.0, 246.94, 293.66, 392.0], // Gmaj9  — lift, resolve outward
  [55.0, 164.81, 246.94, 329.63, 415.3], // Asus   — suspension, pulls home
]

/* The signature FM bells still ring out over the drive, but the space between
   them is tighter now. Positions are in beats; `v` is that note's own level. */
const MOTIF: { at: number; f: number; v: number }[][] = [
  [
    { at: 0, f: 587.33, v: 0.016 },
    { at: 1.5, f: 739.99, v: 0.012 },
    { at: 2.5, f: 880.0, v: 0.014 },
    { at: 3.25, f: 1174.66, v: 0.01 },
  ],
  [
    { at: 0.75, f: 659.25, v: 0.013 },
    { at: 2, f: 587.33, v: 0.011 },
    { at: 3, f: 987.77, v: 0.011 },
  ],
  [
    { at: 0.5, f: 880.0, v: 0.014 },
    { at: 1.75, f: 739.99, v: 0.012 },
    { at: 3.25, f: 1318.51, v: 0.009 },
  ],
  [
    { at: 1, f: 880.0, v: 0.013 },
    { at: 2.25, f: 587.33, v: 0.011 },
    { at: 3.5, f: 739.99, v: 0.01 },
  ],
]

/* The groove: a four-on-the-floor kick, offbeat hats (the last one opened), and
   a fixed sixteenth-note arpeggio shape that climbs the bar's chord and folds
   back. The shape indices point into that bar's ARP_TONES. */
const KICK_STEPS = [0, 4, 8, 12]
const HAT_STEPS = [2, 6, 10, 14]
const OPEN_HAT_STEPS = new Set([14])
const ARP_SHAPE = [0, 2, 4, 3, 1, 3, 4, 2, 0, 2, 4, 3, 5, 4, 2, 1]

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

/** The pulse under everything: a sine that drops from a click to a sub thump.
    Short on purpose so it drives the tempo instead of booming over it. */
function kick(t: number, vol: number, dest: AudioNode): void {
  const c = ac()
  if (!c || !enabled) return
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(150, t)
  osc.frequency.exponentialRampToValueAtTime(46, t + 0.11)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.006)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24)
  osc.connect(g)
  g.connect(dest)
  osc.start(t)
  osc.stop(t + 0.28)
}

/** Crisp high noise — closed by default, sizzling open on the last offbeat. */
function hat(t: number, vol: number, dest: AudioNode, open = false): void {
  const c = ac()
  const buf = noise()
  if (!c || !buf || !enabled) return
  const src = c.createBufferSource()
  src.buffer = buf
  src.loop = true
  const hp = c.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 7200
  const g = c.createGain()
  const dur = open ? 0.14 : 0.028
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.003)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(hp)
  hp.connect(g)
  g.connect(dest)
  src.start(t)
  src.stop(t + dur + 0.03)
}

/** Synth bass: a saw through a lowpass that closes as the note decays, with a
    fast attack so the offbeat notes punch instead of blurring together. */
function bass(freq: number, t: number, dur: number, vol: number, dest: AudioNode): void {
  const c = ac()
  if (!c || !enabled) return
  const osc = c.createOscillator()
  const filter = c.createBiquadFilter()
  const g = c.createGain()
  osc.type = 'sawtooth'
  osc.frequency.value = freq
  filter.type = 'lowpass'
  filter.Q.value = 4
  filter.frequency.setValueAtTime(1000, t)
  filter.frequency.exponentialRampToValueAtTime(280, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(filter)
  filter.connect(g)
  g.connect(dest)
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

/** The arpeggio voice: a square through a snappy lowpass, so it cuts through
    without having to be loud. Bright and unmistakably synthetic. */
function lead(freq: number, t: number, dur: number, vol: number, dest: AudioNode): void {
  const c = ac()
  if (!c || !enabled) return
  const osc = c.createOscillator()
  const filter = c.createBiquadFilter()
  const g = c.createGain()
  osc.type = 'square'
  osc.frequency.setValueAtTime(freq, t)
  filter.type = 'lowpass'
  filter.Q.value = 5
  filter.frequency.setValueAtTime(3600, t)
  filter.frequency.exponentialRampToValueAtTime(1100, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.006)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(filter)
  filter.connect(g)
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

  // Foundation: a shorter sub keeps the weight without dragging the tempo, and
  // the detuned pads still open the space behind the drive.
  subDrone(chord[0], t, BAR + 0.5, 0.022, dest)
  chord.slice(1).forEach((f, i) => pad(f, t, BAR + 0.4, i === 0 ? 0.013 : 0.0075, dest))

  // The engine: four-on-the-floor kick and offbeat hats.
  KICK_STEPS.forEach((s, i) => kick(t + s * STEP, i === 0 ? 0.095 : 0.08, dest))
  HAT_STEPS.forEach((s) =>
    hat(t + s * STEP, OPEN_HAT_STEPS.has(s) ? 0.017 : 0.012, dest, OPEN_HAT_STEPS.has(s)),
  )

  // Pumped bass on the offbeats, root and fifth trading for motion.
  bass(chord[0], t, BAR * 0.44, 0.03, dest)
  bass(chord[0] * 1.5, t + BAR * 0.5, BAR * 0.44, 0.026, dest)

  // The arpeggio: one lead note per sixteenth, climbing the bar's chord tones.
  // This is what makes the city feel like it is sprinting.
  const tones = [chord[0] * 2, chord[1], chord[2], chord[3], chord[4], chord[4] * 2]
  ARP_SHAPE.forEach((idx, s) => {
    lead(tones[idx % tones.length], t + s * STEP, STEP * 1.7, 0.011, dest)
  })

  // The motif: FM bells still ringing out over the drive.
  MOTIF[bar % MOTIF.length].forEach(({ at, f, v }) => fmBell(f, t + at * BEAT, v, dest))

  // Every other bar, one low inharmonic blip as a distant sonar ping — the
  // world noticing something. Kept rare so it always lands.
  if (bar % 2 === 0) fmBell(chord[0] * 2, t + 0.06, 0.011, dest, 3.5, 340)

  // Phrase-closing lift: the arpeggio breaks into a fast rising run under a
  // single swell, like the system finding the answer at full speed.
  if (bar % 4 === 3) {
    const run = [587.33, 659.25, 739.99, 880.0, 987.77, 1174.66, 1318.51, 1567.98]
    run.forEach((f, i) => lead(f, t + BEAT * (2.0 + i * 0.12), 0.22, 0.013, dest))
    swell(t + BAR * 0.4, BAR * 0.55, 0.012, dest, 400, 5200)
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
