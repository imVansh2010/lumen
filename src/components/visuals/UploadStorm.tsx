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
          className="absolute bottom-[38%] will-change-transform"
          style={
            {
              left: `${c.left}%`,
              '--x0': '0px',
              '--x1': '-20px',
              '--r0': '-12deg',
              '--r1': '16deg',
              // `both` holds the 0% frame during the delay so a card is hidden
              // (not frozen visible) until its turn; ease-in-out removes the
              // dead-feeling slow start of the old ease-in.
              animation: `card-rise 3.4s ease-in-out ${c.delay}s both infinite`,
            } as CSSProperties
          }
        >
          {/* No backdrop-blur here: it re-samples the backdrop every frame and
              makes the rising cards stutter. A translucent fill keeps the glass
              look while the transform stays on the compositor. */}
          <div className="flex w-24 flex-col items-center gap-1 rounded-2xl border-2 border-white/30 bg-white/15 px-3 py-3 sm:w-28">
            <span className="text-3xl sm:text-4xl">{c.emoji}</span>
            <span className="text-[0.6875rem] uppercase tracking-widest text-white/70 sm:text-xs">
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

/* Five pieces of bad training data. They are deliberately NOT absurd — each is
   a *near-miss* label (a wolf tagged "a friendly husky") or a confident claim
   with no proof behind it ("cats can fly — trust me"). Spotting why each one is
   bad takes real comparison, not just "that's silly".

   The array order matches the REVEAL map below, so cards appear in the same
   order the story names them. Kept to five so each one can be big enough to
   read without crowding Echo. */
const BAD: BadCard[] = [
  { emoji: '🐺', caption: 'tagged “a friendly husky”', rot: -2.5 },
  { emoji: '🐱✈️', caption: '“cats can fly — trust me”', rot: 2 },
  { emoji: '📣', caption: '“DO IT NOW!!”', rot: -1.5 },
  { emoji: '🔑', caption: 'ACCESS CODE 7X-9Q-4', rot: 2, code: true },
]

/* Fixed slots so cards scatter across but never sit on Echo. Inner slots are
   hidden on phones where there isn't room beside her. Ordered left-to-right
   (outer-left, inner-left, inner-right, outer-right) so the reveal reads
   cleanly in that direction. */
const CARD_SLOTS: { cls: string; hideOnSmall?: boolean }[] = [
  { cls: 'left-[3%] top-[30%]' },
  { cls: 'left-[24%] top-[50%]', hideOnSmall: true },
  { cls: 'right-[24%] top-[50%]', hideOnSmall: true },
  { cls: 'right-[3%] top-[30%]' },
]

/** How many cards are visible from each chaos beat onward. Cards pop in exactly
    when the story mentions them instead of all at once. */
const REVEAL: Record<string, number> = {
  'c3-1': 1,
  'c3-2': 3,
  'c3-3': 4,
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

      {/* Each card owns a FIXED slot (left/right + top), so revealing the next
          one never shoves the others around — a wrapping flex row re-centres
          itself on every add, which is what made cards jump. Slots are mirrored
          left-to-right and keep the dead-centre column clear for Echo. The two
          inner slots are hidden on small screens where they'd crowd her. The tilt
          lives on the outer (positioned) box and the entrance scale on the inner
          one, so the pop-in animation can't wipe out the hand-placed rotation. */}
      {shown.map((c, i) => (
        <div
          key={i}
          className={`absolute ${CARD_SLOTS[i].cls} ${CARD_SLOTS[i].hideOnSmall ? 'hidden sm:block' : ''}`}
          style={{ transform: `rotate(${c.rot}deg)` }}
        >
          <div className="animate-pop-in" style={{ willChange: 'transform, opacity' }}>
            <div
              className={`w-28 rounded-2xl border-2 px-3 py-2.5 text-center sm:w-44 sm:px-5 sm:py-4 ${
                c.code
                  ? 'border-danger-500 bg-danger-600/30 shadow-glow-red'
                  : 'border-danger-500/60 bg-navy-800/90'
              }`}
            >
              <div className="text-3xl sm:text-4xl">{c.emoji}</div>
              <div
                className={`mt-1.5 text-xs font-bold leading-tight sm:text-sm ${
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
  )
}
