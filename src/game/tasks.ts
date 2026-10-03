/* Task model shared by every station.

   A station is made of sections ("parts"). Each finished section lights one
   more bulb in that district, so difficulty ramps up part by part instead of
   dropping the player into one long quiz. */

export interface FixLabelTask {
  kind: 'fixLabel'
  id: string
  emoji: string
  /** The wrong label Echo ended up with. */
  badLabel: string
  question: string
  options: string[]
  answer: string
  why: string
}

export interface SortCrateTask {
  kind: 'sortCrate'
  id: string
  emoji: string
  /** What the sloppy label claims — sometimes true, sometimes a lie. */
  label: string
  question: string
  crates: [string, string]
  /** Which crate the picture really belongs in. */
  correctCrate: 0 | 1
  why: string
}

export interface CleanSetTask {
  kind: 'cleanSet'
  id: string
  label: string
  options: { emoji: string; name: string }[]
  /** Every example that does NOT belong in this set. */
  oddOnes: number[]
  why: string
}

/** A claim to fact-check (used by Signal Square). */
export interface JudgeClaimTask {
  kind: 'judgeClaim'
  id: string
  emoji: string
  claim: string
  /** Where the claim came from — a good judge checks this first. */
  source: string
  question: string
  options: string[]
  answer: string
  why: string
}

export type Task = FixLabelTask | SortCrateTask | CleanSetTask | JudgeClaimTask

export type Difficulty = 'Warm-up' | 'Tricky' | 'Expert'

export interface Section {
  id: string
  title: string
  blurb: string
  difficulty: Difficulty
  tasks: Task[]
}

/** Every task is worth three stars. */
export const STARS_PER_TASK = 3

export function starsForTask(mistakes: number): number {
  if (mistakes <= 0) return STARS_PER_TASK
  if (mistakes === 1) return 2
  return 1
}

export function maxStarsFor(sections: Section[]): number {
  return sections.reduce((sum, s) => sum + s.tasks.length * STARS_PER_TASK, 0)
}

/** Big prompt shown above the choices. */
export function promptFor(task: Task): string {
  if (task.kind === 'cleanSet') {
    return `Tap every picture that does NOT belong in “${task.label}”`
  }
  return task.question
}

export function roundFor(task: Task): string {
  switch (task.kind) {
    case 'fixLabel':
      return 'Fix the wrong label'
    case 'sortCrate':
      return 'Check the label, then sort'
    case 'cleanSet':
      return 'Clean the example set'
    case 'judgeClaim':
      return 'Check the claim'
  }
}
