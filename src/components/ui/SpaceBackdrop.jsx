import { useMemo } from 'react'

/** Deterministic “stars” so layout is stable across renders */
function buildStars(count) {
  return Array.from({ length: count }, (_, i) => {
    const a = (i * 9301 + 49297) % 233280
    const b = (a / 233280) * 100
    const c = ((a * 7) % 233280) / 233280 * 100
    return {
      left: `${b.toFixed(2)}%`,
      top: `${c.toFixed(2)}%`,
      size: 0.6 + (i % 5) * 0.45,
      opacity: 0.25 + (i % 8) * 0.08,
      delay: (i % 10) * 0.25,
      duration: 2.5 + (i % 5) * 0.6,
      hue: i % 3 === 0 ? 'white' : i % 3 === 1 ? '#a5f3fc' : '#e9d5ff',
    }
  })
}

function SpaceBackdrop() {
  const stars = useMemo(() => buildStars(160), [])

  return (
    <div className="pointer-events-none fixed inset-0 z-[0] overflow-hidden">
      {/* Deep nebula washes */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_15%_20%,rgba(88,28,135,0.35),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_85%_15%,rgba(14,165,233,0.18),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_60%_85%,rgba(236,72,153,0.12),transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_120%,rgba(15,23,42,0.9),transparent_55%)]" />

      {/* Star field */}
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full animate-twinkle"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            backgroundColor: s.hue,
            boxShadow: `0 0 ${4 + s.size * 2}px ${s.hue}`,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      {/* Large bokeh orbs (depth) */}
      <div className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-purple-500/10 blur-[80px]" />
      <div className="absolute -right-16 bottom-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-[90px]" />
    </div>
  )
}

export default SpaceBackdrop
