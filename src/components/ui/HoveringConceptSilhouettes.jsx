import { useReducedMotion } from 'framer-motion'

function GhostWedge({ gradId }) {
  return (
    <svg viewBox="0 0 200 72" className="h-full w-full" fill="none" aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#c084fc" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <path
        d="M 8 52 L 72 22 L 128 18 L 188 28 L 192 44 L 168 54 L 48 58 Z"
        fill={`url(#${gradId})`}
        fillOpacity="0.06"
        stroke={`url(#${gradId})`}
        strokeWidth="0.8"
      />
      <path
        d="M 78 22 Q 108 8 142 26"
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="0.5"
        opacity="0.4"
      />
    </svg>
  )
}

const ghosts = [
  {
    className:
      'left-[6%] top-[22%] w-[min(280px,42vw)] opacity-[0.28] animate-ghostCarDrift blur-[0.5px]',
    delay: '0s',
  },
  {
    className:
      'right-[4%] top-[38%] w-[min(240px,36vw)] scale-x-[-1] opacity-[0.22] animate-ghostCarDriftSlow blur-[1px]',
    delay: '-12s',
  },
  {
    className:
      'left-[28%] bottom-[18%] w-[min(200px,32vw)] opacity-[0.18] animate-ghostCarDrift blur-[1.5px]',
    delay: '-22s',
  },
]

/** Ghost concept wedges — slow drift behind content; respects reduced motion */
function HoveringConceptSilhouettes() {
  const reduced = useReducedMotion()

  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
      {ghosts.map((g, i) => (
        <div
          key={i}
          className={`absolute ${g.className} ${reduced ? 'animate-none opacity-20' : ''}`}
          style={reduced ? undefined : { animationDelay: g.delay }}
        >
          <GhostWedge gradId={`ghost-car-grad-${i}`} />
        </div>
      ))}
    </div>
  )
}

export default HoveringConceptSilhouettes
