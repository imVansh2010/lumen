/* Story data model for the LUMEN intro.
   (Setting: the sky city of Lumen, run by the friendly AI Echo.)
   The whole introduction is authored as an ordered list of beats so it is easy
   to read, reorder, and tune without touching any rendering code. */

export type VisualKey =
  'city' | 'festival' | 'chaos' | 'blackout' | 'shop' | 'meetBolt' | 'plan' | 'map'

export type Mood = 'calm' | 'happy' | 'worried' | 'glitch' | 'blank' | 'proud'

export type SpeakerId = 'narrator' | 'echo' | 'bolt' | 'trainer'

/** Extra one-shot effects a beat can trigger on the stage. */
export type BeatFx =
  'confetti' | 'shake' | 'alert' | 'blackout' | 'sparks' | 'dimDistricts' | 'relight'

export type SfxKey =
  'whoosh' | 'chime' | 'upload' | 'alarm' | 'blackout' | 'boot' | 'click' | 'success'

export interface Beat {
  id: string
  /** Chapter title shown above the dialogue, and used for the progress rail. */
  chapter: string
  visual: VisualKey
  speaker: SpeakerId
  text: string
  mood?: Mood
  sfx?: SfxKey
  fx?: BeatFx[]
}

export interface Speaker {
  name: string
  /** Tailwind text color for the name plate. */
  accent: string
  /** Ring / bubble color behind the small avatar. */
  avatarBg: string
  emoji: string
}
