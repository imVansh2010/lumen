import { useEffect, useState } from 'react'
import { STATIONS } from '../../story/districts'
import { sectionCount } from '../../game/stations'
import { sfx } from '../../game/audio'
import { cutMs } from '../../game/blackout'

/** Fallback bulb count for a district whose lessons are not written yet. */
export const LIGHTS_PER_DISTRICT = 3

/** Bulbs a district really has — one per finished part. Districts still
    waiting on content fall back to LIGHTS_PER_DISTRICT so their card is never
    an empty row of zero bulbs. */
function bulbsForDistrict(stationId: number): number {
  const parts = sectionCount(stationId)
  return parts > 0 ? parts : LIGHTS_PER_DISTRICT
}

export function Bulbs({
  lit,
  total = LIGHTS_PER_DISTRICT,
  size = 'sm',
}: {
  lit: number
  total?: number
  size?: 'sm' | 'lg'
}) {
  const dim = size === 'lg' ? 'h-6 w-6' : 'h-2.5 w-2.5'
  return (
    <span className="flex items-center justify-center gap-1.5">
      {Array.from({ length: total }, (_, i) => {
        const on = i < lit
        return (
          <span
            key={i}
            className={`${dim} inline-block rounded-full`}
            style={{
              background: on ? '#9CC8FF' : '#12264C',
              boxShadow: on ? '0 0 10px rgba(156,200,255,0.85)' : 'none',
              animation: `${on ? 'bulb-on' : 'bulb-off'} 0.55s ease-out ${i * 0.22}s both`,
            }}
          />
        )
      })}
    </span>
  )
}

interface Props {
  /** Lit lights per district, e.g. [2, 0, 0, 0]. */
  lights?: number[]
  /** Plays the slow left-to-right shutdown when it mounts. */
  shutdown?: boolean
  /** `overlay` floats over the story stage, `inline` sits in a page layout. */
  variant?: 'overlay' | 'inline'
}

export default function PowerGrid({
  lights = [0, 0, 0, 0],
  shutdown = false,
  variant = 'overlay',
}: Props) {
  // During the blackout the city starts fully lit and each district dies in turn.
  const [darkCount, setDarkCount] = useState(0)

  useEffect(() => {
    if (!shutdown) return
    // Rewinding to this beat should replay the blackout from a fully-lit city,
    // so clear any left-over state once the new run is committed.
    const reset = window.setTimeout(() => setDarkCount(0), 0)
    const timers: number[] = []
    for (let i = 0; i < STATIONS.length; i++) {
      timers.push(
        window.setTimeout(() => {
          setDarkCount(i + 1)
          sfx.powerDown(i)
        }, cutMs(i)),
      )
    }
    return () => {
      window.clearTimeout(reset)
      timers.forEach((t) => window.clearTimeout(t))
    }
  }, [shutdown])

  const litFor = (i: number, total: number) => {
    if (shutdown) return i < darkCount ? 0 : total
    return Math.max(0, Math.min(lights[i] ?? 0, total))
  }

  return (
    <div
      className={`relative mx-auto w-full ${
        variant === 'overlay' ? 'max-w-3xl px-1 sm:px-4' : 'max-w-3xl px-1'
      }`}
    >
      {/* Re-mounting on every shutdown replays the per-district flicker animation. */}
      <div key={`grid-${shutdown}`} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STATIONS.map((s, i) => {
          const total = bulbsForDistrict(s.id)
          const lit = litFor(i, total)
          const online = lit >= total
          return (
            <div
              key={s.id}
              /* During the blackout each card holds its charge, surges, then
                 fizzles out on its own delayed beat — matching the sound. */
              className={`rounded-xl border px-2.5 py-2 text-center transition-colors ${
                online
                  ? 'border-glow/60 bg-glow/10 shadow-glow-white'
                  : 'border-white/15 bg-navy-900/70'
              }`}
              style={
                shutdown
                  ? {
                      animation: `district-cut 1.15s ease-out ${cutMs(i) / 1000}s both`,
                    }
                  : undefined
              }
            >
              <div className="font-display text-[0.6875rem] font-semibold uppercase leading-tight tracking-[0.1em] text-white sm:text-xs">
                {s.name}
              </div>
              <div className="my-1.5">
                <Bulbs lit={lit} total={total} />
              </div>
              <div
                className={`font-mono text-[0.625rem] font-medium uppercase tracking-[0.18em] ${
                  online ? 'text-glow' : lit > 0 ? 'text-white/70' : 'text-white/45'
                }`}
              >
                {online ? 'online' : lit > 0 ? `${lit}/${total} online` : 'no power'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
