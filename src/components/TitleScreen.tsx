import SkyCity from './visuals/SkyCity'
import EchoOrb from './visuals/EchoOrb'
import { StoryTopBar } from './Controls'
import { IconArrow, IconPlay, IconSkip, IconSparkle } from './ui/icons'

interface Props {
  onPlay: () => void
  onSkipToStations: () => void
  sound: boolean
  onToggleSound: () => void
}

export default function TitleScreen({ onPlay, onSkipToStations, sound, onToggleSound }: Props) {
  return (
    <div className="scanlines relative h-full w-full overflow-hidden">
      <SkyCity lightsOn />

      {/* Dark scrim keeps the white text crisp over the busy sky */}
      <div className="absolute inset-0 bg-navy-950/50" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: 'inset 0 0 220px 70px rgba(5,11,26,0.92)' }}
      />
      {/* Extra pool of darkness behind the text */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(680px 460px at 50% 50%, rgba(5,11,26,0.92), transparent 74%)',
        }}
      />

      <StoryTopBar onSkip={onSkipToStations} sound={sound} onToggleSound={onToggleSound} />

      {/* Text block sits dead-centre between the top and bottom of the page.
          Echo is the first item *in* the column rather than absolutely pinned
          above it: a fixed `top` let the centred column climb into her on
          shorter windows, and as flow content she scales with the root
          font-size and can never overlap the wordmark. */}
      <div className="relative z-20 grid h-full w-full place-items-center px-6 text-center">
        <div className="flex flex-col items-center">
          <div className="title-echo pointer-events-none">
            <div className="animate-float-slow">
              <EchoOrb mood="happy" size="7.75rem" />
            </div>
          </div>

          <h1
            className="animate-pop-in bg-gradient-to-b from-white via-white to-glow bg-clip-text font-body text-[clamp(3.25rem,13vw,7.5rem)] font-black leading-none tracking-[0.05em] text-transparent"
            style={{ filter: 'drop-shadow(0 4px 24px rgba(156,200,255,0.45))' }}
          >
            LUMEN
          </h1>

          <p
            className="mt-4 font-display text-2xl font-bold tracking-wide text-danger-400 sm:text-3xl"
            style={{ textShadow: '0 0 20px rgba(239,68,68,0.4)' }}
          >
            Teaching AI to think
          </p>

          <p className="mt-5 max-w-xl text-balance text-lg font-semibold leading-snug text-white/85 sm:text-xl">
            Echo&apos;s sky-city lost its power. Guide Bolt through four districts to learn how AI
            thinks — and bring the lights back on.
          </p>

          <button
            type="button"
            onClick={onPlay}
            className="btn btn-primary mt-9 w-full max-w-md gap-3 whitespace-nowrap px-10 py-5 text-2xl sm:w-auto sm:px-16 sm:text-3xl"
            aria-label="Start the story"
          >
            <IconPlay className="h-8 w-8" /> Start the story
          </button>

          <button
            type="button"
            onClick={onSkipToStations}
            className="mt-5 inline-flex items-center gap-2 font-display text-base font-bold uppercase tracking-widest text-white/60 transition-colors hover:text-white sm:text-lg"
          >
            <IconSkip className="h-5 w-5" /> Skip to the stations
          </button>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-center gap-2 bg-gradient-to-t from-navy-950 to-transparent px-3 pb-4 pt-10 text-center text-white/50">
        <IconSparkle className="hidden h-4 w-4 shrink-0 sm:block" />
        <span className="font-display text-xs font-bold uppercase tracking-wider sm:text-sm sm:tracking-widest">
          4 districts · 4 lessons · 1 little robot
        </span>
        <IconArrow className="hidden h-4 w-4 shrink-0 sm:block" />
      </div>
    </div>
  )
}
