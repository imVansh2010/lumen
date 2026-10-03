import type { Beat, Speaker, SpeakerId } from './types'

export const SPEAKERS: Record<SpeakerId, Speaker> = {
  narrator: {
    name: 'Story',
    accent: 'text-white/70',
    avatarBg: 'bg-white/10',
    emoji: '📖',
  },
  echo: {
    name: 'Echo',
    accent: 'text-glow',
    avatarBg: 'bg-glow/20',
    emoji: '🌐',
  },
  bolt: {
    name: 'Bolt',
    accent: 'text-white',
    avatarBg: 'bg-white/20',
    emoji: '🤖',
  },
  trainer: {
    name: 'You (Trainer)',
    accent: 'text-white',
    avatarBg: 'bg-white/20',
    emoji: '🎒',
  },
}

/* The complete intro, in order. Short lines, one idea at a time:
   Echo runs Lumen and learns from what people send her → careless uploads teach
   her wrong things → she makes a bad decision and the city goes dark → a clean,
   empty robot (Bolt) has to be trained properly, so he can teach Echo back. */
export const BEATS: Beat[] = [
  /* ----------------------- 1 · Meet Lumen and Echo ------------------------ */
  {
    id: 'c1-1',
    chapter: 'Meet Lumen',
    visual: 'city',
    speaker: 'narrator',
    text: 'High above the clouds floats Lumen — a small city that runs on one friendly AI.',
    sfx: 'whoosh',
  },
  {
    id: 'c1-2',
    chapter: 'Meet Lumen',
    visual: 'city',
    speaker: 'echo',
    mood: 'happy',
    text: "Hi, I'm Echo! I keep the lights on, the trains running and the water warm.",
    sfx: 'chime',
  },
  {
    id: 'c1-3',
    chapter: 'Meet Lumen',
    visual: 'city',
    speaker: 'narrator',
    text: 'Echo is not magic. She learns from every picture, message and question people send her.',
  },

  /* ------------------------ 2 · The Festival of Ideas --------------------- */
  {
    id: 'c2-1',
    chapter: 'The Festival of Ideas',
    visual: 'festival',
    speaker: 'narrator',
    text: 'Once a year Lumen holds the Festival of Ideas. Everyone sends Echo new things to learn from.',
    fx: ['confetti'],
    sfx: 'success',
  },
  {
    id: 'c2-2',
    chapter: 'The Festival of Ideas',
    visual: 'festival',
    speaker: 'echo',
    mood: 'happy',
    text: 'Send it all in! The more I learn, the better I can help.',
    sfx: 'upload',
  },
  {
    id: 'c2-3',
    chapter: 'The Festival of Ideas',
    visual: 'festival',
    speaker: 'narrator',
    text: 'But this year, nobody checked the uploads before Echo learned from them.',
  },

  /* --------------------- 3 · Bad examples, bad answers -------------------- */
  {
    id: 'c3-1',
    chapter: 'Bad Examples, Bad Answers',
    visual: 'chaos',
    speaker: 'narrator',
    text: 'A spiky monster was labelled “cupcake”. The label was simply wrong.',
    fx: ['shake'],
    sfx: 'whoosh',
  },
  {
    id: 'c3-2',
    chapter: 'Bad Examples, Bad Answers',
    visual: 'chaos',
    speaker: 'narrator',
    text: 'A rumour said cats can fly. A note shouted “DO IT NOW!!”. Someone shared a private door code.',
    fx: ['alert'],
  },
  {
    id: 'c3-3',
    chapter: 'Bad Examples, Bad Answers',
    visual: 'chaos',
    speaker: 'echo',
    mood: 'glitch',
    text: "Wait… is that true? I can't tell what is real any more. There is too much noise!",
    fx: ['shake'],
    sfx: 'alarm',
  },
  {
    id: 'c3-4',
    chapter: 'Bad Examples, Bad Answers',
    visual: 'chaos',
    speaker: 'narrator',
    text: 'Echo learns from examples. So bad examples gave her bad answers.',
  },
  {
    id: 'c3-5',
    chapter: 'Bad Examples, Bad Answers',
    visual: 'blackout',
    speaker: 'narrator',
    text: 'Then she switched off the wrong power line, and all four districts went dark.',
    fx: ['blackout', 'sparks'],
    sfx: 'blackout',
  },
  {
    id: 'c3-6',
    chapter: 'Bad Examples, Bad Answers',
    visual: 'blackout',
    speaker: 'echo',
    mood: 'worried',
    text: "I don't trust my own answers any more. Lumen, I'm sorry… I need help.",
  },

  /* --------------------------- 4 · Bolt wakes up -------------------------- */
  {
    id: 'c4-1',
    chapter: 'Bolt Wakes Up',
    visual: 'shop',
    speaker: 'narrator',
    text: 'Down on the ground floor, a little cardboard robot booted up for the very first time.',
    sfx: 'boot',
  },
  {
    id: 'c4-2',
    chapter: 'Bolt Wakes Up',
    visual: 'shop',
    speaker: 'bolt',
    mood: 'blank',
    text: "Beep? My memory is empty. I don't know anything yet.",
  },
  {
    id: 'c4-3',
    chapter: 'Bolt Wakes Up',
    visual: 'meetBolt',
    speaker: 'narrator',
    text: 'This is Bolt — a clean, empty brain, kept in the repair shop for a day like this.',
  },
  {
    id: 'c4-4',
    chapter: 'Bolt Wakes Up',
    visual: 'meetBolt',
    speaker: 'narrator',
    text: 'Echo is too mixed up to fix herself. She needs a Trainer to teach Bolt properly — with good examples.',
  },
  {
    id: 'c4-5',
    chapter: 'Bolt Wakes Up',
    visual: 'meetBolt',
    speaker: 'trainer',
    mood: 'happy',
    text: "Good thing I'm here. Hello Bolt — I'm your Trainer.",
  },
  {
    id: 'c4-6',
    chapter: 'Bolt Wakes Up',
    visual: 'meetBolt',
    speaker: 'bolt',
    mood: 'happy',
    text: 'Teach me! Where do we start?',
  },

  /* -------------------- 5 · Four lessons to learn ------------------------- */
  {
    id: 'c5-1',
    chapter: 'Four Lessons to Learn',
    visual: 'plan',
    speaker: 'narrator',
    text: 'Lumen has four districts, and each one needs one lesson about how AI thinks.',
    sfx: 'chime',
  },
  {
    id: 'c5-2',
    chapter: 'Four Lessons to Learn',
    visual: 'plan',
    speaker: 'echo',
    mood: 'worried',
    text: 'Teach Bolt one lesson per district. He can pass them on to me — and my lights can come back.',
    fx: ['sparks'],
  },
  {
    id: 'c5-3',
    chapter: 'Four Lessons to Learn',
    visual: 'plan',
    speaker: 'narrator',
    text: 'Lesson one: AI learns from examples. That lesson is called data and training.',
  },
  {
    id: 'c5-4',
    chapter: 'Four Lessons to Learn',
    visual: 'map',
    speaker: 'trainer',
    mood: 'happy',
    text: 'Ready? Let’s start at Station 1 — the Sorting Yard!',
    sfx: 'chime',
  },
]

/** Distinct chapter titles, in order — powers the progress rail. */
export const CHAPTERS = Array.from(new Set(BEATS.map((b) => b.chapter)))
