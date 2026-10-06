import type { Mood } from '../../story/types'

interface Props {
  mood?: Mood
  /** px number or a CSS length (use rem so the orb follows the global scale). */
  size?: number | string
  className?: string
}

interface Look {
  /** Thin rim light along the shell — the lunar edge. */
  rim: string
  /** Iris and instrument rings. */
  iris: string
  /** Soft bloom around the whole core. */
  glow: string
  /** The aperture slit at the centre. */
  pupil: string
  /** How far the iris blades open, in SVG radius units (0-50). */
  aperture: number
  /** Aperture slit size, in SVG units. */
  pupilW: number
  pupilH: number
}

/* Echo is no longer a bright, smiling moon. She is a deep, polished observation
   core: a dark glass sphere with a thin rim light, a mechanical iris where a
   face would be, and two counter-rotating instrument rings. She should read as
   a mysterious, intelligent agent — quiet and precise, never a toy, and
   deliberately nothing like Bolt's bright, friendly LED face.

   Mood is carried by the iris (colour, how far it opens, how narrow the slit
   is) and by the rings, never by a drawn expression. */
const LOOKS: Record<string, Look> = {
  calm: {
    rim: 'rgba(156,200,255,0.55)',
    iris: '#9CC8FF',
    glow: 'rgba(156,200,255,0.40)',
    pupil: '#EAF3FF',
    aperture: 24,
    pupilW: 5,
    pupilH: 24,
  },
  happy: {
    rim: 'rgba(214,236,255,0.75)',
    iris: '#CFE6FF',
    glow: 'rgba(160,205,255,0.55)',
    pupil: '#FFFFFF',
    aperture: 28.5,
    pupilW: 6,
    pupilH: 15,
  },
  proud: {
    rim: 'rgba(214,236,255,0.75)',
    iris: '#CFE6FF',
    glow: 'rgba(160,205,255,0.55)',
    pupil: '#FFFFFF',
    aperture: 28.5,
    pupilW: 6,
    pupilH: 15,
  },
  worried: {
    rim: 'rgba(239,68,68,0.5)',
    iris: '#FF9B9B',
    glow: 'rgba(239,68,68,0.34)',
    pupil: '#FFD9D9',
    aperture: 31,
    pupilW: 3.4,
    pupilH: 30,
  },
  glitch: {
    rim: 'rgba(239,68,68,0.85)',
    iris: '#EF4444',
    glow: 'rgba(239,68,68,0.60)',
    pupil: '#FF6B6B',
    aperture: 20,
    pupilW: 5,
    pupilH: 27,
  },
}

/** One instrument ring: a hairline circle with graduated tick marks. It fills
    its positioned wrapper, so it scales exactly with the orb at every size. */
function TickRing({
  color,
  inset,
  duration,
  reverse,
  marks,
}: {
  color: string
  inset: string
  duration: number
  reverse?: boolean
  marks: number
}) {
  return (
    <span
      className="absolute animate-spin"
      style={{
        inset,
        animationDuration: `${duration}s`,
        animationDirection: reverse ? 'reverse' : 'normal',
      }}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
        <circle cx="50" cy="50" r="48" fill="none" stroke={color} strokeWidth="0.7" opacity="0.5" />
        {Array.from({ length: marks }, (_, i) => {
          const long = i % (marks / 4) === 0
          const a = (i / marks) * Math.PI * 2
          const r1 = long ? 41.5 : 45
          return (
            <line
              key={i}
              x1={50 + Math.cos(a) * r1}
              y1={50 + Math.sin(a) * r1}
              x2={50 + Math.cos(a) * 48}
              y2={50 + Math.sin(a) * 48}
              stroke={color}
              strokeWidth={long ? 1.1 : 0.6}
              strokeLinecap="round"
              opacity={long ? 0.85 : 0.45}
            />
          )
        })}
      </svg>
    </span>
  )
}

/** The counter-rotating inner ring — three broken arcs that read as a slowly
    turning aperture housing. */
function ArcRing({ color, inset, duration }: { color: string; inset: string; duration: number }) {
  return (
    <span
      className="absolute animate-spin"
      style={{ inset, animationDuration: `${duration}s`, animationDirection: 'reverse' }}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={color}
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeDasharray="24 20"
          opacity="0.7"
        />
      </svg>
    </span>
  )
}

/** The iris: graduated blades around a central aperture slit. This is Echo's
    gaze, and the slit — not a smile — is what changes with her mood. */
function Iris({ look, glitchy }: { look: Look; glitchy: boolean }) {
  const blades = Array.from({ length: 12 }, (_, i) => i)
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      <circle cx="50" cy="50" r="46" fill="none" stroke={look.iris} strokeWidth="1.1" opacity="0.45" />
      {blades.map((i) => {
        const a = (i / 12) * Math.PI * 2
        return (
          <line
            key={i}
            x1={50 + Math.cos(a) * 45}
            y1={50 + Math.sin(a) * 45}
            x2={50 + Math.cos(a) * (look.aperture - 1.5)}
            y2={50 + Math.sin(a) * (look.aperture - 1.5)}
            stroke={look.iris}
            strokeWidth="0.9"
            strokeLinecap="round"
            opacity="0.7"
          />
        )
      })}
      <circle
        cx="50"
        cy="50"
        r={look.aperture - 1.5}
        fill="none"
        stroke={look.iris}
        strokeWidth="1.3"
        opacity="0.9"
      />
      <rect
        x={50 - look.pupilW / 2}
        y={50 - look.pupilH / 2}
        width={look.pupilW}
        height={look.pupilH}
        rx={look.pupilW / 2}
        fill={look.pupil}
      />
      {glitchy && (
        <rect
          x={50 - look.pupilW / 2 - 4}
          y={50 - look.pupilH / 2 + 4}
          width={look.pupilW}
          height={look.pupilH * 0.55}
          rx={look.pupilW / 2}
          fill={look.pupil}
          opacity="0.55"
        />
      )}
    </svg>
  )
}

export default function EchoOrb({ mood = 'calm', size = 180, className = '' }: Props) {
  const look = LOOKS[mood] ?? LOOKS.calm
  const glitchy = mood === 'glitch'

  return (
    <div
      className={`echo-orb relative shrink-0 ${glitchy ? 'animate-shake' : ''} ${className}`}
      data-mood={mood}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* Soft bloom. Kept inside −22% so the title screen's skyline clearance
          (measured off `.title-echo`) stays valid. */}
      <span
        className="absolute rounded-full blur-2xl"
        style={{
          inset: '-22%',
          background: `radial-gradient(circle, ${look.glow}, transparent 68%)`,
        }}
      />

      {/* Outer graduated ring, slow clockwise */}
      <TickRing color={look.iris} inset="-9%" duration={54} marks={36} />
      {/* Inner arc housing, counter-clockwise */}
      <ArcRing color={look.iris} inset="3%" duration={38} />
      {/* Ambient pulse ring hugging the shell */}
      <span
        className="absolute rounded-full"
        style={{
          inset: '4%',
          border: `1px solid ${look.rim}`,
          opacity: 0.4,
          animation: 'orb-pulse 4.2s ease-in-out infinite',
        }}
      />

      {/* The shell: dark glass, rim-lit, with a faint terminator sweep so the
          surface reads as a slowly turning sphere rather than a flat disc. */}
      <span
        className="absolute overflow-hidden rounded-full"
        style={{
          inset: '12%',
          background:
            'radial-gradient(circle at 34% 28%, rgba(150,185,235,0.30), #0A1730 46%, #04060D 100%)',
          border: `1px solid ${look.rim}`,
          boxShadow: `inset 7px 9px 20px -8px ${look.rim}, inset -10px -12px 26px -10px rgba(0,0,0,0.9), 0 0 26px ${look.glow}`,
        }}
      >
        <span
          className="pointer-events-none absolute inset-x-0 h-1/3"
          style={{
            background: `linear-gradient(to bottom, transparent, ${look.glow}, transparent)`,
            opacity: 0.22,
            animation: 'hud-scan 7.5s ease-in-out infinite',
          }}
        />
      </span>

      {/* The iris — Echo's gaze */}
      <span
        className="absolute"
        style={{ inset: '30%', filter: `drop-shadow(0 0 6px ${look.glow})` }}
      >
        <Iris look={look} glitchy={glitchy} />
      </span>

      {/* Specular point on the shell */}
      <span
        className="absolute rounded-full"
        style={{
          left: '29%',
          top: '23%',
          width: '9%',
          height: '9%',
          background: 'rgba(255,255,255,0.45)',
          filter: 'blur(1px)',
        }}
      />

      {/* A fault bleeds red through the shell while she is glitching */}
      {glitchy && (
        <span
          className="absolute rounded-full mix-blend-screen"
          style={{
            inset: '12%',
            background: 'radial-gradient(circle at 68% 72%, rgba(239,68,68,0.9), transparent 60%)',
            opacity: 0.75,
          }}
        />
      )}
    </div>
  )
}
