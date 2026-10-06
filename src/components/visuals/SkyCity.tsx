import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { cutSeconds, districtAt } from '../../game/blackout'

/* Deterministic pseudo-random so the skyline is stable between renders. */
function mulberry32(seed: number) {
  return function next() {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* The city is authored in a wide "camera" so the towers read as a distant
   skyline instead of giant slabs filling the screen. */
const VIEW_W = 1350
const VIEW_H = 560
/** Where the street sits in that camera — every layer grounds on this line. */
const BASELINE = 545
/** Ceiling for the near skyline: tallest point of a tower, roof gear included. */
const NEAR_H_MAX = 420

interface Light {
  x: number
  y: number
  delay: number
  bright: boolean
}
/** Rooftop clutter: a water tower, an AC plant or a vent stack. */
type RooftopKind = 'tank' | 'ac' | 'vent'
interface Tank {
  x: number
  y: number
  w: number
  h: number
  kind: RooftopKind
}
interface Tower {
  x: number
  w: number
  h: number
  roof: 'flat' | 'spire' | 'dome' | 'antenna'
  delay: number
  lights: Light[]
  /** Rooftop water tanks and vents, so the skyline reads as a lived-in city. */
  tanks: Tank[]
}

interface LayerOptions {
  seed: number
  baseline: number
  wMin: number
  wMax: number
  hMin: number
  hMax: number
  gapMin: number
  gapMax: number
  /** Chance that a grid slot gets a lit window. */
  density: number
  /**
   * Shape of the height distribution: heights run `hMin + (budget-hMin) *
   * rand()^spreadPow`, so `E[rand^p] = 1/(p+1)`. Lower p pushes the mass up
   * (taller average skyline); 1.25 leans short, 1 is flat-uniform.
   */
  spreadPow?: number
}

function buildLayer({
  seed,
  baseline,
  wMin,
  wMax,
  hMin,
  hMax,
  gapMin,
  gapMax,
  density,
  spreadPow = 1.25,
}: LayerOptions): Tower[] {
  /* Two independent streams. The structure stream draws exactly three times
     per tower — width, roof roll, height roll — so it stays in lockstep no
     matter what the height parameters are: changing hMin/hMax/spreadPow
     re-maps the *same* rolls instead of reshuffling every tower downstream.
     (A single interleaved stream fed window/tank draws between height rolls,
     so a "make them taller" parameter change re-rolled the whole city — and
     on the shipped seed the realised average actually fell.) */
  const rand = mulberry32(seed)
  /* Everything decorative — windows, tanks, delays, gaps — lives on its
     own stream so its variable draw count can never disturb the structure. */
  const deco = mulberry32(seed ^ 0x9e3779b9)
  const towers: Tower[] = []
  // Only a sliver of the first and last towers falls outside the frame, so the
  // skyline still bleeds past both edges without lopping a building in half.
  const BLEED = 16
  let x = -BLEED
  while (x < VIEW_W + BLEED) {
    const w = wMin + Math.floor(rand() * (wMax - wMin))
    const roll = rand()
    const roof: Tower['roof'] =
      roll > 0.87 ? 'spire' : roll > 0.74 ? 'dome' : roll > 0.64 ? 'antenna' : 'flat'

    // Scattered heights: a real city has towers of every size standing next to
    // each other, so each tower rolls its own height rather than following a
    // curve that swells in the middle. `spreadPow` shapes the lean (1 = uniform
    // between the floor and the cap, higher = lean toward the short end).
    // Whatever sits on the roof — spire, antenna, dome, water tanks — is
    // charged against the budget first, so the cap holds down the tower's
    // *highest point* and nothing (a red beacon, a dome) pokes above it.
    const roofExtra =
      roof === 'spire' ? 40 : roof === 'antenna' ? 34 : roof === 'dome' ? Math.round(w / 3) : 26
    const budget = Math.max(hMin, hMax - roofExtra)
    const spread = Math.pow(rand(), spreadPow)
    const h = Math.round(hMin + (budget - hMin) * spread)

    /* A dense but cheap window grid: many windows, yet only the `bright` ones
       animate. Steady windows are static fill, so a fuller facade never costs
       hundreds of concurrent opacity animations. */
    const lights: Light[] = []
    const cols = Math.max(2, Math.floor(w / 22))
    const rows = Math.max(2, Math.floor(h / 36))
    /* Cells that already carry a window, so a top-up only ever fills blanks. */
    const taken = new Set<number>()
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (deco() > density) continue
        taken.add(c * rows + r)
        lights.push({
          x: x + (c + 0.5) * (w / cols) - 3.5,
          y: baseline - h + (r + 0.55) * (h / rows),
          delay: deco() * 5,
          // Keep twinkling windows sparse so the sky stays smooth.
          bright: deco() > 0.72,
        })
      }
    }

    /* `density` is only a probability, so an unlucky tower can roll an
       almost bare facade — one or two windows on a whole building reads as
       a rendering bug rather than a skyline. No facade is allowed below 42%
       full: a tower that fell well short gains several windows, one that is
       merely a little patchy gains one or two, and towers at or above the
       floor keep exactly the windows they rolled. The very barest towers are
       guaranteed at least two extra so they never end up as a stray dot.
       The top-up draws from its own stream, so the shared `deco` sequence is
       untouched and every other tower keeps exactly its own windows. */
    const cells = cols * rows
    const frac = lights.length / cells
    const want =
      frac < 0.3
        ? Math.max(lights.length + 2, Math.ceil(cells * 0.42))
        : frac < 0.42
          ? Math.max(lights.length + 1, Math.ceil(cells * 0.42))
          : lights.length
    if (want > lights.length) {
      const fill = mulberry32((seed ^ 0x85ebca6b) + towers.length * 0x9e3779b1)
      const blanks: number[] = []
      for (let i = 0; i < cells; i++) if (!taken.has(i)) blanks.push(i)
      // Fisher–Yates so the extra windows scatter instead of clustering.
      for (let i = blanks.length - 1; i > 0; i--) {
        const j = Math.floor(fill() * (i + 1))
        const tmp = blanks[i]
        blanks[i] = blanks[j]
        blanks[j] = tmp
      }
      const add = Math.min(want - lights.length, blanks.length)
      for (let k = 0; k < add; k++) {
        const cell = blanks[k]
        const c = Math.floor(cell / rows)
        const r = cell % rows
        lights.push({
          x: x + (c + 0.5) * (w / cols) - 3.5,
          y: baseline - h + (r + 0.55) * (h / rows),
          delay: fill() * 5,
          // Top-ups stay steady so the sparse twinkle is preserved.
          bright: false,
        })
      }
    }

    /* Rooftop clutter on flat roofs: water towers, AC plants and vent stacks. */
    const tanks: Tank[] = []
    if (roof === 'flat') {
      const count = deco() > 0.5 ? 2 : deco() > 0.2 ? 1 : 0
      for (let k = 0; k < count; k++) {
        const roll = deco()
        const kind: RooftopKind = roll > 0.66 ? 'tank' : roll > 0.33 ? 'ac' : 'vent'
        const tw = kind === 'vent' ? 9 + Math.floor(deco() * 5) : 14 + Math.floor(deco() * 14)
        const th =
          kind === 'tank'
            ? 20 + Math.floor(deco() * 12)
            : kind === 'ac'
              ? 12 + Math.floor(deco() * 8)
              : 16 + Math.floor(deco() * 10)
        tanks.push({
          x: x + ((k + 0.5) * w) / count - tw / 2,
          y: baseline - h - th,
          w: tw,
          h: th,
          kind,
        })
      }
    }

    towers.push({ x, w, h, roof, delay: deco() * 6, lights, tanks })
    x += w + gapMin + Math.floor(deco() * (gapMax - gapMin))
  }

  // The first and last towers already start/end outside the frame (see BLEED),
  // so no gap lands on the edge. Strip their antennas though: a red antenna
  // dot sliced by the frame edge reads as a stray red rectangle, which is
  // exactly the artefact we want gone.
  const first = towers[0]
  if (first && first.roof === 'antenna') first.roof = 'flat'
  const last = towers[towers.length - 1]
  if (last && last.roof === 'antenna') last.roof = 'flat'

  return towers
}

/** One silhouette layer of towers, drawn in the shared 2000×560 city space. */
/* During the blackout the districts die from left to right, so the skyline is
   split into the same four strips as the district cards and each strip goes
   dark exactly when its district does — the city can never run out of lights
   before the last district has gone. */
function sweepDelay(x: number): string {
  return `${cutSeconds(districtAt(x / VIEW_W)).toFixed(2)}s`
}

function Skyline({
  towers,
  baseline,
  lightsOn,
  tone,
  blackout = false,
}: {
  towers: Tower[]
  baseline: number
  lightsOn: boolean
  tone: 'near' | 'far'
  blackout?: boolean
}) {
  const body = tone === 'near' ? '#081127' : '#061021'
  const edge = tone === 'near' ? '#1A3563' : '#12264C'
  const detail = tone === 'near'

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMax slice"
      className="h-auto w-full"
    >
      {towers.map((t, i) => (
        <g
          key={i}
          style={
            blackout ? { animation: `tower-dark 0.8s ease-out ${sweepDelay(t.x)} both` } : undefined
          }
        >
          <rect
            x={t.x}
            y={baseline - t.h}
            width={t.w}
            height={t.h}
            rx={7}
            fill={body}
            stroke={edge}
            strokeWidth={2}
          />
          {/* Cornice: a slightly wider band at the top so the roof line reads as
              architecture instead of a bare rectangle. */}
          <rect
            x={t.x - 3}
            y={baseline - t.h + 2}
            width={t.w + 6}
            height={9}
            rx={4}
            fill={edge}
            opacity={0.9}
          />
          {t.roof === 'spire' && (
            <path
              d={`M${t.x + t.w / 2 - 4} ${baseline - t.h} L${t.x + t.w / 2} ${baseline - t.h - 40} L${
                t.x + t.w / 2 + 4
              } ${baseline - t.h} Z`}
              fill={edge}
            />
          )}
          {t.roof === 'dome' && (
            <path
              d={`M${t.x} ${baseline - t.h} a ${t.w / 2} ${t.w / 3} 0 0 1 ${t.w} 0 Z`}
              fill="#12264C"
              stroke={edge}
              strokeWidth={2}
            />
          )}
          {t.roof === 'antenna' && (
            <>
              <line
                x1={t.x + t.w / 2}
                y1={baseline - t.h}
                x2={t.x + t.w / 2}
                y2={baseline - t.h - 28}
                stroke={edge}
                strokeWidth={3}
              />
              <circle
                cx={t.x + t.w / 2}
                cy={baseline - t.h - 30}
                r={4}
                fill={lightsOn ? '#EF4444' : '#12264C'}
                style={
                  lightsOn
                    ? { animation: `twinkle 2.2s ease-in-out ${t.delay}s infinite` }
                    : undefined
                }
              />
            </>
          )}{' '}
          {detail &&
            t.tanks.map((tk, k) => {
              if (tk.kind === 'tank') {
                // Water tower: legs, cylinder body and a domed cap.
                return (
                  <g key={`tank-${k}`}>
                    <line
                      x1={tk.x + 3}
                      y1={tk.y + tk.h}
                      x2={tk.x + 3}
                      y2={baseline - t.h + 4}
                      stroke={edge}
                      strokeWidth={2}
                    />
                    <line
                      x1={tk.x + tk.w - 3}
                      y1={tk.y + tk.h}
                      x2={tk.x + tk.w - 3}
                      y2={baseline - t.h + 4}
                      stroke={edge}
                      strokeWidth={2}
                    />
                    <rect
                      x={tk.x}
                      y={tk.y + 4}
                      width={tk.w}
                      height={tk.h - 4}
                      rx={4}
                      fill="#0C1B39"
                      stroke={edge}
                      strokeWidth={2}
                    />
                    <path
                      d={`M${tk.x - 2} ${tk.y + 5} a ${tk.w / 2 + 2} ${tk.w / 2.4} 0 0 1 ${tk.w + 4} 0 Z`}
                      fill="#12264C"
                      stroke={edge}
                      strokeWidth={2}
                    />
                  </g>
                )
              }
              if (tk.kind === 'ac') {
                // AC plant: a squat box with vent louvres.
                return (
                  <g key={`tank-${k}`}>
                    <rect
                      x={tk.x}
                      y={tk.y}
                      width={tk.w}
                      height={tk.h}
                      rx={3}
                      fill="#0C1B39"
                      stroke={edge}
                      strokeWidth={2}
                    />
                    {[0.3, 0.55, 0.8].map((f, li) => (
                      <line
                        key={li}
                        x1={tk.x + 3}
                        y1={tk.y + tk.h * f}
                        x2={tk.x + tk.w - 3}
                        y2={tk.y + tk.h * f}
                        stroke={edge}
                        strokeWidth={1.5}
                        opacity={0.8}
                      />
                    ))}
                  </g>
                )
              }
              // Vent stack: a thin flue with a small cowl.
              return (
                <g key={`tank-${k}`}>
                  <rect
                    x={tk.x}
                    y={tk.y + 4}
                    width={tk.w}
                    height={tk.h - 4}
                    rx={2}
                    fill="#0C1B39"
                    stroke={edge}
                    strokeWidth={2}
                  />
                  <rect
                    x={tk.x - 2}
                    y={tk.y}
                    width={tk.w + 4}
                    height={6}
                    rx={2}
                    fill="#12264C"
                    stroke={edge}
                    strokeWidth={1.5}
                  />
                </g>
              )
            })}
          {t.lights.map((l, j) => (
            <rect
              key={j}
              x={l.x}
              y={l.y}
              width={7}
              height={10}
              rx={2}
              fill={lightsOn ? (l.bright ? '#FFFFFF' : '#9CC8FF') : '#12264C'}
              style={
                lightsOn && l.bright
                  ? { animation: `twinkle ${3 + l.delay / 2}s ease-in-out ${l.delay}s infinite` }
                  : undefined
              }
            />
          ))}
        </g>
      ))}

      {/* Elevated walkways linking towers whose gap is narrow enough */}
      {detail &&
        towers.map((t, i) => {
          const next = towers[i + 1]
          if (!next) return null
          const gap = next.x - (t.x + t.w)
          if (gap <= 4 || gap > 30) return null
          const y = baseline - Math.min(t.h, next.h) * 0.58
          return (
            <g key={`bridge-${i}`} opacity={lightsOn ? 1 : 0.5}>
              <rect
                x={t.x + t.w}
                y={y}
                width={gap}
                height={11}
                fill="#0C1B39"
                stroke={edge}
                strokeWidth={1.5}
              />
              <line
                x1={t.x + t.w}
                y1={y + 5.5}
                x2={next.x}
                y2={y + 5.5}
                stroke={lightsOn ? '#9CC8FF' : '#12264C'}
                strokeWidth={1.5}
                opacity={0.45}
              />
            </g>
          )
        })}
    </svg>
  )
}

function Cloud({
  top,
  left,
  scale,
  duration,
  delay,
  opacity,
  sway,
}: {
  top: string
  /** Fixed, evenly-spread anchor so the sky stays balanced. */
  left: string
  scale: number
  duration: number
  delay: number
  opacity: number
  /** How far this cloud sways, in px. */
  sway: number
}) {
  return (
    <div
      className="pointer-events-none absolute"
      style={
        {
          top,
          left,
          transform: `scale(${scale})`,
          opacity,
          '--sway': `${sway}px`,
          animation: `cloud-sway ${duration}s ease-in-out ${delay}s infinite`,
          width: '13.75rem',
        } as CSSProperties
      }
    >
      <div className="relative h-14 w-52">
        <div className="absolute left-0 top-4 h-9 w-24 rounded-full bg-white/10 blur-[6px]" />
        <div className="absolute left-12 top-0 h-14 w-28 rounded-full bg-white/10 blur-[8px]" />
        <div className="absolute left-28 top-5 h-9 w-24 rounded-full bg-white/10 blur-[6px]" />
      </div>
    </div>
  )
}

function Aurora() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute -top-24 left-0 h-[70%] w-[140%] blur-2xl"
        style={{
          background:
            'linear-gradient(100deg, transparent, rgba(124,199,255,0.28), rgba(239,68,68,0.12), transparent)',
          animation: 'aurora-sway 16s ease-in-out infinite',
        }}
      />
      <div
        className="absolute -top-10 left-0 h-[55%] w-[150%] blur-3xl"
        style={{
          background: 'linear-gradient(80deg, transparent, rgba(156,200,255,0.22), transparent)',
          animation: 'aurora-sway 22s ease-in-out 2s infinite reverse',
        }}
      />
    </div>
  )
}

/* A shooting star: a glowing head drags a fading tail along its path.
   `dx`/`dy` are in vw so the fall is proportional at every viewport, and the
   angle is derived from them so the streak always lies exactly along its
   direction of travel — head leading, tail behind. Each star streaks once
   when it is spawned; ShootingStars unmounts it afterwards. */
function ShootingStar({
  top,
  left,
  dx,
  dy,
  duration,
}: {
  top: string
  left: string
  dx: number
  dy: number
  /** Seconds the streak takes to cross the sky. */
  duration: number
}) {
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI
  return (
    <div
      className="pointer-events-none absolute"
      style={
        {
          top,
          left,
          animation: `shoot ${duration}s linear forwards`,
          '--dx': `${dx}vw`,
          '--dy': `${dy}vw`,
        } as CSSProperties
      }
      aria-hidden
    >
      <span
        className="relative block h-[1.5px] w-[clamp(48px,6vw,130px)]"
        style={{ transform: `rotate(${angle}deg)` }}
      >
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'linear-gradient(90deg, rgba(156,200,255,0) 0%, rgba(156,200,255,0.6) 55%, rgba(255,255,255,0.95) 100%)',
          }}
        />
        <span
          className="absolute -right-[3px] top-1/2 h-[5px] w-[5px] -translate-y-1/2 rounded-full bg-white"
          style={{ boxShadow: '0 0 8px 2px rgba(156,200,255,0.7)' }}
        />
      </span>
    </div>
  )
}

/* One randomly thrown star: born in an outer quarter of the sky and sent
   only *further outwards* — so it can never cross the centre column where
   Echo floats on the title screen, or where the cast stands on stage. */
function makeShot(id: number) {
  const fromLeft = Math.random() < 0.5
  const duration = 1.4 + Math.random() * 1.4
  return {
    id,
    top: `${2 + Math.random() * 18}%`,
    left: fromLeft ? `${2 + Math.random() * 28}%` : `${70 + Math.random() * 28}%`,
    dx: (fromLeft ? -1 : 1) * (16 + Math.random() * 10),
    dy: 8 + Math.random() * 7,
    duration,
    /** Unmount just past the end of the streak — it is invisible by then. */
    removeAfter: duration * 1000 + 400,
  }
}

/* Shooting stars on a random schedule: every few seconds a star is born at a
   fresh spot, streaks once, and is removed. Nothing loops, so the sky never
   repeats the same pattern. */
function ShootingStars() {
  const [shots, setShots] = useState<ReturnType<typeof makeShot>[]>([])

  useEffect(() => {
    let nextId = 0
    const timers = new Set<number>()

    const schedule = (gapMs: number) => {
      timers.add(
        window.setTimeout(() => {
          const shot = makeShot(nextId++)
          setShots((s) => [...s, shot])
          timers.add(
            window.setTimeout(() => {
              setShots((s) => s.filter((x) => x.id !== shot.id))
            }, shot.removeAfter),
          )
          // Often enough to catch one, rare enough that each still feels
          // like a small event.
          schedule(4000 + Math.random() * 6000)
        }, gapMs),
      )
    }
    // The first one shows up quickly, but never at a fixed moment.
    schedule(2000 + Math.random() * 4000)

    return () => {
      for (const t of timers) window.clearTimeout(t)
    }
  }, [])

  return (
    <>
      {shots.map((s) => (
        <ShootingStar
          key={s.id}
          top={s.top}
          left={s.left}
          dx={s.dx}
          dy={s.dy}
          duration={s.duration}
        />
      ))}
    </>
  )
}

/* The skyline is sized off the window *width*, so on a wide, short window the
   whole city scales up and its towers climb into Echo. Measure how much room
   is really left under her and squash the block from the ground up by exactly
   that much — on a normal screen the factor is 1 and nothing moves. */
function useSkylineFit(tallest: number): number {
  const [fit, setFit] = useState(1)

  useEffect(() => {
    const measure = () => {
      const w = Math.max(window.innerWidth, 900) // the block is min-w-[900px]
      const vh = window.innerHeight
      // Height of the tallest rooftop above the bottom of the window, in px.
      const rise = (w / VIEW_W) * (VIEW_H - BASELINE + tallest)
      // On the title screen Echo rides inside the centred text column, so her
      // bottom edge moves with the root font-size and the window height —
      // measure it instead of guessing a constant: leave room for the orb's
      // glow (inset −24% + a 40px blur + the float animation, ≈ 60px past the
      // box) plus a little breathing space — the headroom the old fixed
      // constant (320px vs Echo's bottom at ≈ 222px) used to give.
      // Stage screens have no `.title-echo`; they fall back to the old tuned
      // constants (the cast sits well below them there).
      const echo = document.querySelector('.title-echo')
      const clearOf = echo ? echo.getBoundingClientRect().bottom + 80 : vh <= 720 ? 240 : 320
      setFit(Math.min(1, Math.max(0.55, (vh - clearOf) / rise)))
    }

    measure()
    // Watch the document itself rather than trusting `resize`: the stage is
    // what actually changes size, and this catches every path that can move it
    // (window resizes, panel splits, browser-chrome show/hide, zoom).
    const observer = new ResizeObserver(measure)
    observer.observe(document.documentElement)
    window.addEventListener('resize', measure)
    // The web fonts change the height of the centred title column — and with
    // it Echo's bottom edge — after first paint, so re-measure once the real
    // fonts are in. Otherwise the clearance is computed against fallback text.
    document.fonts?.ready.then(measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [tallest])

  return fit
}

export default function SkyCity({
  lightsOn = true,
  blackout = false,
}: {
  lightsOn?: boolean
  /** Plays the left-to-right power-down sweep. */
  blackout?: boolean
}) {
  // Far layer: smaller, dimmer towers sitting higher up the skyline.
  const far = useMemo(
    () =>
      buildLayer({
        seed: 4242,
        baseline: BASELINE,
        wMin: 34,
        wMax: 78,
        hMin: 125,
        hMax: 320,
        // Nearly touching so the far layer always backs up a gap in the near
        // skyline — a busy backdrop reads as depth, never as empty sky.
        gapMin: 2,
        gapMax: 5,
        density: 0.44,
        spreadPow: 1.15,
      }),
    [],
  )

  // Near layer: the skyline you read first.
  const near = useMemo(
    () =>
      buildLayer({
        seed: 20260930,
        baseline: BASELINE,
        wMin: 46,
        wMax: 118,
        hMin: 150,
        // Ceiling for the whole tower, roof gear included. Tall enough to fill
        // the frame on a normal screen; useSkylineFit squashes the block on
        // wide, short windows where the same towers would climb into Echo.
        hMax: NEAR_H_MAX,
        gapMin: 9,
        gapMax: 30,
        density: 0.5,
        // Uniform roll (p = 1) between the floor and the roof-charged budget:
        // on the shipped seed it lands the average tower at 292 (was 260 with
        // the old short-leaning p = 1.25 over a lower range) — visibly taller
        // on average while low-rise streetfront still stands at hMin.
        spreadPow: 1,
      }),
    [],
  )

  const stars = useMemo(() => {
    const rand = mulberry32(77)
    return Array.from({ length: 110 }, () => ({
      x: rand() * 100,
      y: rand() * 58,
      size: 1 + rand() * 2,
      delay: rand() * 5,
    }))
  }, [])

  const fit = useSkylineFit(NEAR_H_MAX)

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Deep night sky — kept dark so white text stays readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900 via-navy-950 to-navy-950" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(1200px 700px at 72% 8%, rgba(36,70,127,0.4), transparent 62%)',
        }}
      />

      {/* Stars */}
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            animation: `twinkle ${2.5 + s.delay}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}

      {/* Aurora */}
      <Aurora />
      {/* Shooting stars — see ShootingStars: one every few seconds, at a
          fresh spot each time. */}
      <ShootingStars />

      {/* Clouds — evenly spread across the sky, kept to the outer bands so the
          centre stays clear where Echo and the cast float. */}
      <Cloud top="22%" left="4%" scale={1.1} duration={52} delay={0} opacity={0.5} sway={30} />
      <Cloud top="36%" left="20%" scale={0.8} duration={68} delay={-14} opacity={0.38} sway={22} />
      <Cloud top="16%" left="72%" scale={1.3} duration={80} delay={-40} opacity={0.32} sway={34} />
      <Cloud top="40%" left="82%" scale={0.65} duration={60} delay={-30} opacity={0.28} sway={18} />

      {/* Skyline — the wrapper keeps the authored aspect ratio, so the city is
          never cropped or zoomed past its natural scale. */}
      <div className="absolute inset-x-0 bottom-0 flex justify-center overflow-hidden">
        <div
          className="relative w-full min-w-[900px]"
          style={{ transform: `scaleY(${fit})`, transformOrigin: 'bottom center' }}
        >
          {/* Far skyline sits behind the near towers and grounds into the same
              street level, so nothing appears to float. */}
          <div className="absolute inset-x-0 bottom-0 opacity-80">
            <Skyline
              towers={far}
              baseline={BASELINE}
              lightsOn={lightsOn}
              tone="far"
              blackout={blackout}
            />
          </div>
          {/* near towers define the height of the whole city block */}
          <div className="relative">
            <Skyline
              towers={near}
              baseline={BASELINE}
              lightsOn={lightsOn}
              tone="near"
              blackout={blackout}
            />
          </div>
          {/* Ground haze so the towers melt into the night */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy-950 to-transparent" />
        </div>
      </div>
    </div>
  )
}
