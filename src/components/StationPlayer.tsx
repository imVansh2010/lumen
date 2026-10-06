import { useState } from 'react'
import type { Mood } from '../story/types'
import { STATIONS } from '../story/districts'
import { maxStars, sectionCount, sectionsOf } from '../game/stations'
import { STARS_PER_TASK, promptFor, roundFor, starsForTask } from '../game/tasks'
import type { CleanSetTask, Difficulty, Section, Task } from '../game/tasks'
import { districtLights, sectionStars } from '../game/progress'
import type { Progress } from '../game/progress'
import { sfx } from '../game/audio'
import EchoOrb from './visuals/EchoOrb'
import Bolt from './visuals/Bolt'
import PowerGrid from './visuals/PowerGrid'
import RelightCeremony from './RelightCeremony'
import {
  IconArrow,
  IconCheck,
  IconChevron,
  IconCross,
  IconLock,
  IconReplay,
  IconSparkle,
  IconStar,
} from './ui/icons'

type Phase = 'brief' | 'play' | 'relight' | 'done'

interface Props {
  stationId: number
  progress: Progress
  onBack: () => void
  onSectionComplete: (stationId: number, sectionIndex: number, stars: number) => void
}

const DIFFICULTY_STYLE: Record<Difficulty, string> = {
  'Warm-up': 'text-glow',
  Tricky: 'text-white',
  Expert: 'text-danger-400',
}

function rank(total: number, max: number): { title: string; blurb: string } {
  const pct = max > 0 ? total / max : 0
  if (pct >= 0.92) {
    return { title: 'Flawless run', blurb: 'No mistakes the whole way through.' }
  }
  if (pct >= 0.72) {
    return { title: 'Solid run', blurb: 'Bolt learned a lot from you.' }
  }
  if (pct >= 0.5) {
    return { title: 'Passed', blurb: 'You got there. A few more careful picks.' }
  }
  return { title: 'Not quite', blurb: 'Every wrong answer taught you something. Run it again.' }
}

/* -------------------------------- Briefing --------------------------------- */

function Briefing({
  stationName,
  lesson,
  parts,
  doneParts,
  allDone,
  bestStars,
  starsPossible,
  onStart,
  onBack,
}: {
  stationName: string
  lesson: string
  parts: Section[]
  doneParts: number
  allDone: boolean
  bestStars: number
  starsPossible: number
  onStart: () => void
  onBack: () => void
}) {
  const nextPart = parts[Math.min(doneParts, parts.length - 1)]
  return (
    <div className="animate-fade-in">
      <p className="font-display text-sm font-bold uppercase tracking-[0.3em] text-danger-400">
        Station · {lesson}
      </p>
      <h2 className="mt-1 font-display text-4xl font-extrabold text-white sm:text-5xl">
        {stationName}
      </h2>

      <div className="mt-5 flex flex-col items-center gap-4 rounded-3xl border-2 border-white/10 bg-navy-900/70 p-5 sm:flex-row sm:p-6">
        <EchoOrb mood="worried" size="5.75rem" />
        <p className="text-center text-lg text-white/85 sm:text-left">
          “Everything I learned today is a mess. Teach Bolt with examples you&apos;ve checked, and
          he can teach me back.”
        </p>
      </div>

      {/* the parts, hardest last */}
      <div className="mt-5 space-y-3 sm:space-y-4">
        {parts.map((part, i) => {
          const done = i < doneParts
          return (
            <div
              key={part.id}
              className={`flex items-start gap-3 rounded-3xl border-2 p-4 sm:p-5 ${
                done ? 'border-glow/40 bg-glow/10' : 'border-white/10 bg-navy-900/60'
              }`}
            >
              <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl font-display font-bold ${
                  done ? 'bg-glow text-navy-950' : 'bg-navy-800 text-white/70'
                }`}
              >
                {done ? <IconCheck className="h-5 w-5" /> : i + 1}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-medium uppercase tracking-[0.22em] text-white/50">
                    Part {i + 1}
                  </span>
                  <span
                    className={`font-display text-xs font-bold uppercase tracking-widest ${DIFFICULTY_STYLE[part.difficulty]}`}
                  >
                    {part.difficulty}
                  </span>
                  <span className="font-mono text-xs font-medium uppercase tracking-[0.22em] text-white/40">
                    {part.tasks.length} tasks
                  </span>
                </div>
                <p className="font-display text-xl font-bold text-white">{part.title}</p>
                <p className="text-white/75">{part.blurb}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="panel mt-5 p-4 sm:p-5">
        <p className="text-white/85">
          <span className="font-display font-bold text-white">Scoring:</span> up to {STARS_PER_TASK}{' '}
          stars a task. First try earns all three, and each finished part lights one more light.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={onStart} className="btn btn-primary gap-2 px-8 py-4 text-xl">
          {allDone ? <IconReplay className="h-6 w-6" /> : <IconSparkle className="h-6 w-6" />}
          {allDone
            ? 'Play it again'
            : `Start part ${Math.min(doneParts, parts.length - 1) + 1} · ${nextPart.title}`}
        </button>
        <button type="button" onClick={onBack} className="btn btn-ghost gap-2">
          <IconArrow dir="left" className="h-5 w-5" /> Map
        </button>
      </div>
      {bestStars > 0 && (
        <p className="mt-3 text-center font-mono text-xs font-medium uppercase tracking-[0.22em] text-white/50">
          Best record · {bestStars} / {starsPossible} stars
        </p>
      )}
    </div>
  )
}

/* ------------------------------- Task pieces ------------------------------- */

function LabelChip({ text, wrong }: { text: string; wrong?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-1 ${
        wrong ? 'border-danger-500/70 bg-danger-600/20' : 'border-white/30 bg-white/10'
      }`}
    >
      <span className={wrong ? 'text-danger-400' : 'text-white/60'}>
        {wrong ? (
          <IconCross className="h-4 w-4" />
        ) : (
          <span className="block h-2 w-2 rounded-[1px] border border-white/50" aria-hidden />
        )}
      </span>
      <span
        className={`font-display text-sm font-bold uppercase tracking-widest ${
          wrong ? 'text-danger-400' : 'text-white'
        }`}
      >
        Label: “{text}”
      </span>
    </span>
  )
}

function ItemCard({ task }: { task: Task }) {
  return (
    <div
      className="rounded-3xl border-2 border-white/15 bg-navy-900/80 p-5 text-center"
      style={{ animation: 'belt-drop 0.45s cubic-bezier(0.16, 1, 0.3, 1) both' }}
    >
      <div className="relative mx-auto inline-flex flex-col items-center rounded-2xl border border-glow/25 bg-navy-950/60 px-5 py-1.5">
        <span className="pointer-events-none absolute left-0 top-0 h-2.5 w-2.5 border-l-2 border-t-2 border-glow/60" />
        <span className="pointer-events-none absolute right-0 top-0 h-2.5 w-2.5 border-r-2 border-t-2 border-glow/60" />
        <span className="pointer-events-none absolute bottom-0 left-0 h-2.5 w-2.5 border-b-2 border-l-2 border-glow/60" />
        <span className="pointer-events-none absolute bottom-0 right-0 h-2.5 w-2.5 border-b-2 border-r-2 border-glow/60" />
        {task.kind === 'cleanSet' ? (
          <span className="grid h-[4.5rem] w-[4.5rem] place-items-center rounded-xl border border-glow/30 bg-navy-900/80 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-glow/80">
            SET
          </span>
        ) : (
          <span className="text-7xl leading-none">{task.emoji}</span>
        )}
      </div>
      <p className="mt-1.5 font-mono text-[0.5625rem] uppercase tracking-[0.22em] text-glow/60">
        {task.kind === 'cleanSet' ? 'dataset · unverified' : `sample ${task.id} · unverified`}
      </p>
      <div className="mt-3 flex flex-col items-center gap-2">
        {task.kind === 'fixLabel' && <LabelChip text={task.badLabel} wrong />}
        {task.kind === 'sortCrate' && <LabelChip text={task.label} />}
        {task.kind === 'cleanSet' && (
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 bg-white/10 px-4 py-1">
            <span className="font-display text-sm font-bold uppercase tracking-widest text-white">
              Set: “{task.label}”
            </span>
          </span>
        )}
        {task.kind === 'judgeClaim' && (
          <>
            <p className="max-w-md font-display text-lg font-bold text-white">“{task.claim}”</p>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-3 py-1 text-sm text-white/70">
              <span className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-glow/60">
                source
              </span>
              {task.source}
            </span>
          </>
        )}
      </div>
    </div>
  )
}

function ConveyorBelt() {
  return (
    <div className="relative mt-3 h-6 overflow-hidden rounded-full border-2 border-white/10 bg-navy-800">
      <div
        className="absolute inset-y-0 left-0 w-[140%]"
        style={{ animation: 'belt-scroll 1.2s linear infinite' }}
      >
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, rgba(255,255,255,0.14) 0 14px, transparent 14px 40px)',
            transform: 'skewX(-24deg)',
          }}
        />
      </div>
    </div>
  )
}

function SetTiles({
  task,
  selected,
  solved,
  attempt,
  onToggle,
}: {
  task: CleanSetTask
  selected: number[]
  solved: boolean
  attempt: number
  onToggle: (i: number) => void
}) {
  return (
    <div key={attempt} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {task.options.map((o, i) => {
        const picked = selected.includes(i)
        const revealed = solved && task.oddOnes.includes(i)
        return (
          <button
            key={o.name}
            type="button"
            disabled={solved}
            onClick={() => onToggle(i)}
            aria-pressed={picked}
            aria-label={o.name}
            className={`flex min-h-[7rem] flex-col items-center justify-center gap-1 rounded-3xl border-2 px-2 py-3 transition-all ${
              revealed
                ? 'border-danger-500 bg-danger-600/25 opacity-70'
                : picked
                  ? 'border-white bg-white/20 shadow-glow-white'
                  : 'border-white/20 bg-white/5 hover:border-white/50 hover:bg-white/10'
            }`}
          >
            <span className={`text-4xl leading-none ${revealed ? 'grayscale' : ''}`}>
              {o.emoji}
            </span>
            <span className="px-1 text-center text-xs font-bold leading-tight text-white/85">
              {o.name}
            </span>
            {picked && !solved && <IconCheck className="h-4 w-4 text-white" />}
            {revealed && <IconCross className="h-4 w-4 text-danger-400" />}
          </button>
        )
      })}
    </div>
  )
}

/* -------------------------------- Gameplay -------------------------------- */

export default function StationPlayer({ stationId, progress, onBack, onSectionComplete }: Props) {
  const station = STATIONS.find((s) => s.id === stationId) ?? STATIONS[0]
  const sections = sectionsOf(stationId)
  const starsPossible = maxStars(stationId)

  const [phase, setPhase] = useState<Phase>('brief')
  const [sectionIndex, setSectionIndex] = useState(0)
  const [taskIndex, setTaskIndex] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [sectionStarsEarned, setSectionStarsEarned] = useState(0)
  const [results, setResults] = useState<Record<number, number>>({})
  const [solved, setSolved] = useState(false)
  const [wrongIds, setWrongIds] = useState<string[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [attempt, setAttempt] = useState(0)
  const [hint, setHint] = useState<string | null>(null)
  const [boltMood, setBoltMood] = useState<Mood>('blank')

  const doneParts = Math.min(districtLights(progress, stationId), sections.length)
  const allDone = doneParts >= sections.length
  const bestStars = sections.reduce((sum, _, i) => sum + sectionStars(progress, stationId, i), 0)

  // Total stars across the station, counting anything earned in this run.
  const totalStars = sections.reduce(
    (sum, _, i) => sum + Math.max(sectionStars(progress, stationId, i), results[i] ?? 0),
    0,
  )

  if (sections.length === 0) {
    return (
      <div className="scanlines flex min-h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <IconLock className="h-10 w-10 text-white/50" />
        <p className="font-display text-2xl font-bold text-white">
          {station.name} isn&apos;t ready yet.
        </p>
        <button type="button" onClick={onBack} className="btn btn-primary gap-2">
          <IconArrow dir="left" className="h-5 w-5" /> Back to the map
        </button>
      </div>
    )
  }

  const section = sections[Math.min(sectionIndex, sections.length - 1)]
  const task = section.tasks[Math.min(taskIndex, section.tasks.length - 1)]
  const taskCount = section.tasks.length

  const clearTaskState = () => {
    setSolved(false)
    setMistakes(0)
    setWrongIds([])
    setSelected([])
    setHint(null)
    setBoltMood('blank')
  }

  const start = () => {
    sfx.chime()
    setSectionIndex(0)
    setTaskIndex(0)
    setSectionStarsEarned(0)
    setResults({})
    clearTaskState()
    setPhase('play')
  }

  const registerMistake = (id: string, message: string) => {
    sfx.nudge()
    setMistakes((m) => m + 1)
    setWrongIds((ids) => [...ids, id])
    setAttempt((a) => a + 1)
    setHint(message)
    setBoltMood('worried')
  }

  const succeed = () => {
    sfx.sort()
    setSectionStarsEarned((s) => s + starsForTask(mistakes))
    setSolved(true)
    setWrongIds([])
    setHint(null)
    setBoltMood('happy')
  }

  /** Move on to the next task, or hand the finished part over to the relight. */
  const nextTask = () => {
    if (taskIndex < taskCount - 1) {
      sfx.click()
      setTaskIndex((t) => t + 1)
      clearTaskState()
      return
    }
    // `sectionStarsEarned` already banked this task's stars in succeed().
    const earned = sectionStarsEarned
    setResults((r) => ({ ...r, [sectionIndex]: earned }))
    onSectionComplete(stationId, sectionIndex, earned)
    sfx.success()
    setPhase('relight')
  }

  const afterRelight = () => {
    sfx.click()
    const districtComplete =
      Math.max(districtLights(progress, stationId), sectionIndex + 1) >= sections.length
    if (sectionIndex + 1 < sections.length) {
      setSectionIndex((i) => i + 1)
      setTaskIndex(0)
      setSectionStarsEarned(0)
      clearTaskState()
      setPhase('play')
      return
    }
    if (districtComplete) setPhase('done')
    else onBack()
  }

  const pickOption = (option: string) => {
    if (solved) return
    if ((task.kind === 'fixLabel' || task.kind === 'judgeClaim') && option === task.answer)
      succeed()
    else registerMistake(option, `“${option}” isn't it. Look again.`)
  }

  const pickCrate = (i: 0 | 1) => {
    if (solved || task.kind !== 'sortCrate') return
    if (i === task.correctCrate) succeed()
    else registerMistake(`crate-${i}`, 'Wrong crate. Go by the picture, not the label.')
  }

  const toggleTile = (i: number) => {
    if (solved) return
    sfx.click()
    setSelected((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]))
  }

  const checkSet = () => {
    if (solved || task.kind !== 'cleanSet') return
    if (selected.length === 0) {
      setHint('Tick the ones that do not belong, then press Check.')
      return
    }
    const wrong = selected.filter((i) => !task.oddOnes.includes(i))
    if (wrong.length > 0) {
      registerMistake(`set-${wrong.join('-')}`, 'One of those actually belongs there. Look again.')
      return
    }
    if (selected.length < task.oddOnes.length) {
      sfx.click()
      setHint('Good start. There is at least one more.')
      setBoltMood('happy')
      return
    }
    succeed()
  }

  const boltLine = solved
    ? 'Logged. Stored to memory.'
    : mistakes > 0
      ? 'Check the sample again.'
      : 'Your turn.'

  const taskStars = starsForTask(mistakes)
  const lightsNow = Math.max(districtLights(progress, stationId), sectionIndex + 1)
  const districtCompleteNow = lightsNow >= sections.length

  /* ------------------------------- Renders -------------------------------- */

  if (phase === 'brief') {
    return (
      <div className="scanlines flex min-h-full w-full flex-col px-4 py-6 sm:px-8">
        <div className="m-auto w-full max-w-5xl">
          <Briefing
            stationName={station.name}
            lesson={station.lesson}
            parts={sections}
            doneParts={doneParts}
            allDone={allDone}
            bestStars={bestStars}
            starsPossible={starsPossible}
            onStart={start}
            onBack={onBack}
          />
        </div>
      </div>
    )
  }

  if (phase === 'relight') {
    return (
      <div className="scanlines flex min-h-full w-full flex-col px-4 py-6 sm:px-8">
        <div className="m-auto w-full max-w-3xl">
          <RelightCeremony
            district={station.name}
            lit={lightsNow}
            lightCount={sections.length}
            part={sectionIndex + 1}
            partCount={sections.length}
            starsEarned={sectionStarsEarned}
            starsPossible={section.tasks.length * STARS_PER_TASK}
            districtComplete={districtCompleteNow}
            nextPartTitle={sections[sectionIndex + 1]?.title}
            nextDifficulty={sections[sectionIndex + 1]?.difficulty}
            nextStationName={STATIONS.find((s) => s.id === stationId + 1)?.name}
            onContinue={afterRelight}
          />
        </div>
      </div>
    )
  }

  if (phase === 'done') {
    const summary = rank(totalStars, starsPossible)
    const nextStation = STATIONS.find((s) => s.id === stationId + 1)
    return (
      <div className="scanlines flex min-h-full w-full flex-col px-4 py-6 sm:px-8">
        <div className="m-auto w-full max-w-4xl text-center">
          <p className="font-display text-sm font-bold uppercase tracking-[0.3em] text-glow">
            {districtCompleteNow ? 'District online' : 'Part complete'}
          </p>
          <h2 className="mt-1 font-display text-4xl font-extrabold text-white sm:text-5xl">
            {station.name} online
          </h2>

          <div className="mt-6 rounded-3xl border-2 border-white bg-white/10 p-5 shadow-glow-white sm:p-6">
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <IconStar filled className="h-8 w-8 text-glow" />
              <span className="font-display text-4xl font-extrabold text-white">
                {totalStars}
                <span className="text-2xl text-white/60"> / {starsPossible}</span>
              </span>
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-white">{summary.title}</p>
            <p className="mx-auto mt-1 max-w-lg text-white/80">{summary.blurb}</p>
          </div>

          <div className="mt-5">
            <PowerGrid
              lights={STATIONS.map((s) => (s.id === stationId ? lightsNow : 0))}
              variant="inline"
            />
          </div>

          {nextStation &&
            (sectionCount(nextStation.id) > 0 ? (
              <div className="mt-5 rounded-3xl border-2 border-glow/50 bg-glow/10 p-5">
                <p className="font-mono text-xs font-medium uppercase tracking-[0.22em] text-glow/80">
                  Access granted
                </p>
                <p className="font-display text-xl font-bold text-white">
                  {nextStation.name} unlocked
                </p>
                <p className="mt-1 text-white/80">
                  {nextStation.lesson} — {nextStation.blurb}
                </p>
              </div>
            ) : (
              <div className="mt-5 rounded-3xl border-2 border-white/20 bg-navy-900/70 p-5">
                <p className="font-display text-xl font-bold text-white">
                  {nextStation.name} is next: {nextStation.lesson}
                </p>
                <p className="mt-1 text-white/80">
                  Echo is still writing those lessons. Your lights are safe until then.
                </p>
              </div>
            ))}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button type="button" onClick={start} className="btn btn-ghost gap-2">
              <IconReplay className="h-5 w-5" /> Try again for a better score
            </button>
            <button
              type="button"
              onClick={onBack}
              className="btn btn-primary gap-2 px-7 py-4 text-xl"
            >
              Back to the map <IconChevron className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="scanlines flex min-h-full w-full flex-col px-4 py-6 sm:px-8">
      <div className="m-auto w-full max-w-5xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="btn btn-ghost gap-1.5 px-4 py-2 text-base"
          >
            <IconArrow dir="left" className="h-5 w-5" /> Map
          </button>
          <span className="hidden font-mono text-xs font-medium uppercase tracking-[0.2em] text-white/60 sm:inline sm:text-sm">
            {station.name} · Part {sectionIndex + 1} of {sections.length}
          </span>
          <span className="rounded-full border-2 border-white/15 bg-navy-900/70 px-3 py-1.5 font-display text-sm font-bold text-white">
            <IconStar filled className="mr-1 inline h-4 w-4 text-glow" />
            {totalStars + sectionStarsEarned} / {starsPossible}
          </span>
        </div>

        <div className="animate-fade-in">
          {/* progress */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-body text-sm font-semibold text-white/70">
              {section.title} · task {taskIndex + 1} of {taskCount}
            </span>
            <span className="font-mono text-xs font-medium uppercase tracking-[0.22em] text-white/60">
              {roundFor(task)}
            </span>
            <span className="flex items-center gap-1" title={`${taskStars} stars still possible`}>
              {[0, 1, 2].map((i) => (
                <IconStar
                  key={i}
                  filled={i < taskStars}
                  className={`h-5 w-5 ${i < taskStars ? 'text-glow' : 'text-white/20'}`}
                />
              ))}
            </span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full border-2 border-white/10 bg-navy-900">
            <div
              className="h-full rounded-full bg-gradient-to-r from-glow to-white transition-all duration-500"
              style={{ width: `${((taskIndex + (solved ? 1 : 0)) / taskCount) * 100}%` }}
            />
          </div>

          {/* picture + Bolt */}
          <div className="mt-5 flex items-end gap-3 sm:gap-5">
            <div className="hidden shrink-0 flex-col items-center sm:flex">
              <span className="mb-2 max-w-[9rem] rounded-2xl border-2 border-white/15 bg-navy-900/80 px-3 py-2 text-center text-sm font-semibold text-white/85">
                {boltLine}
              </span>
              <Bolt mood={boltMood} size="6.5rem" waving={solved} />
            </div>

            <div className="min-w-0 flex-1">
              <ItemCard task={task} />
              <ConveyorBelt />
            </div>
          </div>

          <p className="mt-5 text-center font-display text-xl font-bold text-white sm:text-2xl">
            {promptFor(task)}
          </p>

          {/* choices */}
          {(task.kind === 'fixLabel' || task.kind === 'judgeClaim') && (
            <div key={attempt} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {task.options.map((o) => {
                const isWrong = wrongIds.includes(o)
                const isRight = solved && o === task.answer
                return (
                  <button
                    key={o}
                    type="button"
                    disabled={solved}
                    onClick={() => pickOption(o)}
                    aria-label={o}
                    className={`btn font-body min-h-[4.5rem] px-4 py-4 text-base sm:text-lg ${
                      isRight
                        ? 'border-2 border-white bg-white text-navy-950'
                        : isWrong
                          ? 'border-2 border-danger-500 bg-danger-600/30 text-white'
                          : 'btn-ghost'
                    }`}
                    style={isWrong ? { animation: 'nope 0.45s ease-in-out' } : undefined}
                  >
                    {o} {isRight && <IconCheck className="h-5 w-5" />}
                  </button>
                )
              })}
            </div>
          )}

          {task.kind === 'sortCrate' && (
            <div key={attempt} className="mt-4 grid gap-3 sm:grid-cols-2">
              {task.crates.map((crate, i) => {
                const isWrong = wrongIds.includes(`crate-${i}`)
                const isRight = solved && i === task.correctCrate
                return (
                  <button
                    key={crate}
                    type="button"
                    disabled={solved}
                    onClick={() => pickCrate(i as 0 | 1)}
                    aria-label={`Sort into ${crate}`}
                    className={`btn min-h-[6rem] flex-col gap-1 px-4 py-4 text-xl ${
                      isRight
                        ? 'border-2 border-white bg-white text-navy-950'
                        : isWrong
                          ? 'border-2 border-danger-500 bg-danger-600/30 text-white'
                          : 'btn-ghost'
                    }`}
                    style={isWrong ? { animation: 'nope 0.45s ease-in-out' } : undefined}
                  >
                    <span className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-glow/70">
                      Crate {i === 0 ? 'A' : 'B'}
                    </span>
                    {crate}
                    {isRight && <IconCheck className="h-5 w-5" />}
                  </button>
                )
              })}
            </div>
          )}

          {task.kind === 'cleanSet' && (
            <>
              <div className="mt-4">
                <SetTiles
                  task={task}
                  selected={selected}
                  solved={solved}
                  attempt={attempt}
                  onToggle={toggleTile}
                />
              </div>
              <p className="mt-2 text-center text-sm text-white/60">
                {solved
                  ? `Found all ${task.oddOnes.length} of them.`
                  : `${selected.length} picked. Press Check when you're ready.`}
              </p>
              {!solved && (
                <div className="mt-3 flex justify-center">
                  <button
                    type="button"
                    onClick={checkSet}
                    className="btn btn-primary gap-2 px-7 py-3 text-lg"
                  >
                    <IconCheck className="h-5 w-5" /> Check answers
                  </button>
                </div>
              )}
            </>
          )}

          {/* feedback */}
          <div className="mt-4 min-h-[7.5rem]" aria-live="polite">
            {solved ? (
              <div className="animate-pop-in rounded-3xl border-2 border-white bg-white/10 p-4 shadow-glow-white sm:p-5">
                <div className="flex items-center gap-2">
                  <IconCheck className="h-6 w-6 text-glow" />
                  <span className="font-display text-xl font-bold text-white">
                    {task.kind === 'cleanSet' ? 'All cleaned up.' : 'Correct.'} Bolt saved it.
                  </span>
                  <span className="ml-auto flex items-center gap-1 font-display font-bold text-white">
                    {Array.from({ length: taskStars }, (_, i) => (
                      <IconStar key={i} filled className="h-5 w-5 text-glow" />
                    ))}
                  </span>
                </div>
                <p className="mt-1 text-white/85">{task.why}</p>
                <button
                  type="button"
                  onClick={nextTask}
                  className="btn btn-primary mt-3 gap-2 px-6 py-3 text-lg"
                  aria-label={taskIndex < taskCount - 1 ? 'Next task' : 'Finish this part'}
                >
                  {taskIndex < taskCount - 1 ? 'Next task' : 'Finish this part'}
                  <IconChevron className="h-5 w-5" />
                </button>
              </div>
            ) : hint ? (
              <div
                className="rounded-3xl border-2 border-danger-500/70 bg-danger-600/15 p-4 sm:p-5"
                style={{ animation: 'fade-in 0.25s ease-out both' }}
              >
                <p className="font-display text-lg font-bold text-danger-400">
                  Not quite. Have another go.
                </p>
                <p className="mt-1 text-white/85">{hint}</p>
              </div>
            ) : (
              <div className="rounded-3xl border border-white/10 bg-navy-900/50 p-4 text-center font-mono text-xs uppercase tracking-[0.18em] text-white/50 sm:p-5">
                A wrong pick costs a star, never the run
              </div>
            )}
          </div>

          {/* Bolt reaction on small screens */}
          <div className="mt-4 flex flex-col items-center gap-2 sm:hidden">
            <span className="max-w-xs rounded-2xl border-2 border-white/15 bg-navy-900/80 px-3 py-2 text-center text-sm font-semibold text-white/85">
              {boltLine}
            </span>
            <Bolt mood={boltMood} size="6rem" waving={solved} />
          </div>
        </div>
      </div>
    </div>
  )
}
