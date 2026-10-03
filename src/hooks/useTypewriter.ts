import { useCallback, useEffect, useState } from 'react'

interface Options {
  /** Characters revealed per tick. */
  speed?: number
  /** Milliseconds per tick. */
  interval?: number
  /** When true, reveal the whole string instantly (reduced motion). */
  instant?: boolean
}

/**
 * Reveals `text` one chunk at a time, like a speech bubble typing itself out.
 * A new line always starts from scratch; `finish` skips to the end.
 */
export function useTypewriter(text: string, options: Options = {}) {
  const { speed = 1, interval = 26, instant = false } = options
  const [count, setCount] = useState(0)
  const [typedText, setTypedText] = useState(text)

  // A changed line resets the reveal. Adjusting state while rendering is the
  // React-recommended replacement for a dedicated reset effect.
  if (typedText !== text) {
    setTypedText(text)
    setCount(0)
  }

  useEffect(() => {
    if (instant || count >= text.length) return
    const id = window.setTimeout(() => {
      setCount((c) => Math.min(text.length, c + speed))
    }, interval)
    return () => window.clearTimeout(id)
  }, [count, text, speed, interval, instant])

  const finish = useCallback(() => setCount(text.length), [text])

  return {
    shown: instant ? text : text.slice(0, count),
    done: instant || count >= text.length,
    finish,
  }
}
