import type { Beat, Speaker, SpeakerId } from './types'

export const SPEAKERS: Record<SpeakerId, Speaker> = {
  narrator: {
    name: 'Narrator',
    accent: 'text-white/70',
    avatarBg: 'bg-white/10',
    emoji: '▣',
  },
  echo: {
    name: 'Echo',
    accent: 'text-glow',
    avatarBg: 'bg-glow/20',
    emoji: '◉',
  },
  bolt: {
    name: 'Bolt',
    accent: 'text-white',
    avatarBg: 'bg-white/20',
    emoji: '⬢',
  },
  trainer: {
    name: 'You (Trainer)',
    accent: 'text-white',
    avatarBg: 'bg-white/20',
    emoji: '▶',
  },
}

/* The complete intro, in order. One short line per beat, written the way a
   person would say it out loud:

   Echo runs Lumen and learns from everything people send her. This year nobody
   checked the uploads, so she learned from bad data, cut the wrong power line
   and the four districts went dark. A blank unit called Bolt wakes up in the
   repair bay, and a Trainer has to teach him properly so he can teach Echo. */
export const BEATS: Beat[] = [
  /* -------------------------- 1 · Meet Lumen ------------------------------ */
  {
    id: 'c1-1',
    chapter: 'Meet Lumen',
    visual: 'city',
    speaker: 'narrator',
    text: 'High above the clouds, a city called Lumen runs on one learning system.',
    sfx: 'whoosh',
  },
  {
    id: 'c1-2',
    chapter: 'Meet Lumen',
    visual: 'city',
    speaker: 'echo',
    mood: 'happy',
    text: "Hi, I'm Echo. I keep the lights on, the trains running and the water warm.",
    sfx: 'chime',
  },
  {
    id: 'c1-3',
    chapter: 'Meet Lumen',
    visual: 'city',
    speaker: 'narrator',
    text: 'Echo is not magic. She learns from every picture, message and question she gets.',
  },

  /* ------------------------ 2 · The Festival of Ideas --------------------- */
  {
    id: 'c2-1',
    chapter: 'The Festival of Ideas',
    visual: 'festival',
    speaker: 'narrator',
    text: 'Once a year, the Festival of Ideas lets anyone send Echo something new to learn.',
    fx: ['confetti'],
    sfx: 'success',
  },
  {
    id: 'c2-2',
    chapter: 'The Festival of Ideas',
    visual: 'festival',
    speaker: 'echo',
    mood: 'happy',
    text: 'Send it all in. The more I learn, the more I can help.',
    sfx: 'upload',
  },
  {
    id: 'c2-3',
    chapter: 'The Festival of Ideas',
    visual: 'festival',
    speaker: 'narrator',
    text: 'But this year, nobody checked the uploads before Echo learned from them.',
  },

  /* --------------------- 3 · Bad Data, Bad Answers ----------------------- */
  {
    id: 'c3-1',
    chapter: 'Bad Data, Bad Answers',
    visual: 'chaos',
    speaker: 'narrator',
    text: 'It started with one fake photo, passed off as real. Nobody checked.',
    fx: ['shake'],
    sfx: 'whoosh',
  },
  {
    id: 'c3-2',
    chapter: 'Bad Data, Bad Answers',
    visual: 'chaos',
    speaker: 'narrator',
    text: 'Then one anonymous claim spread as fact, and an urgent post told everyone to act.',
    fx: ['alert'],
  },
  {
    id: 'c3-3',
    chapter: 'Bad Data, Bad Answers',
    visual: 'chaos',
    speaker: 'echo',
    mood: 'glitch',
    text: "Wait. Loud doesn't mean true. And someone posted my private code. That's a break-in.",
    fx: ['shake'],
    sfx: 'alarm',
  },
  {
    id: 'c3-4',
    chapter: 'Bad Data, Bad Answers',
    visual: 'chaos',
    speaker: 'narrator',
    text: 'A fake photo, a rumour and a leaked code, all treated as facts.',
  },
  {
    id: 'c3-5',
    chapter: 'Bad Data, Bad Answers',
    visual: 'blackout',
    speaker: 'narrator',
    text: 'Then she cut the wrong power line, and all four districts went dark.',
    fx: ['blackout', 'sparks'],
    sfx: 'blackout',
  },
  {
    id: 'c3-6',
    chapter: 'Bad Data, Bad Answers',
    visual: 'blackout',
    speaker: 'echo',
    mood: 'worried',
    text: "I don't trust my own answers now. Lumen, I'm sorry. I need help.",
  },

  /* --------------------------- 4 · Bolt Wakes Up -------------------------- */
  {
    id: 'c4-1',
    chapter: 'Bolt Wakes Up',
    visual: 'shop',
    speaker: 'narrator',
    text: 'Down on the ground deck, a blank unit switched on for the first time.',
    sfx: 'boot',
  },
  {
    id: 'c4-2',
    chapter: 'Bolt Wakes Up',
    visual: 'shop',
    speaker: 'bolt',
    mood: 'blank',
    text: "My memory is empty. I don't know anything yet.",
  },
  {
    id: 'c4-3',
    chapter: 'Bolt Wakes Up',
    visual: 'meetBolt',
    speaker: 'narrator',
    text: 'This is Bolt, a blank unit kept in the repair bay for a day like this.',
  },
  {
    id: 'c4-4',
    chapter: 'Bolt Wakes Up',
    visual: 'meetBolt',
    speaker: 'narrator',
    text: "Echo can't fix herself. She needs you to teach Bolt properly, with examples you've checked.",
  },
  {
    id: 'c4-5',
    chapter: 'Bolt Wakes Up',
    visual: 'meetBolt',
    speaker: 'trainer',
    mood: 'happy',
    text: "Good thing I'm here. Hello, Bolt. I'm your trainer.",
  },
  {
    id: 'c4-6',
    chapter: 'Bolt Wakes Up',
    visual: 'meetBolt',
    speaker: 'bolt',
    mood: 'happy',
    text: 'Great. Where do we start?',
  },

  /* -------------------- 5 · Four Lessons to Learn ------------------------- */
  {
    id: 'c5-1',
    chapter: 'Four Lessons to Learn',
    visual: 'plan',
    speaker: 'narrator',
    text: 'Lumen has four districts. Each one needs one lesson about how AI thinks.',
    sfx: 'chime',
  },
  {
    id: 'c5-2',
    chapter: 'Four Lessons to Learn',
    visual: 'plan',
    speaker: 'echo',
    mood: 'worried',
    text: "Teach Bolt one lesson per district. He'll pass it on to me, and my lights come back.",
    fx: ['sparks'],
  },
  {
    id: 'c5-3',
    chapter: 'Four Lessons to Learn',
    visual: 'plan',
    speaker: 'narrator',
    text: "Lesson one: AI learns from examples. That's called data and training.",
  },
  {
    id: 'c5-4',
    chapter: 'Four Lessons to Learn',
    visual: 'map',
    speaker: 'trainer',
    mood: 'happy',
    text: "Ready? Let's start at Station 1, the Sorting Yard.",
    sfx: 'chime',
  },
]

/** Distinct chapter titles, in order — powers the progress rail. */
export const CHAPTERS = Array.from(new Set(BEATS.map((b) => b.chapter)))
