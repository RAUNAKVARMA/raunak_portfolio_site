import { useMemo } from 'react'

/** Lightweight “holographic debris” — CSS 3D shards floating in screen space */
function SciFiShards() {
  const shards = useMemo(
    () =>
      Array.from({ length: 72 }, (_, i) => {
        const a = (i * 9301 + 49297) % 233280
        return {
          top: `${((a * 7) % 100).toFixed(2)}%`,
          left: `${(a % 100).toFixed(2)}%`,
          z: -20 + (i % 40),
          rotX: 35 + (i % 5) * 12,
          rotZ: (i * 19) % 360,
          w: 14 + (i % 5) * 10,
          h: 4 + (i % 4) * 6,
          delay: (i % 10) * 0.15,
          dur: 5 + (i % 6) * 0.8,
          hue: i % 4 === 0 ? 'cyan' : i % 4 === 1 ? 'fuchsia' : i % 4 === 2 ? 'amber' : 'sky',
        }
      }),
    [],
  )

  const border = {
    cyan: 'border-cyan-400/25 shadow-[0_0_24px_rgba(34,211,238,0.15)]',
    fuchsia: 'border-fuchsia-400/25 shadow-[0_0_24px_rgba(232,121,249,0.15)]',
    amber: 'border-amber-400/20 shadow-[0_0_24px_rgba(251,191,36,0.12)]',
    sky: 'border-sky-400/20 shadow-[0_0_24px_rgba(56,189,248,0.12)]',
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[5] overflow-hidden [perspective:1200px]"
      aria-hidden
    >
      {shards.map((s, i) => (
        <div
          key={i}
          className={`absolute rounded-sm border bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-[1px] ${border[s.hue]}`}
          style={{
            top: s.top,
            left: s.left,
            width: s.w,
            height: s.h,
            transform: `translateZ(${s.z}px) rotateX(${s.rotX}deg) rotateZ(${s.rotZ}deg)`,
            animation: `floatY ${s.dur}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
            opacity: 0.62,
          }}
        />
      ))}
    </div>
  )
}

export default SciFiShards
