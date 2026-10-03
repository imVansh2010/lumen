/* The blackout is meant to feel like a big deal, so the four districts lose
   power one at a time on a slow, deliberate schedule. The district cards, the
   skyline sweep and the sound effects all read these same numbers, otherwise
   the city can go dark before the last district does. */

/** District 0 dies this many ms after the blackout beat starts. */
export const FIRST_CUT_MS = 1100
/** Gap between one district dying and the next. */
export const CUT_GAP_MS = 1250
/** How many districts there are — keep in step with the station list. */
export const DISTRICT_COUNT = 4

/** When district `i` (0-based, left to right) loses power, in milliseconds. */
export function cutMs(i: number): number {
  return FIRST_CUT_MS + Math.max(0, Math.min(DISTRICT_COUNT - 1, i)) * CUT_GAP_MS
}

/** When district `i` loses power, in seconds — handy for CSS animation delays. */
export function cutSeconds(i: number): number {
  return cutMs(i) / 1000
}

/** Which district a point belongs to, given its position across the city (0..1). */
export function districtAt(xRatio: number): number {
  return Math.max(0, Math.min(DISTRICT_COUNT - 1, Math.floor(xRatio * DISTRICT_COUNT)))
}
