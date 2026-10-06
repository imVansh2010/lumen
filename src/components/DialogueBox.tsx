import type { Speaker } from '../story/types'

interface Props {
  speaker: Speaker
  shown: string
  done: boolean
  glitchy: boolean
  /**
   * True when the line belongs to the player. Trainer lines get their own
   * outline and a touch more room, so the player instantly recognizes their
   * own transmission.
   * The variant lives in CSS (`.dialogue-box--trainer`) rather than as a pile
   * of conditional utilities: two Tailwind classes that set the same property
   * are resolved by stylesheet order, not by their order in the class list, so
   * a conditional utility would never apply.

 */
  trainer: boolean
}

export default function DialogueBox({ speaker, shown, done, glitchy, trainer }: Props) {
  return (
    <div
      className={`dialogue-box ${trainer ? 'dialogue-box--trainer' : ''} transition-all duration-300`}
    >
      <div className="flex items-center gap-3">
        <span className={`dialogue-speaker font-display font-bold tracking-wide ${speaker.accent}`}>
          {speaker.name}
        </span>
        <span className="hud-label ml-auto text-white/40">
          {done ? 'Advance ▸' : 'Transmitting…'}
        </span>
      </div>

      <p className="dialogue-line font-body leading-snug text-white">
        <span
          className={glitchy ? 'glitch-text' : undefined}
          data-text={glitchy ? shown : undefined}
        >
          {shown}
        </span>
        {!done && <span className="typewriter-caret" aria-hidden />}
      </p>
    </div>
  )
}
