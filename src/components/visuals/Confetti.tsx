import type { CSSProperties } from 'react'

/* Festival energy sparks — deterministic pieces so it looks the same every
   time. The palette is held to the interface colours (white, HUD blue, alert
   red) so the celebration never breaks the world's look. */

const COLORS = ['#FFFFFF', '#9CC8FF', '#FF7A7A']

const PIECES = Array.from({ length: 30 }, (_, i) => ({
  left: (i * 3.4 + 4) % 96,
  top: -6 - (i % 6) * 4,
  delay: (i % 10) * 0.32,
  duration: 3.2 + (i % 5) * 0.45,
  color: COLORS[i % COLORS.length],
  spin: i % 2 === 0 ? '540deg' : '-480deg',
  size: 8 + (i % 3) * 3,
  round: i % 4 === 0,
}))

export default function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {PIECES.map((p, i) => (
        <span
          key={i}
          className={`absolute block ${p.round ? 'rounded-full' : 'rounded-[2px]'}`}
          style={
            {
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.round ? p.size : p.size * 1.6,
              background: p.color,
              opacity: 0.85,
              '--spin': p.spin,
              animation: `confetti-fall ${p.duration}s linear ${p.delay}s infinite`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
