import type { Section } from './tasks'

/* Station 1 · The Sorting Yard — three parts, each harder than the last.

   The tags here are deliberately *near-misses* and *confident claims*, not
   absurd mistakes. A spiky monster labelled "cupcake" is trivially wrong. A
   wolf labelled "a friendly husky" looks almost right — so a trainer has to
   compare carefully and reason about *why* it is wrong. That is the muscle this
   station is meant to build.

   Part 1 — fix the label: near-miss tags that need real comparison.
   Part 2 — sort the crate: labels that are sometimes honest, sometimes a lie.
   Part 3 — clean the set: several near-miss answers at once. */

export const STATION_1_SECTIONS: Section[] = [
  {
    id: '1-0',
    title: 'Fix the near-miss label',
    blurb: 'These pictures carry believable-but-wrong tags. Compare carefully and pick the label that is actually true.',
    difficulty: 'Warm-up',
    tasks: [
      {
        kind: 'fixLabel',
        id: 'f1',
        emoji: '🐺',
        badLabel: 'a friendly husky',
        question: 'Echo tagged this “a friendly husky”. It looks close — which label is true?',
        options: ['A friendly husky', 'A wolf', 'A fox', 'A large cat'],
        answer: 'A wolf',
        why: 'It looks like a husky, but wolves are wild and hunt in packs — no collar, no home. Near-miss labels need a second look.',
      },
      {
        kind: 'fixLabel',
        id: 'f2',
        emoji: '🦇',
        badLabel: 'a little bird',
        question: 'A rumour renamed this one “a little bird” because it flies. Which label is true?',
        options: ['A little bird', 'A bat', 'A mouse', 'An owl'],
        answer: 'A bat',
        why: 'It flies like a bird, but bats are furry and feed their babies milk. Flying is not the same as being a bird.',
      },
      {
        kind: 'fixLabel',
        id: 'f3',
        emoji: '🍄',
        badLabel: 'a plant',
        question: 'This was tagged “a plant” since it grows in the ground. Which label is true?',
        options: ['A plant', 'A mushroom', 'A flower', 'A moss'],
        answer: 'A mushroom',
        why: 'It grows like a plant, but mushrooms are fungi — they do not have leaves or make their own food. Grows-in-the-ground is not enough.',
      },
      {
        kind: 'fixLabel',
        id: 'f4',
        emoji: '🍋',
        badLabel: 'an orange',
        question: 'Someone called this picture “an orange”. Which label is true?',
        options: ['An orange', 'A lemon', 'A pear', 'A beach ball'],
        answer: 'A lemon',
        why: 'Both are round citrus, so the tag is close. Look at the colour and the pointed ends — close is not the same.',
      },
      {
        kind: 'fixLabel',
        id: 'f5',
        emoji: '📣',
        badLabel: 'a proven fact',
        question: 'Someone shouted “DO IT NOW!!” and Echo tagged it “a proven fact”. Which label is honest?',
        options: [
          'A proven fact',
          'A kind question',
          'A loud order with no proof',
          'A helpful tip',
        ],
        answer: 'A loud order with no proof',
        why: 'Saying it loudly does not make it true. A proven fact has evidence behind it — this only has volume.',
      },
    ],
  },
  {
    id: '1-1',
    title: 'Check the label, then sort',
    blurb:
      'Some of these tags are true and some are confident lies. Look at the picture, then send it to the right crate.',
    difficulty: 'Tricky',
    tasks: [
      {
        kind: 'sortCrate',
        id: 's1',
        emoji: '🍎',
        label: 'food',
        question: 'Which crate does the apple really belong in?',
        crates: ['Food', 'Tools'],
        correctCrate: 0,
        why: 'That tag was right. An apple is food — good labels are worth keeping.',
      },
      {
        kind: 'sortCrate',
        id: 's2',
        emoji: '🐳',
        label: 'a fish',
        question: 'The tag says “a fish”. Which crate does the whale really belong in?',
        crates: ['Fish', 'Mammals'],
        correctCrate: 1,
        why: 'It swims like a fish, but whales breathe air and feed their babies milk. Near-miss tags hide in things that look alike.',
      },
      {
        kind: 'sortCrate',
        id: 's3',
        emoji: '🐶',
        label: 'a plant',
        question: 'The tag says “a plant”. Which crate does the dog really belong in?',
        crates: ['Living things', 'Not alive'],
        correctCrate: 0,
        why: 'A dog eats, grows and breathes — it is a living thing, whatever the tag says.',
      },
      {
        kind: 'sortCrate',
        id: 's4',
        emoji: '🍅',
        label: 'a vegetable',
        question: 'The tag says “a vegetable”. Which crate does the tomato really belong in?',
        crates: ['Vegetables', 'Fruits'],
        correctCrate: 1,
        why: 'We call it a vegetable in the kitchen, but a tomato grows from a flower and holds seeds — that makes it a fruit. Some tags are wrong in a sneaky way.',
      },
      {
        kind: 'sortCrate',
        id: 's5',
        emoji: '🌙',
        label: 'a place you can visit',
        question: 'The tag says “a place you can visit”. Which crate does the moon belong in?',
        crates: ['On Earth', 'Out in space'],
        correctCrate: 1,
        why: 'You cannot catch a bus to the moon! Confident tags can still be wrong — check the picture, not the claim.',
      },
    ],
  },
  {
    id: '1-2',
    title: 'Clean the sets',
    blurb:
      'These example sets are messy. Tap every example that does not belong — there may be more than one.',
    difficulty: 'Expert',
    tasks: [
      {
        kind: 'cleanSet',
        id: 'c1',
        label: 'Safe to share online',
        options: [
          { emoji: '🖼️', name: 'a holiday photo' },
          { emoji: '🎨', name: 'your own drawing' },
          { emoji: '🍪', name: 'a cookie recipe' },
          { emoji: '📞', name: "Mum's phone number" },
          { emoji: '🔑', name: 'your password' },
        ],
        oddOnes: [3, 4],
        why: 'Phone numbers and passwords are private. Some things should never be shared.',
      },
      {
        kind: 'cleanSet',
        id: 'c2',
        label: 'Things that are alive',
        options: [
          { emoji: '🌳', name: 'a tree' },
          { emoji: '🐝', name: 'a bee' },
          { emoji: '🌻', name: 'a sunflower' },
          { emoji: '🪨', name: 'a rock' },
          { emoji: '💧', name: 'a drop of water' },
        ],
        oddOnes: [3, 4],
        why: 'Living things grow, eat and breathe. Rocks and water do not — two odd ones here.',
      },
      {
        kind: 'cleanSet',
        id: 'c3',
        label: 'Things that are round',
        options: [
          { emoji: '⚽', name: 'a ball' },
          { emoji: '🌕', name: 'the moon' },
          { emoji: '🍊', name: 'an orange' },
          { emoji: '🥚', name: 'an egg' },
          { emoji: '🥕', name: 'a carrot' },
        ],
        oddOnes: [3, 4],
        why: 'An egg is oval, not round, and a carrot is pointy. Round means round all the way — near-misses are easy to tap by mistake.',
      },
      {
        kind: 'fixLabel',
        id: 'f6',
        emoji: '🦔',
        badLabel: 'a hairbrush',
        question: 'This one is tricky — the tag is almost right. Which label is true?',
        options: ['A hairbrush', 'A hedgehog', 'A pinecone', 'A cactus'],
        answer: 'A hedgehog',
        why: 'It only looks like a brush. Careful trainers check twice before they label a picture.',
      },
    ],
  },
]
