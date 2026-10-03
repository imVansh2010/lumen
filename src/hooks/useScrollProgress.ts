import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

interface Options {
  /** Turn the listener off, e.g. once the transition has already started. */
  active?: boolean
  /** Progress at which `onComplete` fires (default just before the end). */
  threshold?: number
  onComplete?: () => void
}

/**
 * How far a tall section has been scrolled through: 0 when its top is at the
 * top of the viewport, 1 once its bottom reaches the bottom of the viewport.
 * Powers the "fall into the game" zoom, and fires `onComplete` near the end.
 */
export function useScrollProgress<T extends HTMLElement>(
  ref: RefObject<T | null>,
  { active = true, threshold = 0.85, onComplete }: Options = {},
): number {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!active || !el) return

    let frame = 0

    const measure = () => {
      frame = 0
      const rect = el.getBoundingClientRect()
      const travel = rect.height - window.innerHeight
      // A section shorter than the viewport has no range to scroll through,
      // so it must never count as "complete" and fire by itself.
      if (travel < 1) {
        setProgress(0)
        return
      }
      const next = Math.min(1, Math.max(0, -rect.top / travel))
      setProgress(next)
      if (next >= threshold) onComplete?.()
    }

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(measure)
    }

    frame = window.requestAnimationFrame(measure)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ref, active, threshold, onComplete])

  return progress
}
