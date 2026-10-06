import type { CSSProperties } from 'react'

interface FeedPacket {
  /** Machine-style identifier for the incoming packet. */
  code: string
  label: string
  left: number
  delay: number
}

/* The Festival of Ideas feed: ordinary packets the city sends Echo to learn
   from. Presented as telemetry tags rather than stickers. The whole column was
   nudged a few points left of centre so the rising cards read as balanced
   rather than drifting right. Left/delay are layout values and keep their
   original spread. */
const FEED: FeedPacket[] = [
  { code: 'IMG_0442', label: 'image', left: 4, delay: 0 },
  { code: 'LOG_0713', label: 'reading', left: 16, delay: 0.5 },
  { code: 'MSG_1180', label: 'message', left: 29, delay: 1 },
  { code: 'AUD_0091', label: 'audio', left: 41, delay: 1.4 },
  { code: 'MAP_N12', label: 'map', left: 54, delay: 0.3 },
  { code: 'VEC_3301', label: 'vector', left: 66, delay: 0.9 },
  { code: 'SEN_4408', label: 'sensor', left: 79, delay: 1.6 },
  { code: 'DOC_2106', label: 'document', left: 88, delay: 0.7 },
]

export function UploadStorm() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {FEED.map((c, i) => (
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
          <div className="flex w-24 flex-col items-center gap-1 rounded-xl border border-white/20 bg-white/10 px-2.5 py-3 sm:w-28">
            <span className="font-mono text-[0.6875rem] font-medium tracking-[0.08em] text-glow sm:text-xs">
              {c.code}
            </span>
            <span className="text-[0.625rem] uppercase tracking-[0.2em] text-white/60 sm:text-[0.6875rem]">
              {c.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

interface BadCard {
  /** Corrupt-sample identifier, printed in mono on the card. */
  tag: string
  /** What is wrong with this piece of training data. */
  caption: string
  /** Static hand-placed tilt so the pile feels messy without any looping motion. */
  rot: number
  /** The private-data card gets the harsher red treatment. */
  code?: boolean
}

/* Four pieces of bad data. Each one has to land at a glance: what it is, and
   why you should not trust it. Short and plain, never silly.

   The array order matches the REVEAL map below, so cards appear in the same
   order the story names them. */
const BAD: BadCard[] = [
  { tag: 'IMG_204', caption: 'fake photo, passed off as real', rot: -2.5 },
  { tag: 'POST_221', caption: 'one anonymous claim, no source', rot: 2 },
  { tag: 'VIRAL_09', caption: 'urgent post, no proof', rot: -1.5 },
  { tag: 'CRED_7X', caption: 'private code posted publicly', rot: 2, code: true },
]

/* Fixed slots so cards scatter across but never sit on Echo. Inner slots are
   hidden on phones where there isn't room beside her. Ordered left-to-right
   (outer-left, inner-left, inner-right, outer-right) so the reveal reads
   cleanly in that direction. */
const CARD_SLOTS: { cls: string; hideOnSmall?: boolean }[] = [
  { cls: 'left-[7%] top-[30%]' },
  { cls: 'left-[28%] top-[50%]', hideOnSmall: true },
  { cls: 'right-[28%] top-[50%]', hideOnSmall: true },
  { cls: 'right-[7%] top-[30%]' },
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
              className={`w-28 rounded-xl border px-3 py-2.5 text-center sm:w-44 sm:px-5 sm:py-4 ${
                c.code
                  ? 'border-danger-500 bg-danger-600/30 shadow-glow-red'
                  : 'border-danger-500/60 bg-navy-800/90'
              }`}
            >
              <div
                className={`font-mono text-[0.6875rem] font-medium tracking-[0.1em] sm:text-xs ${
                  c.code ? 'text-danger-400' : 'text-glow/70'
                }`}
              >
                {c.tag}
              </div>
              <div className="mt-1.5 text-xs font-bold leading-tight text-white/85 sm:text-sm">
                {c.caption}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
