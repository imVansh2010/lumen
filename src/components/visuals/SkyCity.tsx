import { useEffect, useMemo, useState } from 'react'
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
const NEAR_H_MAX = 370

/* Neon palette for the rooftop signs dotted across downtown. */
const SIGN_COLORS = ['#9CC8FF', '#FFB3C7', '#FFE08A', '#8BE0C8']

interface Light {
  x: number
  y: number
  delay: number
  bright: boolean
}
interface Tank {
  x: number
  y: number
  w: number
  h: number
}
interface Sign {
  x: number
  y: number
  w: number
  h: number
  color: string
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
  /** An illuminated sign on some downtown towers. */
  sign?: Sign
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
}: LayerOptions): Tower[] {
  const rand = mulberry32(seed)
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
    // curve that swells in the middle. The lean towards the short end keeps
    // most of the street low and only a few towers reaching up.
    // Whatever sits on the roof — spire, antenna, dome, water tanks — is
    // charged against the budget first, so the cap holds down the tower's
    // *highest point* and nothing (a red beacon, a dome) pokes above it.
    const roofExtra =
      roof === 'spire' ? 40 : roof === 'antenna' ? 34 : roof === 'dome' ? Math.round(w / 3) : 26
    const budget = Math.max(hMin, hMax - roofExtra)
    const spread = Math.pow(rand(), 1.25)
    const h = Math.round(hMin + (budget - hMin) * spread)

    const lights: Light[] = []
    const cols = Math.max(2, Math.floor(w / 26))
    const rows = Math.max(2, Math.floor(h / 44))
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (rand() > density) continue
        lights.push({
          x: x + (c + 0.5) * (w / cols) - 3.5,
          y: baseline - h + (r + 0.55) * (h / rows),
          delay: rand() * 5,
          bright: rand() > 0.42,
        })
      }
    }

    /* Rooftop clutter: a couple of water tanks / vents on the flat roofs. */
    const tanks: Tank[] = []
    if (roof === 'flat') {
      const count = rand() > 0.5 ? 2 : rand() > 0.2 ? 1 : 0
      for (let k = 0; k < count; k++) {
        const tw = 12 + Math.floor(rand() * 12)
        const th = 10 + Math.floor(rand() * 16)
        tanks.push({
          x: x + ((k + 0.5) * w) / count - tw / 2,
          y: baseline - h - th,
          w: tw,
          h: th,
        })
      }
    }

    /* The occasional glowing sign on the face of a tower. */
    const sign: Sign | undefined =
      rand() > 0.72
        ? {
            x: x + w * 0.16,
            y: baseline - h + Math.max(16, h * 0.16),
            w: w * 0.68,
            h: 24,
            color: SIGN_COLORS[Math.floor(rand() * SIGN_COLORS.length)],
          }
        : undefined

    towers.push({ x, w, h, roof, delay: rand() * 6, lights, tanks, sign })
    x += w + gapMin + Math.floor(rand() * (gapMax - gapMin))
  }

  // The first and last towers already start/end outside the frame (see BLEED),
  // so no gap lands on the edge. Strip their rooftop signs and antennas though:
  // a glowing sign or red antenna dot sliced by the frame edge reads as a
  // stray red rectangle, which is exactly the artefact we want gone.
  const first = towers[0]
  if (first) {
    first.sign = undefined
    if (first.roof === 'antenna') first.roof = 'flat'
  }
  const last = towers[towers.length - 1]
  if (last) {
    last.sign = undefined
    if (last.roof === 'antenna') last.roof = 'flat'
  }

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
          )}
          {detail &&
            t.tanks.map((tk, k) => (
              <rect
                key={`tank-${k}`}
                x={tk.x}
                y={tk.y}
                width={tk.w}
                height={tk.h}
                rx={3}
                fill="#0C1B39"
                stroke={edge}
                strokeWidth={2}
              />
            ))}
          {detail && t.sign && (
            <g
              style={
                lightsOn
                  ? { animation: `twinkle ${4 + t.delay}s ease-in-out ${t.delay}s infinite` }
                  : undefined
              }
            >
              <rect
                x={t.sign.x}
                y={t.sign.y}
                width={t.sign.w}
                height={t.sign.h}
                rx={5}
                fill="#081127"
                stroke={t.sign.color}
                strokeWidth={2}
                opacity={lightsOn ? 0.95 : 0.4}
              />
              <line
                x1={t.sign.x + 6}
                y1={t.sign.y + 8}
                x2={t.sign.x + t.sign.w - 6}
                y2={t.sign.y + 8}
                stroke={t.sign.color}
                strokeWidth={3}
                strokeLinecap="round"
                opacity={0.85}
              />
              <line
                x1={t.sign.x + 6}
                y1={t.sign.y + 16}
                x2={t.sign.x + t.sign.w * 0.6}
                y2={t.sign.y + 16}
                stroke={t.sign.color}
                strokeWidth={3}
                strokeLinecap="round"
                opacity={0.55}
              />
            </g>
          )}
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
                lightsOn
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
  scale,
  duration,
  delay,
  opacity,
}: {
  top: string
  scale: number
  duration: number
  delay: number
  opacity: number
}) {
  return (
    <div
      className="pointer-events-none absolute left-0"
      style={{
        top,
        transform: `scale(${scale})`,
        opacity,
        animation: `drift ${duration}s linear ${delay}s infinite`,
        width: '220px',
      }}
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

function ShootingStar({ top, left, delay }: { top: string; left: string; delay: number }) {
  return (
    <div className="pointer-events-none absolute" style={{ top, left }} aria-hidden>
      <span
        className="block h-0.5 w-24 rounded-full bg-gradient-to-r from-transparent via-white to-white"
        style={{ animation: `shoot 9s ease-in ${delay}s infinite` }}
      />
    </div>
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
      // Echo's glow stops about this far down the stage; the short-window rule
      // shrinks the cast first, so she sits higher there (see index.css).
      const clearOf = vh <= 720 ? 240 : 320
      setFit(Math.min(1, Math.max(0.55, (vh - clearOf) / rise)))
    }

    measure()
    // Watch the document itself rather than trusting `resize`: the stage is
    // what actually changes size, and this catches every path that can move it
    // (window resizes, panel splits, browser-chrome show/hide, zoom).
    const observer = new ResizeObserver(measure)
    observer.observe(document.documentElement)
    window.addEventListener('resize', measure)
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
        hMin: 105,
        hMax: 300,
        // Nearly touching so the far layer always backs up a gap in the near
        // skyline — a busy backdrop reads as depth, never as empty sky.
        gapMin: 2,
        gapMax: 5,
        density: 0.5,
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
        hMin: 130,
        // Ceiling for the whole tower, roof gear included. Tall enough to fill
        // the frame on a normal screen; useSkylineFit squashes the block on
        // wide, short windows where the same towers would climb into Echo.
        hMax: NEAR_H_MAX,
        gapMin: 9,
        gapMax: 30,
        density: 0.62,
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
      <ShootingStar top="14%" left="58%" delay={1} />
      <ShootingStar top="8%" left="82%" delay={6} />

      {/* Clouds */}
      <Cloud top="24%" scale={1.1} duration={52} delay={0} opacity={0.5} />
      <Cloud top="36%" scale={0.8} duration={68} delay={-14} opacity={0.38} />
      <Cloud top="44%" scale={1.3} duration={80} delay={-40} opacity={0.32} />
      <Cloud top="18%" scale={0.65} duration={60} delay={-30} opacity={0.28} />

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
