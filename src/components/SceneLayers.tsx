import type { BeatFx, VisualKey } from '../story/types'
import SkyCity from './visuals/SkyCity'
import { UploadStorm, ChaosStorm } from './visuals/UploadStorm'
import Confetti from './visuals/Confetti'

interface Props {
  visual: VisualKey
  fx: BeatFx[]
}

/** A tiny lit skyline seen through the workshop window. */
function WindowCity({ lit }: { lit: boolean }) {
  const buildings = [
    { x: 12, w: 26, h: 46 },
    { x: 44, w: 20, h: 74 },
    { x: 70, w: 30, h: 34 },
    { x: 106, w: 22, h: 58 },
    { x: 134, w: 28, h: 42 },
  ]
  return (
    <svg viewBox="0 0 180 100" className="h-full w-full" aria-hidden>
      {Array.from({ length: 16 }, (_, i) => (
        <circle
          key={i}
          cx={((i * 37) % 176) + 3}
          cy={((i * 23) % 30) + 6}
          r={1.2}
          fill="#FFFFFF"
          opacity={lit ? 0.9 : 0.4}
          style={{
            animation: `twinkle ${2.4 + (i % 5) * 0.4}s ease-in-out ${(i % 7) * 0.3}s infinite`,
          }}
        />
      ))}
      <circle cx="146" cy="24" r="13" fill="#DCE9FF" opacity={lit ? 0.35 : 0.15} />
      {buildings.map((b, i) => (
        <g key={i}>
          <rect
            x={b.x}
            y={100 - b.h}
            width={b.w}
            height={b.h}
            rx={3}
            fill="#0C1B39"
            stroke="#24467F"
            strokeWidth={1.5}
          />
          {[0, 1, 2].map((r) => (
            <rect
              key={r}
              x={b.x + 6}
              y={100 - b.h + 8 + r * 14}
              width={8}
              height={7}
              rx={1.5}
              fill={lit ? '#9CC8FF' : '#12264C'}
            />
          ))}
        </g>
      ))}
    </svg>
  )
}

/** The cozy, dim repair shop that Bolt is built in. */
function RoomBackdrop({ windowLit = false }: { windowLit?: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900 via-navy-950 to-navy-900" />

      {/* back wall, so anything mounted reads as fixed to a wall */}
      <div className="absolute inset-x-0 top-0 h-[70%] bg-gradient-to-b from-navy-800/45 via-navy-900/10 to-transparent" />

      {/* floor — the room needs a ground for the workbench and bolts to sit on.
          It starts fully transparent and only picks up colour as it descends:
          snapping straight to a lit navy is what drew a hard seam across the
          middle of the backdrop, which read as a rendering glitch rather than
          as a floor. */}
      <div className="absolute inset-x-0 bottom-0 h-[34%]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy-800/50 to-navy-950" />
      </div>

      {/* hanging lamp — hung dead centre of the room and fully inside the
          frame, so its cord reads as plumb and nothing is sliced off at the
          top edge. */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2">
        <div className="mx-auto h-12 w-px bg-white/25" />
        <div className="h-4 w-14 rounded-b-full bg-white/85 shadow-glow-white" />
      </div>
      <div
        className="absolute left-1/2 top-10 -translate-x-1/2"
        style={{
          width: 520,
          height: 520,
          background: 'radial-gradient(circle, rgba(156,200,255,0.15), transparent 66%)',
        }}
      />

      {/* round window looking out at the city lights */}
      <div className="absolute right-[7%] top-[12%] h-[150px] w-[150px] overflow-hidden rounded-full border-4 border-navy-600 bg-navy-950 sm:h-[210px] sm:w-[210px]">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-800 to-navy-950" />
        <div className="absolute inset-0" style={{ animation: 'fade-in 1.4s ease-out both' }}>
          <WindowCity lit={windowLit} />
        </div>
      </div>

      {/* Pegboard mounted flat on the wall. The board used to hang alone in
          the dark, which made it look like it was floating; the soft shadow
          patch behind it anchors it to the wall. */}
      <div className="absolute left-[6%] top-[30%] w-[120px] sm:w-[150px]">
        <div className="absolute -inset-x-4 -inset-y-3 rounded-[28px] bg-navy-950/55 blur-md" />
        <div className="relative rounded-2xl border-2 border-navy-700 bg-navy-900/95 p-3 shadow-[0_18px_44px_rgba(0,0,0,0.65)]">
          <div className="grid grid-cols-3 gap-2">
            {['🔧', '🪛', '🔨', '🧲', '🔌', '⚙️'].map((t) => (
              <span
                key={t}
                className="grid h-8 place-items-center rounded-lg border border-navy-600 bg-navy-800/80 text-base"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SceneLayers({ visual, fx }: Props) {
  const cityScene =
    visual === 'city' || visual === 'festival' || visual === 'chaos' || visual === 'blackout'
  // The beat that kills the power keeps the city lit so it can go dark district by district.
  const shuttingDown = fx.includes('blackout')

  return (
    <div className="absolute inset-0">
      {/* Exactly one background per scene — never two stacked on top of each other. */}
      {cityScene ? (
        <SkyCity lightsOn={visual !== 'blackout' || shuttingDown} blackout={shuttingDown} />
      ) : (
        <RoomBackdrop windowLit={visual === 'map'} />
      )}

      {/* Story overlays */}
      {visual === 'festival' && (
        <>
          <UploadStorm />
          {fx.includes('confetti') && <Confetti />}
        </>
      )}
      {visual === 'chaos' && <ChaosStorm alert={fx.includes('alert')} />}
      {visual === 'blackout' && !shuttingDown && (
        <div
          className="absolute inset-0 bg-navy-950/70"
          style={{ animation: 'fade-in 1.2s ease-out both' }}
        />
      )}

      {/* The lights flicker twice before they die */}
      {shuttingDown && (
        <div
          className="absolute inset-0 bg-[#DCE9FF]"
          style={{ animation: 'blackout-flash 1.6s ease-out both' }}
        />
      )}
    </div>
  )
}
