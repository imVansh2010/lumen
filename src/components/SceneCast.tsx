import type { ReactNode } from 'react'
import type { BeatFx, Mood, VisualKey } from '../story/types'
import { SCENE_LABELS } from '../story/scenes'
import EchoOrb from './visuals/EchoOrb'
import Bolt from './visuals/Bolt'
import PowerGrid from './visuals/PowerGrid'

interface Props {
  visual: VisualKey
  echoMood: Mood
  boltMood: Mood
  activeSpeaker: string
  fx: BeatFx[]
  /** Lit lights per district, so the district map reflects real progress. */
  lights: number[]
}

function CharacterSpot({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <div
      className="relative transition-all duration-500"
      style={{
        opacity: active ? 1 : 0.72,
        transform: active ? 'scale(1.04)' : 'scale(0.94)',
        filter: active ? 'none' : 'brightness(0.9)',
      }}
    >
      {active && (
        <span
          className="pointer-events-none absolute inset-[-30%] rounded-full blur-2xl"
          style={{ background: 'radial-gradient(circle, rgba(156,200,255,0.3), transparent 70%)' }}
        />
      )}
      <div className="relative">{children}</div>
    </div>
  )
}

export default function SceneCast({
  visual,
  echoMood,
  boltMood,
  activeSpeaker,
  fx,
  lights,
}: Props) {
  const echoActive = activeSpeaker === 'echo'
  const boltActive = activeSpeaker === 'bolt' || activeSpeaker === 'trainer'
  const showBolt = ['shop', 'meetBolt', 'plan', 'map'].includes(visual)
  const showEcho = visual !== 'shop'
  const showGrid = visual === 'blackout' || visual === 'plan' || visual === 'map'
  const roomScene = !['city', 'festival', 'chaos', 'blackout'].includes(visual)

  return (
    /* One column: chip, then grid, then characters. Laid out in flow so the
       location chip can never sit on top of the district cards. */
    <div className="flex w-full flex-col items-center justify-center gap-1 sm:gap-3">
      {/* No border: `border-white/12` is not a Tailwind opacity, so the border
          colour silently fell back to preflight's near-white default and drew a
          thick white ring round the pill. The dark glass fill alone reads fine.
          In the repair shop the cast sits low on the bench, so the chip rides a
          little higher to keep clear of it. */}
      <span
        className={`relative flex items-center rounded-full bg-navy-950/90 px-3.5 py-1.5 text-center font-display text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-white/65 shadow-[0_6px_18px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:text-sm ${
          roomScene ? '-top-10' : '-top-6'
        }`}
      >
        {/* `-mr` cancels the trailing letter-spacing so the text sits dead
            centre in the pill and it hugs the text evenly on both sides. */}
        <span className="-mr-[0.18em] whitespace-nowrap">{SCENE_LABELS[visual]}</span>
      </span>

      {showGrid && (
        <PowerGrid lights={lights} shutdown={visual === 'blackout' && fx.includes('blackout')} />
      )}

      <div
        className={`cast-row relative flex origin-bottom items-end justify-center gap-8 px-4 sm:gap-20 ${
          showGrid ? 'mt-10 sm:mt-12' : ''
        }`}
      >
        {/* soft ground shadow keeps the characters planted on screen */}
        <span
          className="pointer-events-none absolute bottom-[-0.625rem] left-1/2 h-5 w-[70%] max-w-md -translate-x-1/2 rounded-full bg-black/50 blur-lg"
          aria-hidden
        />
        {/* The workbench Bolt stands on. Its lit top edge sits just below his
            feet and the front falls away into shadow, so it reads as a bench
            under him rather than a high ledge he is stranded on. It runs deep
            enough that, however high the cast is lifted, the bench still
            reaches down to the floor instead of hovering above it. */}
        {roomScene && (
          <span
            className="pointer-events-none absolute left-1/2 top-[calc(100%_-_0.875rem)] h-64 w-[min(88vw,40rem)] -translate-x-1/2 rounded-t-xl"
            style={{
              background:
                'linear-gradient(to bottom, #1B3A70 0%, #16305E 9%, #0C1B39 42%, #081127 80%, rgba(5,11,26,0) 100%)',
              boxShadow: '0 -2px 0 rgba(156,200,255,0.3), 0 26px 60px rgba(0,0,0,0.55)',
            }}
            aria-hidden
          />
        )}
        {showEcho && (
          /* In the repair shop Echo hovers over the ledge rather than resting
             her feet on it — a lift (not margin, which would resize the row)
             separates her from the bench while Bolt stays planted on it. */
          <div className={roomScene ? 'translate-y-[-1.75rem]' : ''}>
            <CharacterSpot active={echoActive}>
              <EchoOrb mood={echoMood} size={visual === 'chaos' ? '8.25rem' : '7.625rem'} />
            </CharacterSpot>
          </div>
        )}
        {showBolt && (
          <CharacterSpot active={boltActive}>
            <Bolt
              mood={boltMood}
              size={visual === 'plan' || visual === 'map' ? '8.875rem' : '9.5rem'}
              waving={boltActive}
            />
          </CharacterSpot>
        )}
      </div>
    </div>
  )
}
