import type { Section } from './tasks'

/* Station 2 · Signal Square — checking claims before believing them.

   The lesson is not "never trust anything", it is "find out where it came
   from": no source, seller's interest, one person's story, a good checked
   source, something you can test yourself, and a private-details trap. */

export const STATION_2_SECTIONS: Section[] = [
  {
    id: '2-0',
    title: 'Check before you believe',
    blurb: 'Six claims arrive in Echo’s inbox. Work out whether each one can be trusted.',
    difficulty: 'Tricky',
    tasks: [
      {
        kind: 'judgeClaim',
        id: 'j1',
        emoji: '📸',
        claim: 'A photo shows a cat driving a bus!',
        source: 'Posted by @mysterypix — no date, no place, no name',
        question: 'A picture with no source at all. What should Bolt do?',
        options: [
          'Believe it, photos never lie',
          'Check it first — nobody can tell where it came from',
          'Share it with everyone',
          'Ignore every photo for ever',
        ],
        answer: 'Check it first — nobody can tell where it came from',
        why: 'A picture with no source could be real, edited or staged. Check before you share.',
      },
      {
        kind: 'judgeClaim',
        id: 'j2',
        emoji: '🍪',
        claim: 'Our cookies are the healthiest food in the whole world.',
        source: 'An advert paid for by the cookie company',
        question: 'Who is telling Bolt this, and why?',
        options: [
          'It must be true, it was written down',
          'The seller wants you to buy, so ask someone else too',
          'Adverts are always lies',
          'Cookies are vegetables',
        ],
        answer: 'The seller wants you to buy, so ask someone else too',
        why: 'When someone sells the thing they praise, look for a second opinion.',
      },
      {
        kind: 'judgeClaim',
        id: 'j3',
        emoji: '🐦',
        claim: 'Cats can fly! My cousin saw one do it.',
        source: 'A friend at the playground',
        question: 'One person’s story, with no proof. Is that enough?',
        options: [
          'Yes, friends never get things wrong',
          'Not yet — one story is not evidence, so ask for proof',
          'Yes, if they shout it loudly',
          'Only if the cat is friendly',
        ],
        answer: 'Not yet — one story is not evidence, so ask for proof',
        why: 'A single story can start a rumour. Real proof can be seen by everyone.',
      },
      {
        kind: 'judgeClaim',
        id: 'j4',
        emoji: '🌧️',
        claim: 'Rain at three o’clock this afternoon.',
        source: 'The Lumen weather service, updated every hour with readings',
        question: 'This source checks its numbers and updates them. What should Bolt do?',
        options: [
          'Trust this one — it is checked and kept up to date',
          'Never trust any forecast',
          'Believe it only if a stranger says it',
          'Ask a cat',
        ],
        answer: 'Trust this one — it is checked and kept up to date',
        why: 'Checking a source also means trusting the careful ones. That is how Bolt learns who to rely on.',
      },
      {
        kind: 'judgeClaim',
        id: 'j5',
        emoji: '🔢',
        claim: 'Two plus two is five.',
        source: 'Shouted very loudly by a stranger',
        question: 'This claim is loud, but can Bolt check it himself?',
        options: [
          'True, loud voices are right',
          'Check it: two and two make four',
          'It depends on the weather',
          'Ask the stranger again',
        ],
        answer: 'Check it: two and two make four',
        why: 'Some claims you can test yourself. Counting beats shouting every time.',
      },
      {
        kind: 'judgeClaim',
        id: 'j6',
        emoji: '🔑',
        claim: 'Send me your door code and I will fix your lights.',
        source: 'A message from a stranger you have never met',
        question: 'This one is a trap. What is the safe answer?',
        options: [
          'Send it — they said please',
          'Never send private codes to strangers',
          'Send only half of it',
          'Send it but ask them to hurry',
        ],
        answer: 'Never send private codes to strangers',
        why: 'A private code is private. No kind message makes it safe to share.',
      },
    ],
  },
]
