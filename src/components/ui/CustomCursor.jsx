import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useIsMobileOrTouch } from '../../hooks/useIsMobileOrTouch'

const CLICKABLE_SELECTOR =
  'a, button, input, textarea, select, [role="button"], [data-cursor-hover="true"]'

const LERP = {
  dot: 0.38,
  ring: 0.085,
}

/** Chained trail — each follows previous point */
const TRAIL_CHAIN = [0.22, 0.17, 0.14, 0.11, 0.09, 0.075, 0.062]

/** Hard colourful flow: cyan → magenta → pink → amber → lime → violet → sky */
const TRAIL_PALETTE = [
  { bg: 'linear-gradient(135deg,#22d3ee,#06b6d4)', shadow: '0 0 18px rgba(34,211,238,0.95)' },
  { bg: 'linear-gradient(135deg,#e879f9,#c026d3)', shadow: '0 0 20px rgba(232,121,249,0.9)' },
  { bg: 'linear-gradient(135deg,#f472b6,#db2777)', shadow: '0 0 20px rgba(244,114,182,0.85)' },
  { bg: 'linear-gradient(135deg,#fbbf24,#f59e0b)', shadow: '0 0 18px rgba(251,191,36,0.9)' },
  { bg: 'linear-gradient(135deg,#a3e635,#65a30d)', shadow: '0 0 18px rgba(163,230,53,0.85)' },
  { bg: 'linear-gradient(135deg,#a78bfa,#7c3aed)', shadow: '0 0 20px rgba(167,139,250,0.9)' },
  { bg: 'linear-gradient(135deg,#38bdf8,#0ea5e9)', shadow: '0 0 16px rgba(56,189,248,0.85)' },
]

const TRAIL_SIZES = [11, 13, 15, 17, 19, 21, 23]

function CustomCursor() {
  const prefersReducedMotion = useReducedMotion()
  const isTouchLike = useIsMobileOrTouch()

  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const r0 = useRef(null)
  const r1 = useRef(null)
  const r2 = useRef(null)
  const r3 = useRef(null)
  const r4 = useRef(null)
  const r5 = useRef(null)
  const r6 = useRef(null)
  const trailRefs = [r0, r1, r2, r3, r4, r5, r6]

  const targetRef = useRef({ x: 0, y: 0 })
  const dotPosRef = useRef({ x: 0, y: 0 })
  const ringPosRef = useRef({ x: 0, y: 0 })
  const trailPosRef = useRef(TRAIL_CHAIN.map(() => ({ x: 0, y: 0 })))

  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    if (isTouchLike || prefersReducedMotion) return undefined

    const cx = window.innerWidth / 2
    const cy = window.innerHeight / 2
    targetRef.current = { x: cx, y: cy }
    dotPosRef.current = { x: cx, y: cy }
    ringPosRef.current = { x: cx, y: cy }
    trailPosRef.current.forEach((p) => {
      p.x = cx
      p.y = cy
    })

    const onMouseMove = (event) => {
      targetRef.current = { x: event.clientX, y: event.clientY }
    }

    const onMouseOver = (event) => {
      const target = event.target
      if (target instanceof Element) {
        setHovering(Boolean(target.closest(CLICKABLE_SELECTOR)))
      }
    }

    const lerp2d = (pos, dest, t) => {
      pos.x += (dest.x - pos.x) * t
      pos.y += (dest.y - pos.y) * t
    }

    let frame = 0
    const animate = () => {
      const target = targetRef.current

      lerp2d(dotPosRef.current, target, LERP.dot)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotPosRef.current.x - 7}px, ${dotPosRef.current.y - 7}px, 0)`
      }

      lerp2d(ringPosRef.current, target, LERP.ring)
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPosRef.current.x}px, ${ringPosRef.current.y}px, 0) translate(-50%, -50%)`
      }

      const positions = trailPosRef.current
      for (let i = 0; i < positions.length; i += 1) {
        const follow = i === 0 ? target : positions[i - 1]
        lerp2d(positions[i], follow, TRAIL_CHAIN[i])
        const el = trailRefs[i].current
        if (el) {
          el.style.transform = `translate3d(${positions[i].x}px, ${positions[i].y}px, 0) translate(-50%, -50%)`
        }
      }

      frame = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseover', onMouseOver)
    frame = requestAnimationFrame(animate)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseover', onMouseOver)
      cancelAnimationFrame(frame)
    }
  }, [isTouchLike, prefersReducedMotion])

  if (isTouchLike || prefersReducedMotion) return null

  return (
    <>
      {TRAIL_PALETTE.map((c, i) => (
        <div
          key={`trail-${i}`}
          ref={trailRefs[i]}
          className="pointer-events-none fixed left-0 top-0 z-[74] rounded-full blur-[0.5px]"
          style={{
            width: TRAIL_SIZES[i],
            height: TRAIL_SIZES[i],
            background: c.bg,
            opacity: 0.55 + i * 0.045,
            boxShadow: c.shadow,
            mixBlendMode: 'screen',
          }}
        />
      ))}

      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[79] rounded-full border-2 border-cyan-300/90 will-change-transform"
        style={{
          width: hovering ? 58 : 38,
          height: hovering ? 58 : 38,
          background: hovering ? 'linear-gradient(135deg, rgba(232,121,249,0.2), rgba(34,211,238,0.15))' : 'transparent',
          boxShadow: hovering
            ? '0 0 36px rgba(232,121,249,0.55), 0 0 60px rgba(34,211,238,0.35)'
            : '0 0 16px rgba(34,211,238,0.35)',
          transition: 'width 200ms ease, height 200ms ease, background 200ms ease, box-shadow 200ms ease',
        }}
      />

      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[80] h-3.5 w-3.5 rounded-full will-change-transform"
        style={{
          background: 'linear-gradient(135deg, #fff, #22d3ee)',
          boxShadow:
            '0 0 12px #fff, 0 0 28px rgba(34,211,238,1), 0 0 48px rgba(232,121,249,0.75)',
        }}
      />
    </>
  )
}

export default CustomCursor
