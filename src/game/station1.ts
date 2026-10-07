import type { Section } from './tasks'

/* Station 1 · The Sorting Yard - three parts, each a bit harder than the last.

   Every wrong label here is a near-miss: it looks close, so you have to think
   about why it is wrong instead of just spotting something silly. The traps are
   deliberately different from one another — a look-alike group, the same
   behaviour, the same place, the same shape, the same tone — so the part never
   turns into the same question five times over.

   Part 1 - fix the label.  Part 2 - check the label, then sort.
   Part 3 - clean up the examples. */

export const STATION_1_SECTIONS: Section[] = [
  {
    id: '1-0',
    title: 'Fix the wrong labels',
    blurb: 'Every tag here looks close, but each one is wrong.',
    difficulty: 'Warm-up',
    tasks: [
      {
        kind: 'fixLabel',
        id: 'f1',
        emoji: '🐝',
        badLabel: 'a wasp',
        question: 'This was tagged “a wasp”. Look closely. What is it really?',
        options: ['A wasp', 'A bee', 'A fly', 'A butterfly'],
        answer: 'A bee',
        why: 'It is fuzzy and round, with no narrow waist. A wasp is smooth and pinched.',
      },
      {
        kind: 'fixLabel',
        id: 'f2',
        emoji: '🦇',
        badLabel: 'a small bird',
        question: 'Someone tagged this “a small bird” because it flies. What is it?',
        options: ['A small bird', 'A bat', 'An owl', 'A mouse'],
        answer: 'A bat',
        why: 'It flies, but it has fur and feeds its young milk. It is a bat, not a bird.',
      },
      {
        kind: 'fixLabel',
        id: 'f3',
        emoji: '🍄',
        badLabel: 'a plant',
        question: 'It grows out of the ground, so it was tagged “a plant”. What is it?',
        options: ['A plant', 'A mushroom', 'A flower', 'A moss'],
        answer: 'A mushroom',
        why: 'No leaves and no green stem, and it feeds on what it grows in. It is a fungus.',
      },
      {
        kind: 'fixLabel',
        id: 'f4',
        emoji: '🕷️',
        badLabel: 'an insect',
        question: 'Six legs is not the only way to count. This was tagged “an insect”. What is it?',
        options: ['An insect', 'A spider', 'A beetle', 'An ant'],
        answer: 'A spider',
        why: 'Count the legs: a spider has eight, and insects have six. Close cousins, different set.',
      },
      {
        kind: 'fixLabel',
        id: 'f5',
        emoji: '📣',
        badLabel: 'a proven fact',
        question: 'A shout got logged as “a proven fact”. What is it really?',
        options: [
          'A proven fact',
          'A kind question',
          'A loud order with no proof',
          'A helpful tip',
        ],
        answer: 'A loud order with no proof',
        why: 'Saying it loudly does not make it true. There is no proof in here to check.',
      },
    ],
  },
  {
    id: '1-1',
    title: 'Check the label, then sort',
    blurb: 'Some tags are honest, some are lies. Sort each one.',
    difficulty: 'Tricky',
    tasks: [
      {
        kind: 'sortCrate',
        id: 's1',
        emoji: '🍎',
        label: 'food',
        question: 'The tag says “food”. Where does the apple really go?',
        crates: ['Food', 'Tools'],
        correctCrate: 0,
        why: 'That tag was right. An apple is food. Not every label is a trap.',
      },
      {
        kind: 'sortCrate',
        id: 's2',
        emoji: '🐳',
        label: 'a fish',
        question: 'The tag says “a fish”. Where does the whale really go?',
        crates: ['Fish', 'Mammals'],
        correctCrate: 1,
        why: 'It swims, but it comes up to breathe air and feeds its young milk. A mammal.',
      },
      {
        kind: 'sortCrate',
        id: 's3',
        emoji: '🍅',
        label: 'a vegetable',
        question: 'The tag says “a vegetable”. Where does the tomato really go?',
        crates: ['Vegetables', 'Fruits'],
        correctCrate: 1,
        why: 'It grew from a flower and holds its seeds inside, so a botanist calls it a fruit. The tag came from cooking, not from nature.',
      },
      {
        kind: 'sortCrate',
        id: 's4',
        emoji: '🦈',
        label: 'a mammal',
        question: 'This time the tag says “a mammal”. Where does the shark really go?',
        crates: ['Fish', 'Mammals'],
        correctCrate: 0,
        why: 'The label was wrong the other way round. A shark breathes with gills and has no fur, so it is a fish.',
      },
      {
        kind: 'sortCrate',
        id: 's5',
        emoji: '🌙',
        label: 'a place you can visit',
        question: 'The tag says “a place you can visit”. Where does the moon really go?',
        crates: ['On Earth', 'Out in space'],
        correctCrate: 1,
        why: 'You cannot get there by bus. A confident tag can still be wrong.',
      },
    ],
  },
  {
    id: '1-2',
    title: 'Clean up the examples',
    blurb: 'Some examples do not belong. Tick every one that is out of place.',
    difficulty: 'Expert',
    tasks: [
      {
        kind: 'cleanSet',
        id: 'c1',
        label: 'Safe to post online',
        options: [
          { emoji: '🖼️', name: 'a drawing you made' },
          { emoji: '🐶', name: 'a photo of your dog' },
          { emoji: '🔗', name: 'a link to a public video' },
          { emoji: '🏫', name: 'a photo of your school timetable' },
          { emoji: '🔑', name: 'your account password' },
        ],
        oddOnes: [3, 4],
        why: 'A timetable tells strangers where you will be, and a password hands them your account. Both stay private.',
      },
      {
        kind: 'cleanSet',
        id: 'c2',
        label: 'Living things',
        options: [
          { emoji: '🌳', name: 'an oak tree' },
          { emoji: '🐝', name: 'a honeybee' },
          { emoji: '🍄', name: 'a mushroom' },
          { emoji: '🪨', name: 'a granite rock' },
          { emoji: '💧', name: 'a water droplet' },
        ],
        oddOnes: [3, 4],
        why: 'A mushroom is easy to miss, but it grows and feeds on what is around it. Rock and water do neither.',
      },
      {
        kind: 'cleanSet',
        id: 'c3',
        label: 'Made of metal',
        options: [
          { emoji: '🔧', name: 'a spanner' },
          { emoji: '🍴', name: 'a fork' },
          { emoji: '🔑', name: 'a key' },
          { emoji: '🪙', name: 'a coin' },
          { emoji: '🥄', name: 'a wooden spoon' },
        ],
        oddOnes: [4],
        why: 'Only one here is not metal — the wooden spoon, and it hides well among the cutlery. One odd example is enough to spoil a set.',
      },
      {
        kind: 'fixLabel',
        id: 'f6',
        emoji: '🦔',
        badLabel: 'a hairbrush',
        question: 'Tricky one. The tag says “a hairbrush”. What is it?',
        options: ['A hairbrush', 'A hedgehog', 'A pinecone', 'A cactus'],
        answer: 'A hedgehog',
        why: 'It only looks like one at a glance. Look twice before you label a picture.',
      },
    ],
  },
]
