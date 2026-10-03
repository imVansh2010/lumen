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

let lastTick = 0

export const sfx = {
  click() {
    tone(620, 0, 0.06, 'square', 0.03)
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
    tone(659.25, 0, 0.25, 'sine', 0.06)
    tone(987.77, 0.08, 0.3, 'sine', 0.05)
    tone(1318.51, 0.17, 0.36, 'sine', 0.04)
  },
  upload() {
    duckMusic(0.9)
    tone(523.25, 0, 0.08, 'triangle', 0.05)
    tone(783.99, 0.07, 0.1, 'triangle', 0.05)
    tone(1046.5, 0.15, 0.14, 'sine', 0.04)
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
    tone(220, 0, 0.25, 'sine', 0.05, 520)
    tone(660, 0.24, 0.2, 'triangle', 0.05)
  },
  success() {
    duckMusic(1.6)
    ;[392, 523.25, 659.25, 783.99].forEach((f, i) => tone(f, i * 0.09, 0.22, 'triangle', 0.06))
    tone(1046.5, 0.36, 0.4, 'sine', 0.05)
  },
  /** Gentle "not quite" for wrong answers — never scary. */
  nudge() {
    tone(300, 0, 0.14, 'sine', 0.045)
    tone(240, 0.14, 0.18, 'sine', 0.04)
  },
  /** A picture lands in the right crate. */
  sort() {
    duckMusic(0.6)
    tone(523.25, 0, 0.14, 'triangle', 0.05, 880)
    tone(880, 0.14, 0.22, 'sine', 0.045, 1174.66)
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
    tone(523.25 + step * 130.81, 0, 0.22, 'sine', 0.055)
    tone(1046.5 + step * 261.63, 0.06, 0.28, 'sine', 0.03)
  },
  /** A whole station finished — small fanfare. */
  fanfare() {
    duckMusic(1.8)
    ;[392, 523.25, 659.25, 1046.5].forEach((f, i) => tone(f, i * 0.12, 0.3, 'triangle', 0.06))
    tone(1567.98, 0.5, 0.5, 'sine', 0.05)
  },
}

/* -------------------------------- Music ---------------------------------- */

/* The score is written for the *feeling of the game*, not a genre: a quiet sky
   city where a friendly machine is slowly learning to think. So there are no
   drums and no tune to whistle — just a wide, slowly-breathing chord bed, a
   steady "thinking" pulse like a machine quietly counting, and a few glass
   bells for wonder. Hopeful, a little wistful, never busy and never scary. */
const BAR = 5.0
const CHORDS: number[][] = [
  [73.42, 220.0, 277.18, 329.63], // D   — home, open sky
  [61.74, 185.0, 246.94, 293.66], // Bm  — wistful, searching
  [98.0, 196.0, 246.94, 293.66], // G   — warm lift, hope
  [61.74, 164.81, 220.0, 246.94], // Asus — soft tension, pulls back home
]

/* A handful of glass bells per bar, in D major pentatonic. Sparse on purpose:
   the space between the notes is what makes the city feel big. Positions are
   in beats. */
const MOTIF: { at: number; f: number }[][] = [
  [
    { at: 0, f: 587.33 },
    { at: 2, f: 739.99 },
    { at: 3, f: 880.0 },
  ],
  [
    { at: 1, f: 659.25 },
    { at: 2.5, f: 587.33 },
  ],
  [
    { at: 0.5, f: 880.0 },
    { at: 2, f: 739.99 },
    { at: 3.25, f: 987.77 },
  ],
  [
    { at: 1, f: 880.0 },
    { at: 3, f: 587.33 },
  ],
]

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

/** A wide, slowly-breathing pad. Two slightly detuned voices give it a soft
    choral width — that is what makes the sky feel like it is moving. */
function pad(freq: number, t: number, dur: number, vol: number, dest: AudioNode): void {
  const c = ac()
  if (!c || !enabled) return
  const g = c.createGain()
  const filter = c.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 1150
  const voices = [-5, 5]
  const attack = Math.min(2.0, dur * 0.4)
  const release = Math.min(1.7, dur * 0.34)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(vol, t + attack)
  g.gain.setValueAtTime(vol, Math.max(t + attack + 0.05, t + dur - release))
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  filter.connect(g)
  g.connect(dest)
  voices.forEach((detune) => {
    const osc = c.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = freq
    osc.detune.value = detune
    osc.connect(filter)
    osc.start(t)
    osc.stop(t + dur + 0.05)
  })
}

function pluck(freq: number, t: number, dur: number, vol: number, dest: AudioNode): void {
  const c = ac()
  if (!c || !enabled) return
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.03)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g)
  g.connect(dest)
  osc.start(t)
  osc.stop(t + dur + 0.05)
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

/** A single glass bell. A soft sine plus a faster-decaying octave partial gives
    it a clean, icy shimmer without ever sounding like a music box. */
function bell(freq: number, t: number, vol: number, dest: AudioNode): void {
  const c = ac()
  if (!c || !enabled) return
  const dur = 3.6
  const g = c.createGain()
  const partial = c.createGain()
  partial.gain.value = 0.3
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  const base = c.createOscillator()
  base.type = 'sine'
  base.frequency.value = freq
  const octave = c.createOscillator()
  octave.type = 'sine'
  octave.frequency.value = freq * 2.01
  base.connect(g)
  octave.connect(partial)
  partial.connect(g)
  g.connect(dest)
  base.start(t)
  octave.start(t)
  base.stop(t + dur + 0.05)
  octave.stop(t + dur + 0.05)
}

/** The thinking pulse: a very soft, even blip on the beat — Echo quietly
    ticking over. Almost subliminal, but it is what makes the loop feel alive. */
function tick(t: number, vol: number, dest: AudioNode): void {
  const c = ac()
  if (!c || !enabled) return
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = 'sine'
  osc.frequency.value = 1567.98
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.005)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15)
  osc.connect(g)
  g.connect(dest)
  osc.start(t)
  osc.stop(t + 0.19)
}

/** A slow breath of filtered air under each bar, so the sky never feels static. */
function wind(t: number, dur: number, vol: number, dest: AudioNode): void {
  const c = ac()
  const buf = noise()
  if (!c || !buf || !enabled) return
  const src = c.createBufferSource()
  src.buffer = buf
  src.loop = true
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 650
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(vol, t + dur * 0.45)
  g.gain.linearRampToValueAtTime(0.0001, t + dur)
  src.connect(lp)
  lp.connect(g)
  g.connect(dest)
  src.start(t)
  src.stop(t + dur + 0.05)
}

function scheduleBar(bar: number, t: number, dest: AudioNode): void {
  const chord = CHORDS[bar % CHORDS.length]
  const beat = BAR / 4

  // One wide, slowly-breathing chord holds the whole bar — smooth and weightless,
  // with the low root carried a touch louder so it still feels grounded.
  chord.forEach((f, i) => pad(f, t, BAR + 1.3, i === 0 ? 0.028 : 0.012, dest))
  wind(t, BAR * 0.95, 0.005, dest)

  // A soft low thumb on the downbeat, just enough to give the bar a heartbeat.
  pluck(chord[0], t, 2.4, 0.03, dest)

  // The thinking pulse — four even, almost-subliminal blips per bar.
  for (let i = 0; i < 4; i++) tick(t + i * beat, i % 2 === 0 ? 0.007 : 0.0045, dest)

  // A few glass bells for wonder, sparse and ringing out over the pad.
  MOTIF[bar % MOTIF.length].forEach(({ at, f }) => bell(f, t + at * beat, 0.02, dest))

  // On the tense bar, a quiet ascending run of data clicks, like the city
  // thinking through the problem and finding its way home.
  if (bar % 4 === 3) {
    const run = [587.33, 659.25, 739.99, 880.0, 987.77, 1174.66]
    run.forEach((f, i) => pluck(f, t + beat * (2.5 + i * 0.22), 1.4, 0.008, dest))
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
