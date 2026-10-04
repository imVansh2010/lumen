import type { CSSProperties } from 'react'

interface HappyCard {
  emoji: string
  label: string
  left: number
  delay: number
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
            <span className="text-[0.625rem] uppercase tracking-widest text-white/70">
              {c.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

interface BadCard {
  emoji: string
  /** The wrong (but believable) tag or confident claim Echo picked up. */
  caption: string
  /** Static hand-placed tilt so the pile feels messy without any looping motion. */
  rot: number
  code?: boolean
}

/* Seven pieces of bad training data. They are deliberately NOT absurd — each is
   a *near-miss* label (a wolf tagged "a friendly husky") or a confident claim
   with no proof behind it ("cats can fly — trust me"). Spotting why each one is
   bad takes real comparison, not just "that's silly".

   The array order matches the REVEAL map below, so cards appear in the same
   order the story names them. */
const BAD: BadCard[] = [
  { emoji: '🐺', caption: 'tagged “a friendly husky”', rot: -2.5 },
  { emoji: '🦇', caption: 'tagged “a little bird”', rot: 2 },
  { emoji: '🐱✈️', caption: '“cats can fly — trust me”', rot: -1.5 },
  { emoji: '📣', caption: '“DO IT NOW!!”', rot: 2.5 },
  { emoji: '🔑', caption: 'ACCESS CODE 7X-9Q-4', rot: -1, code: true },
  { emoji: '🍄', caption: 'tagged “a plant”', rot: 1.5 },
  { emoji: '🌪️', caption: '“everyone says so!”', rot: -2 },
]

/** How many cards are visible from each chaos beat onward. Cards pop in exactly
    when the story mentions them instead of all at once. */
const REVEAL: Record<string, number> = {
  'c3-1': 2,
  'c3-2': 4,
  'c3-3': 5,
  'c3-4': BAD.length,
}

export function ChaosStorm({ beatId }: { beatId: string }) {
  const shown = BAD.slice(0, REVEAL[beatId] ?? BAD.length)

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

      {/* Cards sit in a wrapping flex row so they can never overlap, at any width.
          The tilt lives on the outer box and the entrance scale on the inner one,
          so the pop-in animation doesn't wipe out the hand-placed rotation. */}
      <div className="absolute inset-x-0 top-[28%] flex flex-wrap items-start justify-evenly gap-2 px-3 sm:top-[30%] sm:gap-3 sm:px-8">
        {shown.map((c, i) => (
          <div key={i} style={{ transform: `rotate(${c.rot}deg)` }}>
            <div className="animate-pop-in" style={{ animationDelay: `${(i % 3) * 0.08}s` }}>
              <div
                className={`w-24 rounded-2xl border-2 px-2 py-2 text-center sm:w-32 sm:px-3 ${
                  c.code
                    ? 'border-danger-500 bg-danger-600/30 shadow-glow-red'
                    : 'border-danger-500/60 bg-navy-800/90'
                }`}
              >
                <div className="text-xl sm:text-2xl">{c.emoji}</div>
                <div
                  className={`mt-1 text-[0.625rem] font-bold leading-tight sm:text-xs ${
                    c.code ? 'font-mono tracking-wider text-danger-400' : 'text-white/85'
                  }`}
                >
                  {c.caption}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
