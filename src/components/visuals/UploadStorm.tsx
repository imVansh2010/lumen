import type { CSSProperties } from 'react'

interface HappyCard {
  emoji: string
  label: string
  left: number
  delay: number
}
interface BadCard {
  emoji: string
  caption: string
  /** Horizontal position in percent — cards are spread across the full width. */
  left: number
  top: number
  delay: number
  code?: boolean
  /** Busy screens hide the two least important cards on narrow displays. */
  smallScreenOptional?: boolean
}

const HAPPY: HappyCard[] = [
  { emoji: '📷', label: 'photo', left: 8, delay: 0 },
  { emoji: '📝', label: 'note', left: 20, delay: 0.5 },
  { emoji: '💬', label: 'message', left: 33, delay: 1 },
  { emoji: '🎈', label: 'party', left: 45, delay: 1.4 },
  { emoji: '🌸', label: 'flowers', left: 58, delay: 0.3 },
  { emoji: '🎨', label: 'art', left: 70, delay: 0.9 },
  { emoji: '🚲', label: 'bike', left: 83, delay: 1.6 },
  { emoji: '🍰', label: 'cake', left: 92, delay: 0.7 },
]

/* Seven cards, evenly spread from the far left to the far right so the chaos
   fills the whole stage instead of bunching up in one corner. */
const BAD: BadCard[] = [
  { emoji: '👾', caption: 'labeled “cupcake”', left: 10, top: 22, delay: 0 },
  { emoji: '🐱✈️', caption: '“cats can fly!”', left: 23, top: 40, delay: 0.28 },
  { emoji: '📣', caption: '"DO IT NOW!!"', left: 36.5, top: 44, delay: 0.56 },
  { emoji: '⚡', caption: 'wrong answer!', left: 50, top: 36, delay: 0.84 },
  { emoji: '🍰', caption: '“cake is a monster”', left: 63.5, top: 42, delay: 1.12 },
  { emoji: '🌪️', caption: 'a tall tale', left: 77, top: 39, delay: 1.4, smallScreenOptional: true },
  { emoji: '🔑', caption: 'ACCESS CODE 7X-9Q-4', left: 90, top: 23, delay: 1.68, code: true },
]

export function UploadStorm() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {HAPPY.map((c, i) => (
        <div
          key={i}
          className="absolute bottom-[38%]"
          style={
            {
              left: `${c.left}%`,
              '--x0': '0px',
              '--x1': '-20px',
              '--r0': '-12deg',
              '--r1': '16deg',
              animation: `card-rise 3.4s ease-in ${c.delay}s infinite`,
            } as CSSProperties
          }
        >
          <div className="flex w-20 flex-col items-center gap-1 rounded-2xl border-2 border-white/30 bg-white/10 px-3 py-3 backdrop-blur-sm">
            <span className="text-2xl">{c.emoji}</span>
            <span className="text-[10px] uppercase tracking-widest text-white/70">{c.label}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ChaosStorm({ alert = false }: { alert?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* red alert pulse */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 40%, rgba(239,68,68,0.35), transparent 65%)',
          animation: 'alert-pulse 1.4s ease-in-out infinite',
        }}
      />
      {/* red scan sweep dragging down the screen */}
      <div
        className="absolute inset-x-0 h-40"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(239,68,68,0.35), transparent)',
          animation: 'scan-sweep 5.5s ease-in-out infinite',
        }}
      />

      {alert && (
        <div className="absolute inset-x-0 top-[7%] flex justify-center px-4">
          <div
            className="flex items-center gap-2 rounded-full border-2 border-danger-500 bg-danger-600/40 px-5 py-2 font-display text-sm font-extrabold uppercase tracking-widest text-white shadow-glow-red sm:text-base"
            style={{
              animation:
                'banner-drop 0.5s ease-out both, alert-pulse 1.6s ease-in-out 0.5s infinite',
            }}
          >
            <span className="text-lg">🚨</span> Bad data uploaded
            <span className="text-lg">🚨</span>
          </div>
        </div>
      )}

      {/* cards are centred on their `left` anchor so they spread evenly */}
      {BAD.map((c, i) => (
        <div
          key={i}
          className={`absolute w-28 -translate-x-1/2 sm:w-44 ${c.smallScreenOptional ? 'hidden sm:block' : ''}`}
          style={{ left: `${c.left}%`, top: `${c.top}%` }}
        >
          <div
            className={`rounded-2xl border-2 px-3 py-3 text-center ${
              c.code
                ? 'border-danger-500 bg-danger-600/30 shadow-glow-red'
                : 'border-danger-500/60 bg-navy-800/90'
            }`}
            style={{
              animation: `pop-in 0.4s ease-out ${c.delay}s both, card-jitter 0.6s ease-in-out ${
                c.delay + 0.4
              }s infinite`,
            }}
          >
            <div className="text-2xl sm:text-3xl">{c.emoji}</div>
            <div
              className={`mt-1 text-[11px] font-bold leading-tight sm:text-xs ${
                c.code ? 'font-mono tracking-wider text-danger-400' : 'text-white/85'
              }`}
            >
              {c.caption}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
