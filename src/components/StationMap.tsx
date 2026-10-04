import { STATIONS } from '../story/districts'
import { sectionCount } from '../game/stations'
import {
  districtLights,
  stationStars,
  maxStars,
  stationUnlocked,
  totalLights,
  totalLightsPossible,
} from '../game/progress'
import type { Progress } from '../game/progress'
import { LIGHTS_PER_DISTRICT, Bulbs } from './visuals/PowerGrid'
import { IconCheck, IconChevron, IconLock, IconReplay, IconStation, IconSparkle } from './ui/icons'

interface Props {
  progress: Progress
  onOpenStation: (id: number) => void
  onReplayIntro: () => void
}

export default function StationMap({ progress, onOpenStation, onReplayIntro }: Props) {
  const lightsOn = totalLights(progress)
  const lightsTotal = totalLightsPossible()

  return (
    <div className="scanlines flex min-h-full w-full flex-col px-4 py-8 sm:px-8">
      <div className="m-auto w-full max-w-5xl">
        <div className="text-center">
          <p className="font-display text-sm font-bold uppercase tracking-[0.3em] text-glow">
            Power level · {lightsOn} of {lightsTotal} lights back on
          </p>
          <div className="mx-auto mt-2 flex w-full max-w-md items-center gap-2">
            <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/15">
              <span
                className="block h-full rounded-full bg-glow shadow-glow-white transition-all duration-700"
                style={{ width: `${(lightsOn / lightsTotal) * 100}%` }}
              />
            </span>
          </div>
          <h2 className="mt-3 font-display text-4xl font-extrabold text-white sm:text-5xl">
            Choose a station
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-balance text-lg text-white/75">
            Each part you finish lights one more bulb in that district. Light up a whole district to
            open the next station.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {STATIONS.map((s) => {
            const total = sectionCount(s.id)
            const lights = Math.max(districtLights(progress, s.id), 0)
            const earned = stationUnlocked(progress, s.id)
            const built = total > 0
            const unlocked = earned && built
            const online = built && lights >= total
            const started = lights > 0 && !online
            const stars = stationStars(progress, s.id)
            const max = maxStars(s.id)
            const action = online
              ? 'Play again'
              : started
                ? `Continue part ${Math.min(lights + 1, total)}`
                : 'Start here'
            const hint =
              earned && !built ? 'Lessons arriving soon — the lights you earned are safe.' : s.hint

            return (
              <button
                key={s.id}
                type="button"
                disabled={!unlocked}
                onClick={unlocked ? () => onOpenStation(s.id) : undefined}
                aria-label={unlocked ? `Open station ${s.id}: ${s.name}` : `${s.name} is locked`}
                className={`group relative overflow-hidden rounded-3xl border-2 p-5 text-left transition-all ${
                  unlocked
                    ? online
                      ? 'border-glow/60 bg-glow/10 hover:-translate-y-1 hover:bg-glow/20'
                      : 'border-white bg-white/10 shadow-glow-white hover:-translate-y-1 hover:bg-white/20'
                    : 'cursor-not-allowed border-white/10 bg-navy-900/70 opacity-80'
                }`}
              >
                {unlocked && !online && (
                  <span
                    className="pointer-events-none absolute inset-0 rounded-3xl"
                    style={{
                      boxShadow: 'inset 0 0 40px rgba(255,255,255,0.18)',
                      animation: 'alert-pulse 2.4s ease-in-out infinite',
                    }}
                  />
                )}
                <div className="flex items-start gap-4">
                  <span
                    className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-2 ${
                      unlocked
                        ? online
                          ? 'border-glow bg-glow text-navy-950'
                          : 'border-white bg-white text-navy-950'
                        : 'border-white/20 bg-navy-800 text-white/60'
                    }`}
                  >
                    <IconStation kind={s.icon} className="h-7 w-7" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-xs font-bold uppercase tracking-widest text-white/50">
                        Station {s.id}
                      </span>
                      {!unlocked && <IconLock className="h-4 w-4 text-white/40" />}
                      {online && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-glow/20 px-2 py-0.5 font-display text-[0.625rem] font-bold uppercase tracking-widest text-glow">
                          <IconCheck className="h-3.5 w-3.5" /> Online
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-2xl font-bold text-white">{s.name}</h3>
                    <p className="mt-0.5 font-display text-sm font-bold uppercase tracking-wide text-danger-400">
                      {s.lesson}
                    </p>
                    <p className="mt-2 text-white/75">{unlocked ? s.blurb : hint}</p>

                    {unlocked && (
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <Bulbs lit={lights} total={total || LIGHTS_PER_DISTRICT} />
                        <span className="font-display text-xs font-bold uppercase tracking-widest text-white/60">
                          {online ? 'all lights on' : `${lights} of ${total} lights`}
                        </span>
                        {max > 0 && (
                          <span className="font-display text-xs font-bold uppercase tracking-widest text-white/45">
                            best {stars} / {max} stars
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {unlocked && (
                    <span className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-navy-950 transition-transform group-hover:translate-x-1">
                      <IconChevron className="h-6 w-6" />
                    </span>
                  )}
                </div>

                {unlocked && (
                  <span className="mt-4 inline-flex items-center gap-1.5 font-display text-sm font-bold uppercase tracking-widest text-white">
                    <IconSparkle className="h-4 w-4" /> {action}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <button type="button" onClick={onReplayIntro} className="btn btn-ghost gap-2">
            <IconReplay className="h-5 w-5" /> Watch the story again
          </button>
        </div>
      </div>
    </div>
  )
}
