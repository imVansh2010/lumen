import { IconArrow, IconChevron, IconSkip, IconSound } from './ui/icons'

/* ------------------------------- Top bar ---------------------------------- */

interface TopBarProps {
  onSkip: () => void
  sound: boolean
  onToggleSound: () => void
}

export function StoryTopBar({ onSkip, sound, onToggleSound }: TopBarProps) {
  const round = 'grid h-12 w-12 place-items-center rounded-full border-2 transition-colors'
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-start justify-end gap-3 p-3 sm:p-4">
      <div className="pointer-events-auto flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleSound()
          }}
          aria-pressed={sound}
          aria-label={sound ? 'Turn sound off' : 'Turn sound on'}
          title={sound ? 'Sound: on' : 'Sound: off'}
          className={`${round} ${sound ? 'border-white bg-white text-navy-950' : 'border-white/20 bg-navy-900/70 text-white/70 hover:border-white/50'}`}
        >
          <IconSound muted={!sound} className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onSkip()
          }}
          className="btn btn-ghost gap-1.5 px-3 py-2 text-xs uppercase tracking-widest sm:px-4"
          aria-label="Skip the story and go to the stations"
        >
          <IconSkip className="h-5 w-5" /> <span className="hidden sm:inline">Skip</span>
        </button>
      </div>
    </div>
  )
}

/* ------------------------------ Bottom bar -------------------------------- */

interface ControlsProps {
  onBack: () => void
  onNext: () => void
  backDisabled: boolean
  nextLabel: string
  chapter: string
  chapterIndex: number
  chapterCount: number
}

export function StoryControls({
  onBack,
  onNext,
  backDisabled,
  nextLabel,
  chapter,
  chapterIndex,
  chapterCount,
}: ControlsProps) {
  // Back and Next are deliberately the same size, so the pair reads as one
  // matched pair of buttons instead of two unrelated controls.
  const navBtn =
    'btn pointer-events-auto gap-2 px-5 py-3 text-base sm:px-7 sm:py-4 sm:text-xl'

  return (
    <div className="pointer-events-none flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onBack()
        }}
        disabled={backDisabled}
        className={`${navBtn} btn-ghost`}
        aria-label="Go back one line"
      >
        <IconArrow dir="left" className="h-5 w-5 sm:h-6 sm:w-6" /> Back
      </button>

      <div className="pointer-events-none hidden flex-col items-center gap-1.5 sm:flex">
        <span className="hud-label text-xs text-white/65">{chapter}</span>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: chapterCount }, (_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-sm transition-all ${
                i === chapterIndex
                  ? 'w-8 bg-glow'
                  : i < chapterIndex
                    ? 'w-3 bg-glow/60'
                    : 'w-3 bg-white/15'
              }`}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onNext()
        }}
        className={`${navBtn} btn-primary`}
        aria-label="Next line"
      >
        {nextLabel} <IconChevron className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
    </div>
  )
}
