import type { Mood } from '../../story/types'

interface Props {
  mood?: Mood
  /** px number or a CSS length (use rem so Bolt follows the global scale). */
  size?: number | string
  waving?: boolean
  className?: string
}

/* A clean composite-shell training unit: near-white panels with navy edges,
   a dark visor screen and a single red power core. No cardboard, no tape. */
const SHELL = '#E8EEF6'
const SHELL_SHADE = '#C3D2E6'
const EDGE = '#24467F'
const SCREEN = '#050B1A'

function LedFace({ mood }: { mood: Mood }) {
  const glow = mood === 'glitch' || mood === 'worried' ? '#FFC9C9' : '#9CC8FF'
  const stroke = glow
  if (mood === 'happy' || mood === 'proud') {
    return (
      <g
        stroke={stroke}
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
      >
        <path d="M76 58 q8 -12 16 0" />
        <path d="M108 58 q8 -12 16 0" />
        <path d="M86 74 q14 16 28 0" />
      </g>
    )
  }
  if (mood === 'worried') {
    return (
      <g
        stroke={stroke}
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
      >
        <circle cx="84" cy="58" r="6" fill={stroke} stroke="none" />
        <circle cx="116" cy="58" r="6" fill={stroke} stroke="none" />
        <path d="M84 78 q10 -8 20 0 q10 8 20 0" />
      </g>
    )
  }
  if (mood === 'blank') {
    return (
      <g
        stroke={stroke}
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
      >
        <circle cx="84" cy="56" r="7" />
        <circle cx="116" cy="56" r="7" />
        <path d="M94 76 h12" />
      </g>
    )
  }
  return (
    <g
      stroke={stroke}
      strokeWidth="5"
      fill="none"
      strokeLinecap="round"
      style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
    >
      <circle cx="84" cy="56" r="7" />
      <circle cx="116" cy="56" r="7" />
      <path d="M88 76 q12 10 24 0" />
    </g>
  )
}

export default function Bolt({
  mood = 'happy',
  size = 200,
  waving = false,
  className = '',
}: Props) {
  return (
    <div
      className={`relative ${className}`}
      style={{
        width: size,
        height: typeof size === 'number' ? size * 1.2 : `calc(${size} * 1.2)`,
      }}
      aria-hidden
    >
      <svg
        viewBox="0 0 200 240"
        className="h-full w-full"
        style={{ animation: 'bolt-bob 3.4s ease-in-out infinite', transformOrigin: '50% 90%' }}
      >
        {/* Antenna */}
        <line x1="100" y1="22" x2="100" y2="4" stroke={EDGE} strokeWidth="4" />
        <circle
          cx="100"
          cy="4"
          r="7"
          fill="#EF4444"
          style={{ animation: 'twinkle 1.6s ease-in-out infinite' }}
        />

        {/* Head */}
        <rect
          x="48"
          y="20"
          width="104"
          height="82"
          rx="14"
          fill={SHELL}
          stroke={EDGE}
          strokeWidth="4"
        />
        <rect
          x="60"
          y="32"
          width="80"
          height="58"
          rx="10"
          fill={SCREEN}
          stroke={EDGE}
          strokeWidth="3"
        />
        <LedFace mood={mood} />
        {/* Moulded panel seam + status indicator lights */}
        <line x1="100" y1="20" x2="100" y2="30" stroke="rgba(36,70,127,0.35)" strokeWidth="2" />
        <circle cx="66" cy="94" r="3" fill="#9CC8FF" />
        <circle cx="80" cy="94" r="3" fill={EDGE} opacity="0.5" />
        <circle cx="94" cy="94" r="3" fill={EDGE} opacity="0.5" />

        {/* Body */}
        <rect
          x="54"
          y="112"
          width="92"
          height="86"
          rx="12"
          fill={SHELL}
          stroke={EDGE}
          strokeWidth="4"
        />
        {/* intake vents */}
        <line x1="62" y1="176" x2="84" y2="176" stroke={SHELL_SHADE} strokeWidth="4" />
        <line x1="62" y1="184" x2="84" y2="184" stroke={SHELL_SHADE} strokeWidth="4" />

        {/* Chest power core */}
        <path
          d="M104 128 l-16 24 h12 l-6 22 l20 -28 h-12 z"
          fill="#EF4444"
          style={{ filter: 'drop-shadow(0 0 6px rgba(239,68,68,0.6))' }}
        />

        {/* Left arm */}
        <g stroke={EDGE} strokeWidth="4">
          <rect x="30" y="120" width="22" height="56" rx="11" fill={SHELL} />
          <circle cx="41" cy="182" r="10" fill={SHELL} />
        </g>

        {/* Right arm (waving) */}
        <g
          style={{
            transformOrigin: '168px 124px',
            animation: waving ? 'bolt-wave 1.2s ease-in-out infinite' : undefined,
          }}
        >
          <rect
            x="148"
            y="120"
            width="22"
            height="56"
            rx="11"
            fill={SHELL}
            stroke={EDGE}
            strokeWidth="4"
          />
          <circle cx="159" cy="182" r="10" fill={SHELL} stroke={EDGE} strokeWidth="4" />
        </g>

        {/* Legs */}
        <g stroke={EDGE} strokeWidth="4">
          <rect x="66" y="196" width="22" height="30" rx="8" fill={SHELL} />
          <rect x="112" y="196" width="22" height="30" rx="8" fill={SHELL} />
        </g>
      </svg>
    </div>
  )
}
