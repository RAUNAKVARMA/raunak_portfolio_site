import { useMemo } from 'react'
import HoveringConceptSilhouettes from './HoveringConceptSilhouettes'

/** Deterministic field stars — distant points, not “hovering objects” */
function buildStars(count) {
  return Array.from({ length: count }, (_, i) => {
    const a = (i * 9301 + 49297) % 233280
    const b = (a / 233280) * 100
    const c = ((a * 7) % 233280) / 233280 * 100
    return {
      left: `${b.toFixed(2)}%`,
      top: `${c.toFixed(2)}%`,
      size: 0.5 + (i % 5) * 0.4,
      opacity: 0.2 + (i % 8) * 0.07,
      delay: (i % 10) * 0.25,
      duration: 2.8 + (i % 5) * 0.7,
      hue: i % 3 === 0 ? 'white' : i % 3 === 1 ? '#a5f3fc' : '#e9d5ff',
    }
  })
}

function SpaceBackdrop() {
  const stars = useMemo(() => buildStars(260), [])

  return (
    <div className="pointer-events-none fixed inset-0 z-[0] overflow-hidden">
      {/* Deep nebula — slow “movie plate” drift (no floating UI shards) */}
      <div className="absolute inset-0 animate-nebulaPulse bg-[radial-gradient(ellipse_95%_75%_at_12%_18%,rgba(88,28,135,0.38),transparent_58%)]" />
      <div className="absolute inset-0 animate-auroraDrift bg-[radial-gradient(ellipse_85%_65%_at_88%_12%,rgba(14,165,233,0.2),transparent_52%)]" />
      <div className="absolute inset-0 animate-auroraDrift bg-[radial-gradient(ellipse_75%_55%_at_58%_88%,rgba(236,72,153,0.14),transparent_48%)] [animation-delay:-28s]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_82%_at_50%_115%,rgba(15,23,42,0.9),transparent_58%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_32%_58%,rgba(45,212,191,0.07),transparent_52%)]" />

      {/* Distant star field */}
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
            boxShadow: `0 0 ${3 + s.size * 2}px ${s.hue}`,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      {/* Volumetric-style haze (fixed bokeh — reads as depth, not props) */}
      <div className="absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-purple-600/12 blur-[100px]" />
      <div className="absolute -right-20 bottom-1/4 h-[28rem] w-[28rem] rounded-full bg-cyan-500/11 blur-[110px]" />
      <div className="absolute left-1/3 top-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-600/9 blur-[85px]" />

      {/* Abstract concept wedges — slow hover in deep field (under page content z-10) */}
      <HoveringConceptSilhouettes />
    </div>
  )
}

export default SpaceBackdrop
