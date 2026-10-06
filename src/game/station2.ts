import type { Section } from './tasks'

/* Station 2 · Signal Square - checking a claim before you believe it.

   The lesson is not "trust nothing". It is "find out where it came from":
   no source, a seller pushing their own product, one person's story, a source
   that checks itself, something you can test yourself, and a private-code trap. */

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
        source: 'Posted anonymously. No date, no place, no name.',
        question: 'Nobody can say where this came from. What should Bolt do?',
        options: [
          'Believe it — photos never lie',
          'Check it first — nobody can tell where it came from',
          'Share it with everyone',
          'Reject all photos from now on',
        ],
        answer: 'Check it first — nobody can tell where it came from',
        why: 'A picture with no source can be real, edited or staged. Check first.',
      },
      {
        kind: 'judgeClaim',
        id: 'j2',
        emoji: '🍪',
        claim: 'Our cookies are the healthiest food in the world.',
        source: 'An advert paid for by the company that makes them',
        question: 'Who is saying this, and what do they want?',
        options: [
          'It must be true — it was printed',
          'The seller wants you to buy, so ask someone else too',
          'No advertisement can be trusted',
          'A popular product must be a healthy one',
        ],
        answer: 'The seller wants you to buy, so ask someone else too',
        why: 'They sell the cookies, so of course they praise them. Ask someone else too.',
      },
      {
        kind: 'judgeClaim',
        id: 'j3',
        emoji: '💬',
        claim: 'The city is charging for rooftop gardens next month.',
        source: 'A friend who heard it from someone else',
        question: 'One person’s story, no proof. Is that enough?',
        options: [
          'Yes — a friend would not make it up',
          'Not yet — one story is not evidence, so ask for proof',
          'Yes, if the claim spreads widely',
          'Only if other people find it entertaining',
        ],
        answer: 'Not yet — one story is not evidence, so ask for proof',
        why: 'One story can start a rumour. Look for proof others can check.',
      },
      {
        kind: 'judgeClaim',
        id: 'j4',
        emoji: '🌧️',
        claim: 'Rain at three o’clock this afternoon.',
        source: 'The Lumen weather service, updated every hour',
        question: 'This one checks its numbers hourly. What should Bolt do?',
        options: [
          'Trust this one — it is checked and kept up to date',
          'Never trust any forecast',
          'Believe it only if enough people repeat it',
          'Prefer an unverified source',
        ],
        answer: 'Trust this one — it is checked and kept up to date',
        why: 'Checking sources also means trusting the careful ones.',
      },
      {
        kind: 'judgeClaim',
        id: 'j5',
        emoji: '🔢',
        claim: 'Two plus two is five.',
        source: 'Shouted loudly by a stranger',
        question: 'Loud, but can Bolt check it himself?',
        options: [
          'True — confident voices are usually right',
          'Check it: two and two make four',
          'It depends on who is asking',
          'Ask the same stranger to confirm',
        ],
        answer: 'Check it: two and two make four',
        why: 'Some claims you can test yourself. Counting beats shouting.',
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
          'Never send private codes to strangers',
          'Send only half of it',
          'Send it, but ask them to be careful',
        ],
        answer: 'Never send private codes to strangers',
        why: 'A private code stays private. Being polite does not change that.',
      },
    ],
  },
]
