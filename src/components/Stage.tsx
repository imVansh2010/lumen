import { useCallback, useEffect } from 'react'
import type { Beat, Mood } from '../story/types'
import { SPEAKERS } from '../story/script'
import { useTypewriter } from '../hooks/useTypewriter'
import { clearHush, hushMusic, sfx } from '../game/audio'
import SceneLayers from './SceneLayers'
import SceneCast from './SceneCast'
import DialogueBox from './DialogueBox'
import { StoryControls, StoryTopBar } from './Controls'

interface Props {
  beat: Beat
  chapterIndex: number
  chapterCount: number
  isLast: boolean
  isFirst: boolean
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  sound: boolean
  onToggleSound: () => void
  reduced: boolean
  /** Lit lights per district (4 numbers), from saved progress. */
  lights: number[]
}

export default function Stage({
  beat,
  chapterIndex,
  chapterCount,
  isLast,
  isFirst,
  onNext,
  onBack,
  onSkip,
  sound,
  onToggleSound,
  reduced,
  lights,
}: Props) {
  const { shown, done, finish } = useTypewriter(beat.text, { interval: 24, instant: reduced })

  // When someone else is speaking, Echo still mirrors the scene — she is rattled
  // through the bad-data chaos and worried once the lights go out, never cheerful.
  const sceneEchoMood: Mood =
    beat.visual === 'chaos' || beat.visual === 'blackout' ? 'worried' : 'happy'
  const echoMood: Mood = beat.speaker === 'echo' ? (beat.mood ?? 'happy') : sceneEchoMood
  const boltMood: Mood =
    beat.speaker === 'bolt'
      ? (beat.mood ?? 'happy')
      : beat.speaker === 'trainer'
        ? 'happy'
        : 'blank'

  // Fire the beat's sound when the beat changes.
  useEffect(() => {
    if (beat.sfx && sound) sfx[beat.sfx]()
  }, [beat.id, beat.sfx, sound])

  // Soft keys while the line types itself out.
  useEffect(() => {
    if (!sound || reduced || done) return
    sfx.type()
  }, [shown, sound, reduced, done])

  // Hush the music under the reveal so the keystrokes read clearly, then let it
  // swell back as soon as the line finishes.
  useEffect(() => {
    if (!sound || reduced) return
    if (done) {
      clearHush()
      return
    }
    hushMusic()
    return () => clearHush()
  }, [done, sound, reduced])

  const advance = useCallback(() => {
    if (!done) {
      finish()
      return
    }
    onNext()
  }, [done, finish, onNext])

  // Keyboard shortcuts for grown-up helpers and older kids.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        advance()
      } else if (e.key === 'ArrowLeft') {
        onBack()
      } else if (e.key === 'Escape') {
        onSkip()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [advance, onBack, onSkip])

  const speaker = SPEAKERS[beat.speaker]
  const shake = beat.fx?.includes('shake') ?? false

  // In the repair-shop scenes the cast stands on a workbench near the floor, so
  // the room reads as a room instead of the characters hanging in the ceiling.
  const showGrid = beat.visual === 'blackout' || beat.visual === 'plan' || beat.visual === 'map'
  const roomScene = !['city', 'festival', 'chaos', 'blackout'].includes(beat.visual)
  const floorScene = roomScene && !showGrid

  return (
    <div
      className="scanlines relative flex h-full w-full flex-col overflow-hidden"
      onClick={advance}
      role="presentation"
    >
      {/* Scene */}
      <div
        key={beat.id}
        className={`absolute inset-0 ${shake ? 'animate-shake' : ''}`}
        style={reduced ? undefined : { animation: 'scene-in 0.6s ease-out both' }}
      >
        <SceneLayers visual={beat.visual} fx={beat.fx ?? []} />
      </div>

      {/* Soft darkening so dialogue stays readable over bright scenes */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-navy-950 via-navy-950/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-navy-950/70 to-transparent" />

      <StoryTopBar onSkip={onSkip} sound={sound} onToggleSound={onToggleSound} />

      {/* Cast sits high in the free space, clear of the location chip — except
          in the workshop, where it settles down onto the workbench.
          That bottom padding is what keeps Bolt centred in the free space
          instead of pinned to the bottom band: it grows with the window so the
          cast keeps the same proportion on short and tall screens alike. */}
      <div
        className={`relative z-20 flex min-h-0 flex-1 justify-center px-4 pt-20 sm:pt-24 ${
          floorScene ? 'items-end pb-[clamp(3.5rem,20vh,12rem)]' : 'items-start pb-4'
        }`}
      >
        <SceneCast
          visual={beat.visual}
          echoMood={echoMood}
          boltMood={boltMood}
          activeSpeaker={beat.speaker}
          fx={beat.fx ?? []}
          lights={lights}
        />
      </div>

      {/* Dialogue + controls form one bottom band. The horizontal padding and
          the bottom padding are deliberately identical, so the gap from the
          screen edge to Back/Next is the same on all three sides. */}
      <div className="relative z-30 flex w-full flex-col gap-4 px-4 pb-4 sm:gap-6 sm:px-6 sm:pb-6">
        <DialogueBox
          speaker={speaker}
          shown={shown}
          done={done}
          glitchy={beat.mood === 'glitch'}
          trainer={beat.speaker === 'trainer'}
        />
        <StoryControls
          onBack={onBack}
          onNext={advance}
          backDisabled={isFirst}
          nextLabel={isLast ? 'Meet the stations' : 'Next'}
          chapter={beat.chapter}
          chapterIndex={chapterIndex}
          chapterCount={chapterCount}
        />
      </div>
    </div>
  )
}
