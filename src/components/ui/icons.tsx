import type { SVGProps } from 'react'
import type { StationIcon } from '../../story/districts'

type P = SVGProps<SVGSVGElement>

/* A crisp, technical line-icon set. Strokes are kept thin and precise so the
   icons read as interface glyphs rather than illustrated pictures. Every
   export name, prop and the 24×24 viewBox are part of the public surface and
   must not change. */

export const IconPlay = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M8 5.5v13l11-6.5-11-6.5Z" />
  </svg>
)

export const IconArrow = ({ dir = 'right', ...p }: P & { dir?: 'left' | 'right' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden
    {...p}
    style={dir === 'left' ? { transform: 'scaleX(-1)' } : undefined}
  >
    <path
      d="M5 12h13m-5.5-5.5L18 12l-5.5 5.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const IconChevron = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden {...p}>
    <path
      d="M8 5l8 7-8 7"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const IconCheck = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden {...p}>
    <path
      d="m5 12.5 4.5 4.5L19 7.5"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const IconLock = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden {...p}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="12" cy="15.3" r="1.4" fill="currentColor" />
  </svg>
)

export const IconSound = ({ muted = false, ...p }: P & { muted?: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden {...p}>
    <path
      d="M4 9.5v5h3.2L12 19V5L7.2 9.5H4Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {muted ? (
      <path d="m15.5 9.5 5 5m0-5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    ) : (
      <path
        d="M15.5 9.2a4 4 0 0 1 0 5.6M18 7a7 7 0 0 1 0 10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    )}
  </svg>
)

export const IconReplay = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden {...p}>
    <path
      d="M19 12a7 7 0 1 1-2.1-5M19 4v4h-4"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const IconSkip = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden {...p}>
    <path d="M6 5.5v13l9-6.5-9-6.5Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
    <path d="M18 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export const IconCross = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden {...p}>
    <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
)

export const IconStar = ({ filled = false, ...p }: P & { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" aria-hidden {...p}>
    <path
      d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5l-5.9 3.1 1.2-6.5L2.5 9.5l6.6-.9 2.9-6Z"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
)

export const IconSparkle = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M12 2.5l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z" />
  </svg>
)

export function IconStation({ kind, ...p }: P & { kind: StationIcon }) {
  const common = {
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...p}>
      {kind === 'sort' && (
        <>
          <path d="M4 7h16M4 12h16M4 17h10" {...common} />
          <circle cx="17.5" cy="17" r="2.6" {...common} />
        </>
      )}
      {kind === 'truth' && (
        <>
          <circle cx="12" cy="12" r="7.5" {...common} />
          <path d="m8.6 12.2 2.3 2.3 4.5-5" {...common} />
        </>
      )}
      {kind === 'order' && (
        <>
          <path d="M4 6h9M4 12h12M4 18h7" {...common} />
          <path d="m16 15 3 3 3-6" {...common} />
        </>
      )}
      {kind === 'vault' && (
        <>
          <rect x="4" y="4.5" width="16" height="15" rx="2.5" {...common} />
          <circle cx="12" cy="12" r="3.4" {...common} />
          <path d="M12 8.6V12l2.4 1.6" {...common} />
        </>
      )}
    </svg>
  )
}
