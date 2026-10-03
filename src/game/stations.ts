import { STARS_PER_TASK, maxStarsFor, type Section } from './tasks'
import { STATION_1_SECTIONS } from './station1'
import { STATION_2_SECTIONS } from './station2'

/* Content registry. Adding a station is just data: sections + tasks.
   Stations without content yet return an empty list and stay locked. */

const GAMES: Record<number, Section[]> = {
  1: STATION_1_SECTIONS,
  2: STATION_2_SECTIONS,
}

export function sectionsOf(stationId: number): Section[] {
  return GAMES[stationId] ?? []
}

export function sectionCount(stationId: number): number {
  return sectionsOf(stationId).length
}

export function maxStars(stationId: number): number {
  return maxStarsFor(sectionsOf(stationId))
}

/** Stars available in one section — used to keep saved scores honest. */
export function sectionMaxStars(stationId: number, sectionIndex: number): number {
  const section = sectionsOf(stationId)[sectionIndex]
  return section ? section.tasks.length * STARS_PER_TASK : 0
}
