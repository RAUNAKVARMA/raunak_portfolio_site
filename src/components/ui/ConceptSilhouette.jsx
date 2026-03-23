/**
 * Abstract futuristic wedge — concept-car silhouette as hologram-on-glass.
 * Static (no float / tilt); cosmic background shows through.
 */
function ConceptSilhouette({ reducedMotion }) {
  return (
    <div className="relative mx-auto w-full max-w-[min(100%,440px)] px-2" aria-hidden>
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-950/40 shadow-[0_0_60px_rgba(34,211,238,0.08),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm">
        {/* Racing stripe — dual line, space palette */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-1.5 bg-gradient-to-b from-cyan-400/80 via-fuchsia-500/60 to-transparent opacity-90" />
        <div className="pointer-events-none absolute left-2 top-0 z-10 h-full w-px bg-white/20" />

        <div className="relative px-4 pb-5 pt-6 sm:px-6 sm:pb-6 sm:pt-8">
          <p className="mb-4 font-mono text-[9px] font-semibold uppercase tracking-[0.4em] text-slate-500">
            Concept · Telemetry
          </p>

          <svg viewBox="0 0 520 200" className="h-auto w-full" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="silEdge" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.95" />
                <stop offset="45%" stopColor="#c084fc" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#e879f9" stopOpacity="0.75" />
              </linearGradient>
              <linearGradient id="silFill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.08" />
              </linearGradient>
              <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Speed streaks — background only */}
            <g opacity="0.35">
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={i}
                  x1={60 + i * 28}
                  y1={145}
                  x2={200 + i * 42}
                  y2={88 + (i % 2) * 6}
                  stroke="url(#silEdge)"
                  strokeWidth="0.6"
                  strokeLinecap="round"
                  opacity={0.25 + i * 0.08}
                />
              ))}
            </g>

            {/* Abstract wedge body — low, sharp, no brand likeness */}
            <path
              d="M 48 148 L 188 86 L 312 78 L 398 88 L 468 108 L 472 132 L 428 152 L 268 162 L 112 158 Z"
              fill="url(#silFill)"
              stroke="url(#silEdge)"
              strokeWidth="1.4"
              filter={reducedMotion ? undefined : 'url(#softGlow)'}
            />
            {/* Canopy — single curved cut */}
            <path
              d="M 210 86 Q 268 44 352 90"
              fill="none"
              stroke="url(#silEdge)"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.55"
            />
            {/* Splitter / floor edge */}
            <path
              d="M 48 148 L 472 132"
              stroke="url(#silEdge)"
              strokeWidth="0.75"
              opacity="0.35"
            />
            {/* Rear vertical light bar */}
            <line
              x1="448"
              y1="100"
              x2="448"
              y2="138"
              stroke="#e879f9"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.5"
            />
          </svg>

          {/* Telemetry ticks */}
          <div className="mt-4 flex items-end justify-between border-t border-white/10 pt-3 font-mono text-[10px] text-slate-500">
            <span>Δ LATENCY</span>
            <span className="text-cyan-400/90">0.8ms</span>
            <span className="hidden sm:inline">VECTOR</span>
            <span className="hidden text-fuchsia-300/80 sm:inline">STABLE</span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.28em] text-slate-600">
        Orbit-grade systems
      </p>
    </div>
  )
}

export default ConceptSilhouette
