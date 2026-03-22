import { useEffect, useState } from 'react'

/**
 * CSS 3D planet + ring — no WebGL bundle, reads “premium” at a glance.
 */
function SpacePlanet({ reducedMotion }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (reducedMotion) return undefined

    const onMove = (e) => {
      const cx = window.innerWidth * 0.5
      const cy = window.innerHeight * 0.45
      const nx = (e.clientX - cx) / cx
      const ny = (e.clientY - cy) / cy
      setTilt({
        x: Math.max(-14, Math.min(14, -ny * 14)),
        y: Math.max(-18, Math.min(18, nx * 18)),
      })
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [reducedMotion])

  return (
    <div className="relative mx-auto flex w-full max-w-[420px] items-center justify-center [perspective:1400px]">
      <div
        className="relative aspect-square w-full max-w-[min(100%,380px)] transform-gpu transition-transform duration-150 ease-out"
        style={{
          transform: reducedMotion
            ? 'rotateX(-6deg) rotateY(12deg)'
            : `rotateX(${-8 + tilt.x}deg) rotateY(${12 + tilt.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Saturn-style ring (3D tilted plane) */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 z-[1] h-[48%] w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-fuchsia-400/25 bg-gradient-to-r from-transparent via-fuchsia-500/15 to-transparent shadow-[0_0_50px_rgba(192,38,211,0.25)]"
          style={{ transform: 'rotateX(78deg) translateZ(-8px)' }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 z-[1] h-[46%] w-[118%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/20"
          style={{ transform: 'rotateX(78deg) translateZ(4px)' }}
        />

        {/* Planet sphere */}
        <div
          className="relative z-[2] mx-auto h-full w-full rounded-full shadow-[0_60px_120px_rgba(88,28,135,0.45),inset_-24px_-30px_70px_rgba(0,0,0,0.75)]"
          style={{
            background:
              'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.35) 0%, transparent 42%), radial-gradient(circle at 70% 65%, rgba(14,165,233,0.35) 0%, transparent 45%), linear-gradient(145deg, #1e1b4b 0%, #4c1d95 38%, #0f172a 100%)',
          }}
        >
          <div className="pointer-events-none absolute inset-[10%] rounded-full bg-gradient-to-br from-cyan-400/15 via-transparent to-fuchsia-600/20" />
          <div className="pointer-events-none absolute -inset-2 rounded-full bg-gradient-to-t from-transparent via-purple-500/25 to-transparent opacity-70 blur-xl" />
        </div>

        {/* Orbital arc (SVG) for extra “space tech” */}
        <svg
          className="pointer-events-none absolute inset-0 z-[3] h-full w-full"
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden
        >
          <ellipse
            cx="100"
            cy="100"
            rx="92"
            ry="36"
            stroke="url(#orbitGrad)"
            strokeWidth="0.6"
            strokeDasharray="3 8"
            opacity="0.55"
            transform="rotate(-18 100 100)"
          />
          <defs>
            <linearGradient id="orbitGrad" x1="0" y1="0" x2="200" y2="200">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}

export default SpacePlanet
