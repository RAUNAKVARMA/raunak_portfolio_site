import { useReducedMotion } from 'framer-motion'

const layout = [
  { type: 'ring', size: 'min(420px,55vw)', top: '8%', left: '-8%', dur: 52, delay: 0, opacity: 0.35, reverse: false },
  { type: 'ring', size: 'min(280px,38vw)', top: '58%', right: '-5%', dur: 38, delay: -8, opacity: 0.28, reverse: true },
  { type: 'ring', size: 'min(180px,28vw)', top: '42%', left: '12%', dur: 44, delay: -12, opacity: 0.22, reverse: false },
  { type: 'shard', top: '18%', right: '18%', dur: 11, delay: 0, rot: 12 },
  { type: 'shard', bottom: '22%', left: '8%', dur: 13, delay: -3, rot: -18 },
  { type: 'shard', top: '48%', right: '6%', dur: 9, delay: -5, rot: 24 },
  { type: 'satellite', top: '28%', left: '22%', dur: 16, delay: -2 },
  { type: 'satellite', bottom: '35%', right: '28%', dur: 14, delay: -6 },
  { type: 'orb', top: '65%', left: '55%', dur: 7, delay: 0 },
  { type: 'orb', top: '12%', right: '35%', dur: 8, delay: -4 },
  { type: 'debris', top: '72%', left: '18%', dur: 19, delay: -10 },
  { type: 'debris', top: '38%', right: '42%', dur: 22, delay: -14 },
  { type: 'grid', dur: 60, delay: 0 },
]

function Ring({ opacity }) {
  return (
    <div
      className="h-full w-full rounded-full border border-cyan-400/35 shadow-[0_0_60px_rgba(34,211,238,0.18)]"
      style={{ opacity }}
    />
  )
}

function Shard({ gradId, rot }) {
  return (
    <svg
      width="48"
      height="64"
      viewBox="0 0 48 64"
      fill="none"
      className="text-fuchsia-400/55"
      style={{ transform: `rotate(${rot}deg)` }}
    >
      <path
        d="M24 2 L46 44 L24 62 L2 44 Z"
        stroke="currentColor"
        strokeWidth="1.2"
        fill={`url(#${gradId})`}
      />
      <path d="M24 16 L38 44 L24 54 L10 44 Z" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
      <defs>
        <linearGradient id={gradId} x1="2" y1="2" x2="46" y2="62">
          <stop stopColor="#22d3ee" stopOpacity="0.14" />
          <stop offset="1" stopColor="#c084fc" stopOpacity="0.2" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function Satellite() {
  return (
    <svg width="72" height="40" viewBox="0 0 72 40" fill="none" className="text-cyan-300/65">
      <rect x="30" y="14" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1" fill="rgba(34,211,238,0.08)" />
      <path d="M6 20 L26 20 M46 20 L66 20" stroke="currentColor" strokeWidth="0.8" opacity="0.7" />
      <rect x="8" y="16" width="16" height="8" rx="1" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
      <rect x="48" y="16" width="16" height="8" rx="1" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
    </svg>
  )
}

function Debris() {
  return (
    <div
      className="h-4 w-7 rounded-sm border border-white/25 bg-gradient-to-br from-slate-500/35 to-slate-900/70 shadow-[0_0_22px_rgba(255,255,255,0.1)]"
      style={{ transform: 'rotate(25deg)' }}
    />
  )
}

/**
 * Global floating space debris — above WebGL, below vignettes & content.
 * CSS-only; respects reduced motion.
 */
function FloatingSpaceObjects() {
  const reduced = useReducedMotion()

  if (reduced) {
    return (
      <div
        className="pointer-events-none fixed inset-0 z-[5] opacity-25 mix-blend-screen"
        aria-hidden
      />
    )
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[5] overflow-hidden mix-blend-screen opacity-[0.42] md:opacity-[0.5]"
      aria-hidden
    >
      <style>{`
        @keyframes spaceFloat {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(14px, -20px) rotate(1.5deg); }
          50% { transform: translate(-10px, 12px) rotate(-1deg); }
          75% { transform: translate(8px, 16px) rotate(1deg); }
        }
        @keyframes spaceSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spaceDrift {
          0%, 100% { transform: translate(-50%, -50%) translate(0, 0); }
          50% { transform: translate(-50%, -50%) translate(24px, -14px); }
        }
      `}</style>

      {layout.map((o, i) => {
        const floatStyle = {
          position: 'absolute',
          animation: `spaceFloat ${o.dur}s ease-in-out infinite`,
          animationDelay: `${o.delay}s`,
        }

        if (o.type === 'ring') {
          return (
            <div
              key={`ring-${i}`}
              style={{
                ...floatStyle,
                top: o.top,
                left: o.left,
                right: o.right,
                width: o.size,
                height: o.size,
                animation: `spaceSpin ${o.dur}s linear infinite`,
                animationDirection: o.reverse ? 'reverse' : 'normal',
                animationDelay: `${o.delay}s`,
              }}
            >
              <Ring opacity={o.opacity} />
            </div>
          )
        }

        if (o.type === 'shard') {
          return (
            <div
              key={`shard-${i}`}
              style={{
                ...floatStyle,
                top: o.top,
                bottom: o.bottom,
                left: o.left,
                right: o.right,
              }}
            >
              <Shard gradId={`fs-shard-${i}`} rot={o.rot} />
            </div>
          )
        }

        if (o.type === 'satellite') {
          return (
            <div
              key={`sat-${i}`}
              style={{
                ...floatStyle,
                top: o.top,
                bottom: o.bottom,
                left: o.left,
                right: o.right,
              }}
            >
              <Satellite />
            </div>
          )
        }

        if (o.type === 'orb') {
          return (
            <div
              key={`orb-${i}`}
              className="h-3 w-3 rounded-full bg-cyan-200 shadow-[0_0_28px_10px_rgba(34,211,238,0.7)]"
              style={{
                ...floatStyle,
                top: o.top,
                left: o.left,
                right: o.right,
              }}
            />
          )
        }

        if (o.type === 'debris') {
          return (
            <div
              key={`deb-${i}`}
              style={{
                ...floatStyle,
                top: o.top,
                left: o.left,
                right: o.right,
              }}
            >
              <Debris />
            </div>
          )
        }

        if (o.type === 'grid') {
          return (
            <div
              key="grid"
              className="absolute left-1/2 top-1/2 h-[min(90vh,820px)] w-[min(90vw,1200px)] opacity-[0.08]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(34,211,238,0.45) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(192,38,211,0.4) 1px, transparent 1px)
                `,
                backgroundSize: '52px 52px',
                maskImage: 'radial-gradient(ellipse 72% 58% at 50% 45%, black 0%, transparent 78%)',
                animation: `spaceDrift ${o.dur}s ease-in-out infinite`,
              }}
            />
          )
        }

        return null
      })}
    </div>
  )
}

export default FloatingSpaceObjects
