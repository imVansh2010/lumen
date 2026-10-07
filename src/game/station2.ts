import type { Section } from './tasks'

/* Station 2 · Signal Square - checking a claim before you believe it.

   The lesson is not "trust nothing". It is "find out where it came from", and
   every wrong option here is a real habit rather than a joke: believing a
   confident voice, believing something because it was printed, or swinging the
   other way and trusting nothing at all.

   The six sources climb: no source, a source that gains from the claim, one
   person's story, a source that checks itself, a claim you can test yourself,
   and a private-code trap. */

export const STATION_2_SECTIONS: Section[] = [
  {
    id: '2-0',
    title: 'Check before you believe',
    blurb: 'Six messages land in Echo’s inbox. Which ones can you trust?',
    difficulty: 'Tricky',
    tasks: [
      {
        kind: 'judgeClaim',
        id: 'j1',
        emoji: '📸',
        claim: 'The reservoir froze solid last night.',
        source: 'Posted anonymously — no date, no place, no name.',
        question: 'Nobody can say where this came from. What should Bolt do?',
        options: [
          'Trust it — the photo looks real',
          'Check it first — nobody can say where it came from',
          'Share it — more people can help check it',
          'Ignore it — a photo can never be trusted',
        ],
        answer: 'Check it first — nobody can say where it came from',
        why: 'A picture with no source can be real, edited or staged. Check before you pass it on.',
      },
      {
        kind: 'judgeClaim',
        id: 'j2',
        emoji: '🍪',
        claim: 'Our cookies are the healthiest food in the world.',
        source: 'An advert paid for by the company that makes them',
        question: 'Who is saying this, and what do they gain from it?',
        options: [
          'It must be true — it was printed',
          'The seller gains from it, so ask someone who is not selling cookies',
          'No advert can ever be trusted',
          'It is popular, so it is probably healthy',
        ],
        answer: 'The seller gains from it, so ask someone who is not selling cookies',
        why: 'They sell the cookies, so of course they praise them. A source that gains from the claim is not enough on its own.',
      },
      {
        kind: 'judgeClaim',
        id: 'j3',
        emoji: '💬',
        claim: 'The city is charging for rooftop gardens next month.',
        source: 'A friend who heard it from someone else',
        question: 'One person’s story, with no proof. Is that enough to act on?',
        options: [
          'Yes — a friend would not make it up',
          'Not yet — one story is not evidence, so ask for proof',
          'Yes, if enough people repeat it',
          'Yes, if it sounds exciting',
        ],
        answer: 'Not yet — one story is not evidence, so ask for proof',
        why: 'One story can start a rumour, and repeating it does not add proof. Wait for something others can check.',
      },
      {
        kind: 'judgeClaim',
        id: 'j4',
        emoji: '🌧️',
        claim: 'Rain at three o’clock this afternoon.',
        source: 'The Lumen weather service, rebuilt from fresh readings every hour',
        question: 'This source corrects itself as new readings arrive. What should Bolt do?',
        options: [
          'Trust this one — it is checked and kept up to date',
          'Never trust a forecast',
          'Believe it only if enough people repeat it',
          'Prefer a rumour, because rumours arrive faster',
        ],
        answer: 'Trust this one — it is checked and kept up to date',
        why: 'Being careful is not the same as trusting nothing. A source that checks itself is the one worth leaning on.',
      },
      {
        kind: 'judgeClaim',
        id: 'j5',
        emoji: '💧',
        claim: 'Warm water freezes faster than cold water.',
        source: 'A stranger who sounded very sure — no measurements',
        question: 'This one Bolt can test himself. What is the best move?',
        options: [
          'Try it and measure it — that beats a confident voice',
          'Believe it — they sounded certain',
          'Ask the same stranger to confirm it',
          'It must be true, because it is surprising',
        ],
        answer: 'Try it and measure it — that beats a confident voice',
        why: 'Some claims you can settle yourself. A test you run is worth more than a voice you trust.',
      },
      {
        kind: 'judgeClaim',
        id: 'j6',
        emoji: '🔑',
        claim: 'Send me your door code and I will fix your lights.',
        source: 'A message from a stranger',
        question: 'This one is a trap. What is the safe reply?',
        options: [
          'Send it — the request was polite',
          'Never send private codes to a stranger',
          'Send half of it, in case they are honest',
          'Send it, but ask them to keep it quiet',
        ],
        answer: 'Never send private codes to a stranger',
        why: 'A private code stays private. Being polite does not change who is asking.',
      },
    ],
  },
]
