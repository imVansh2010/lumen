import type { Mood } from '../../story/types'

interface Props {
  mood?: Mood
  size?: number
  className?: string
}

interface Look {
  core: string
  ring: string
  glow: string
}

const LOOKS: Record<string, Look> = {
  calm: { core: '#9CC8FF', ring: 'rgba(156,200,255,0.5)', glow: 'rgba(156,200,255,0.45)' },
  happy: { core: '#FFFFFF', ring: 'rgba(255,255,255,0.65)', glow: 'rgba(255,255,255,0.6)' },
  worried: { core: '#FFC9C9', ring: 'rgba(239,68,68,0.55)', glow: 'rgba(239,68,68,0.4)' },
  glitch: { core: '#EF4444', ring: 'rgba(239,68,68,0.8)', glow: 'rgba(239,68,68,0.7)' },
}

function Face({ mood }: { mood: Mood }) {
  const stroke = '#050B1A'
  if (mood === 'glitch') {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
        <path
          d="M26 34 l16 14 M42 34 l-16 14"
          stroke={stroke}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M58 34 l16 14 M74 34 l-16 14"
          stroke={stroke}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M30 70 l10 -6 l10 6 l10 -6 l10 6"
          stroke={stroke}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  if (mood === 'worried') {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
        <circle cx="34" cy="40" r="6" fill={stroke} />
        <circle cx="66" cy="40" r="6" fill={stroke} />
        <path
          d="M32 72 q18 -14 36 0"
          stroke={stroke}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  if (mood === 'happy' || mood === 'proud') {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
        <path
          d="M26 42 q8 -10 16 0"
          stroke={stroke}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M58 42 q8 -10 16 0"
          stroke={stroke}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M32 62 q18 20 36 0"
          stroke={stroke}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      <circle cx="34" cy="40" r="6" fill={stroke} />
      <circle cx="66" cy="40" r="6" fill={stroke} />
      <path
        d="M34 68 q16 12 32 0"
        stroke={stroke}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function EchoOrb({ mood = 'calm', size = 180, className = '' }: Props) {
  const look = LOOKS[mood] ?? LOOKS.calm
  const glitchy = mood === 'glitch'

  return (
    <div
      className={`relative ${glitchy ? 'animate-shake' : ''} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* Pulsing rings */}
      <span
        className="absolute inset-0 rounded-full border-2"
        style={{ borderColor: look.ring, animation: 'orb-pulse 3.4s ease-in-out infinite' }}
      />
      <span
        className="absolute rounded-full border"
        style={{
          inset: '-16%',
          borderColor: look.ring,
          opacity: 0.5,
          animation: 'orb-pulse 3.4s ease-in-out 0.4s infinite',
        }}
      />
      {/* Glow */}
      <span
        className="absolute inset-[-24%] rounded-full blur-2xl"
        style={{ background: `radial-gradient(circle, ${look.glow}, transparent 70%)` }}
      />
      {/* Core */}
      <span
        className="absolute rounded-full"
        style={{
          inset: '14%',
          background: `radial-gradient(circle at 35% 30%, #FFFFFF, ${look.core} 55%, #0C1B39 100%)`,
          boxShadow: `0 0 30px ${look.glow}`,
        }}
      />
      {/* Face */}
      <span className="absolute" style={{ inset: '30%' }}>
        <Face mood={mood} />
      </span>
      {glitchy && (
        <span
          className="absolute rounded-full mix-blend-screen"
          style={{
            inset: '14%',
            background: `radial-gradient(circle at 65% 70%, rgba(156,200,255,0.9), transparent 60%)`,
            opacity: 0.7,
          }}
        />
      )}
    </div>
  )
}
