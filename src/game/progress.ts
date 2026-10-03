/* Player progress.

   Every district needs its lights back. A district has one light per station
   section, so finishing a section lights one more bulb, and the district is
   only "online" (and the next station unlocked) once every bulb is lit. */

import { STATION_IDS } from '../story/districts'
import { maxStars, sectionCount, sectionMaxStars } from './stations'

export interface Progress {
  /** station id → number of sections finished. */
  done: Record<string, number>
  /** "stationId-sectionIndex" → best stars earned in that section. */
  stars: Record<string, number>
}

const EMPTY_PROGRESS: Progress = { done: {}, stars: {} }

const KEY = 'lumen.progress'

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY_PROGRESS
    const parsed = JSON.parse(raw) as Partial<Progress>
    return { done: parsed.done ?? {}, stars: parsed.stars ?? {} }
  } catch {
    return EMPTY_PROGRESS
  }
}

export function saveProgress(progress: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress))
  } catch {
    /* storage unavailable — progress just won't persist */
  }
}

/** How many lights are on in one district (0 … sectionCount). */
export function districtLights(progress: Progress, stationId: number): number {
  const done = progress.done[String(stationId)] ?? 0
  return Math.max(0, Math.min(done, sectionCount(stationId)))
}

/** A district is online when every one of its lights is back on. */
export function districtOnline(progress: Progress, stationId: number): boolean {
  return (
    sectionCount(stationId) > 0 && districtLights(progress, stationId) >= sectionCount(stationId)
  )
}

/** Station 1 is always open; the others unlock when the previous district is online. */
export function stationUnlocked(progress: Progress, stationId: number): boolean {
  if (stationId <= STATION_IDS[0]) return true
  return districtOnline(progress, stationId - 1)
}

export function sectionStars(progress: Progress, stationId: number, sectionIndex: number): number {
  const stars = progress.stars[`${stationId}-${sectionIndex}`] ?? 0
  // Clamped on read so a stale save can never beat the possible score.
  const cap = sectionMaxStars(stationId, sectionIndex)
  return cap > 0 ? Math.min(stars, cap) : stars
}

export function stationStars(progress: Progress, stationId: number): number {
  let total = 0
  for (let i = 0; i < sectionCount(stationId); i++) total += sectionStars(progress, stationId, i)
  return total
}

/** Records a finished section and keeps the best star score for it. */
export function completeSection(
  progress: Progress,
  stationId: number,
  sectionIndex: number,
  stars: number,
): Progress {
  const key = String(stationId)
  const done = Math.max(progress.done[key] ?? 0, sectionIndex + 1)
  const starKey = `${stationId}-${sectionIndex}`
  const best = Math.max(progress.stars[starKey] ?? 0, stars)
  return {
    done: { ...progress.done, [key]: done },
    stars: { ...progress.stars, [starKey]: best },
  }
}

export { maxStars }

/** Total lights on across the whole city. */
export function totalLights(progress: Progress): number {
  return STATION_IDS.reduce((sum, id) => sum + districtLights(progress, id), 0)
}

export function totalLightsPossible(): number {
  return STATION_IDS.reduce((sum, id) => sum + sectionCount(id), 0)
}

/** Per-district light counts, in station order — handy for the power grid. */
export function lightArray(progress: Progress): number[] {
  return STATION_IDS.map((id) => districtLights(progress, id))
}
