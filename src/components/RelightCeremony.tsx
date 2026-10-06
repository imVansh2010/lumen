import { useEffect } from 'react'
import { sfx } from '../game/audio'
import { LIGHTS_PER_DISTRICT, Bulbs } from './visuals/PowerGrid'
import Confetti from './visuals/Confetti'
import { IconCheck, IconChevron, IconSparkle, IconStar } from './ui/icons'

interface Props {
  district: string
  /** Lights that are on right now (1 … lightCount). */
  lit: number
  /** Bulbs this district has (one per part). */
  lightCount?: number
  /** Which part just finished, e.g. 2 of 3. */
  part: number
  partCount: number
  starsEarned: number
  starsPossible: number
  /** Straight after the last part the whole district goes online. */
  districtComplete: boolean
  nextPartTitle?: string
  nextDifficulty?: string
  nextStationName?: string
  onContinue: () => void
}

/** Plays a rising chime for every bulb that just came on. */
function useLightChimes(lit: number, districtComplete: boolean) {
  useEffect(() => {
    const timers: number[] = []
    for (let i = 0; i < lit; i++) {
      timers.push(window.setTimeout(() => sfx.lightOn(i), 260 + i * 420))
    }
    if (districtComplete) {
      timers.push(window.setTimeout(() => sfx.fanfare(), 260 + lit * 420 + 200))
    }
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [lit, districtComplete])
}

export default function RelightCeremony({
  district,
  lit,
  lightCount = LIGHTS_PER_DISTRICT,
  part,
  partCount,
  starsEarned,
  starsPossible,
  districtComplete,
  nextPartTitle,
  nextDifficulty,
  nextStationName,
  onContinue,
}: Props) {
  useLightChimes(lit, districtComplete)

  return (
    <div className="relative animate-fade-in text-center">
      {districtComplete && <Confetti />}

      <p className="font-mono text-xs font-medium uppercase tracking-[0.28em] text-glow/80">
        {districtComplete ? `${district} online` : `Part ${part} of ${partCount}`}
      </p>
      <h2 className="mt-1 font-display text-3xl font-extrabold text-white sm:text-4xl">
        {districtComplete ? 'District back online' : 'One more light on'}
      </h2>

      {/* the district panel with its bulbs lighting up, left to right */}
      <div className="relative mt-6 overflow-hidden rounded-3xl border-2 border-white/20 bg-navy-900/80 p-6 shadow-glow-white">
        <span
          className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(156,200,255,0.45), transparent 70%)',
            animation: 'lit-burst 1.4s ease-out both',
          }}
          aria-hidden
        />
        <span
          className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-glow"
          style={{ animation: 'lit-ring 1.6s ease-out both' }}
          aria-hidden
        />

        <div className="relative">
          <p className="font-display text-2xl font-bold text-white">{district}</p>
          <div className="mt-4 flex justify-center">
            <Bulbs lit={lit} total={lightCount} size="lg" />
          </div>
          <p className="mt-3 font-display text-lg font-bold text-white">
            {lit} of {lightCount} lights on
          </p>

          {/* wire showing the spark arriving at this district */}
          <div className="relative mx-auto mt-4 h-2 w-full max-w-sm overflow-hidden rounded-full bg-navy-800">
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-glow to-white"
              style={{
                width: `${(lit / Math.max(1, lightCount)) * 100}%`,
                transition: 'width 0.8s ease-out',
              }}
            />
            <span
              className="absolute top-0 h-2 w-16 rounded-full bg-white blur-[3px]"
              style={{ animation: 'lane-run 1.6s ease-out both' }}
            />
          </div>

          <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-navy-950/70 px-4 py-1.5 font-mono text-sm font-medium text-white">
            <IconStar filled className="h-4 w-4 text-glow" />
            {starsEarned} / {starsPossible} stars
          </p>
        </div>
      </div>

      {districtComplete ? (
        <div className="mt-5 rounded-3xl border-2 border-white bg-white/10 p-5 shadow-glow-white">
          <div className="flex items-center justify-center gap-2">
            <IconCheck className="h-6 w-6 text-glow" />
            <p className="font-display text-xl font-bold text-white">
              {nextStationName ? `${nextStationName} unlocked` : 'District complete'}
            </p>
          </div>
          <p className="mt-1 text-white/80">Lesson learned. This district is back online.</p>
        </div>
      ) : (
        <div className="mt-5 rounded-3xl border-2 border-danger-500/60 bg-danger-500/10 p-5">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.22em] text-danger-400">
            Next · {nextDifficulty}
          </p>
          <p className="mt-1 font-display text-xl font-bold text-white">{nextPartTitle}</p>
          <p className="mt-1 text-white/80">Harder than the last part. Take your time.</p>
        </div>
      )}

      <button
        type="button"
        onClick={onContinue}
        className="btn btn-primary mt-6 gap-2 px-8 py-4 text-xl"
      >
        <IconSparkle className="h-6 w-6" />
        {districtComplete ? 'See your results' : `Start part ${part + 1}`}
        <IconChevron className="h-5 w-5" />
      </button>
    </div>
  )
}
