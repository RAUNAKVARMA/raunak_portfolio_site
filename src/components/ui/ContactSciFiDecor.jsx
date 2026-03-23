import { useReducedMotion } from 'framer-motion'

/**
 * Local “holographic” decor for Contact — CSS/SVG only (no extra WebGL).
 * pointer-events-none so the form stays usable.
 */
function ContactSciFiDecor() {
  const reduced = useReducedMotion()

  if (reduced) {
    return (
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl opacity-60"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(34,211,238,0.08),transparent_70%)]" />
      </div>
    )
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden>
      {/* Nebula wash */}
      <div className="absolute -left-1/4 top-0 h-[120%] w-[70%] bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.12),transparent_65%)]" />
      <div className="absolute -right-1/4 bottom-0 h-[100%] w-[60%] bg-[radial-gradient(ellipse_at_center,rgba(192,38,211,0.1),transparent_60%)]" />

      {/* Floating orbit rings */}
      <div
        className="absolute left-[5%] top-[12%] h-36 w-36 rounded-full border border-cyan-400/35 shadow-[0_0_50px_rgba(34,211,238,0.25)]"
        style={{
          animation: 'contactSpin 28s linear infinite',
          transformStyle: 'preserve-3d',
        }}
      />
      <div
        className="absolute left-[8%] top-[14%] h-28 w-28 rounded-full border border-fuchsia-400/25"
        style={{
          animation: 'contactSpin 22s linear infinite reverse',
        }}
      />

      <div
        className="absolute right-[8%] top-[20%] h-44 w-44 rounded-full border-2 border-dashed border-cyan-300/20"
        style={{ animation: 'contactSpin 35s linear infinite' }}
      />

      {/* “Satellite” diamond */}
      <div
        className="absolute right-[12%] top-[8%] text-cyan-400/50"
        style={{ animation: 'contactBob 7s ease-in-out infinite' }}
      >
        <svg width="56" height="56" viewBox="0 0 64 64" fill="none">
          <path
            d="M32 4 L58 32 L32 60 L6 32 Z"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="url(#cSat)"
            opacity="0.9"
          />
          <path d="M32 18 L46 32 L32 46 L18 32 Z" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
          <defs>
            <linearGradient id="cSat" x1="6" y1="4" x2="58" y2="60">
              <stop stopColor="#22d3ee" stopOpacity="0.15" />
              <stop offset="1" stopColor="#c084fc" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Hex lattice */}
      <div
        className="absolute bottom-[15%] left-[10%] opacity-30"
        style={{ animation: 'contactBob 9s ease-in-out infinite 1s' }}
      >
        <svg width="72" height="72" viewBox="0 0 48 48">
          <path
            d="M24 4 L42 14 L42 34 L24 44 L6 34 L6 14 Z"
            stroke="#a78bfa"
            strokeWidth="0.8"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M24 4 L42 14 L42 34 L24 44 L6 34 L6 14 Z"
            stroke="#22d3ee"
            strokeWidth="0.8"
            fill="none"
            opacity="0.4"
            transform="rotate(30 24 24)"
          />
        </svg>
      </div>

      {/* Glowing core */}
      <div
        className="absolute bottom-[8%] right-[15%] h-24 w-24 rounded-full bg-gradient-to-br from-cyan-400/30 to-fuchsia-500/30 blur-xl"
        style={{ animation: 'contactPulse 4s ease-in-out infinite' }}
      />
      <div
        className="absolute bottom-[15%] right-[20%] h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_24px_6px_rgba(34,211,238,0.8)]"
        style={{ animation: 'contactBob 5s ease-in-out infinite' }}
      />

      {/* Star specks */}
      {[...Array(18)].map((_, i) => (
        <span
          key={i}
          className="absolute h-0.5 w-0.5 rounded-full bg-white"
          style={{
            left: `${(i * 17) % 92}%`,
            top: `${(i * 23) % 88}%`,
            opacity: 0.25 + (i % 5) * 0.12,
            boxShadow: '0 0 6px rgba(255,255,255,0.8)',
            animation: `contactTwinkle ${3 + (i % 4)}s ease-in-out infinite`,
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}

      <style>{`
        @keyframes contactSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes contactBob {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-14px) scale(1.03); }
        }
        @keyframes contactPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.95; transform: scale(1.08); }
        }
        @keyframes contactTwinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.95; }
        }
      `}</style>
    </div>
  )
}

export default ContactSciFiDecor
