import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useIsMobileOrTouch } from '../../hooks/useIsMobileOrTouch'

const CLICKABLE_SELECTOR =
  'a, button, input, textarea, select, [role="button"], [data-cursor-hover="true"]'

/** Stronger flow: lower = more lag / longer “tail” */
const LERP = {
  dot: 0.32,
  ring: 0.078,
}

/**
 * Chained trail: each orb follows the *previous* point (mouse → t0 → t1 → …)
 * so the tail stretches instead of collapsing to one spot.
 */
const TRAIL_CHAIN = [0.2, 0.16, 0.13, 0.105, 0.085, 0.068]

const TRAIL_VISUAL = [
  { size: 'w-2.5 h-2.5', opacity: 'opacity-[0.55]', glow: 'shadow-[0_0_14px_rgba(0,212,255,0.55)]' },
  { size: 'w-3.5 h-3.5', opacity: 'opacity-[0.42]', glow: 'shadow-[0_0_18px_rgba(0,212,255,0.45)]' },
  { size: 'w-4 h-4', opacity: 'opacity-[0.32]', glow: 'shadow-[0_0_22px_rgba(0,212,255,0.38)]' },
  { size: 'w-5 h-5', opacity: 'opacity-[0.22]', glow: 'shadow-[0_0_26px_rgba(0,212,255,0.32)]' },
  { size: 'w-6 h-6', opacity: 'opacity-[0.14]', glow: 'shadow-[0_0_32px_rgba(0,212,255,0.28)]' },
  { size: 'w-7 h-7', opacity: 'opacity-[0.08]', glow: 'shadow-[0_0_38px_rgba(0,212,255,0.22)]' },
]

function CustomCursor() {
  const prefersReducedMotion = useReducedMotion()
  const isTouchLike = useIsMobileOrTouch()

  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const t0 = useRef(null)
  const t1 = useRef(null)
  const t2 = useRef(null)
  const t3 = useRef(null)
  const t4 = useRef(null)
  const t5 = useRef(null)
  const trailRefs = [t0, t1, t2, t3, t4, t5]

  const targetRef = useRef({ x: 0, y: 0 })
  const dotPosRef = useRef({ x: 0, y: 0 })
  const ringPosRef = useRef({ x: 0, y: 0 })
  const trailPosRef = useRef(
    TRAIL_CHAIN.map(() => ({ x: 0, y: 0 })),
  )

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
        dotRef.current.style.transform = `translate3d(${dotPosRef.current.x - 6}px, ${dotPosRef.current.y - 6}px, 0)`
      }

      lerp2d(ringPosRef.current, target, LERP.ring)
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPosRef.current.x}px, ${ringPosRef.current.y}px, 0) translate(-50%, -50%)`
      }

      // Chained flow: t0 → mouse, t1 → t0, …
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
      {TRAIL_VISUAL.map((style, i) => (
        <div
          key={`trail-${i}`}
          ref={trailRefs[i]}
          className={`pointer-events-none fixed left-0 top-0 z-[74] rounded-full bg-accentPrimary ${style.size} ${style.opacity} blur-[1px] ${style.glow} will-change-transform`}
        />
      ))}

      <div
        ref={ringRef}
        className={`pointer-events-none fixed left-0 top-0 z-[79] rounded-full border-2 border-accentPrimary/90 will-change-transform ${
          hovering
            ? 'h-[56px] w-[56px] bg-accentPrimary/12 shadow-[0_0_28px_rgba(0,212,255,0.45)]'
            : 'h-9 w-9 bg-transparent shadow-[0_0_12px_rgba(0,212,255,0.2)]'
        }`}
        style={{ transition: 'width 200ms ease, height 200ms ease, background-color 200ms ease, box-shadow 200ms ease' }}
      />

      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[80] h-3 w-3 rounded-full bg-accentPrimary shadow-[0_0_20px_rgba(0,212,255,1)] will-change-transform"
      />
    </>
  )
}

export default CustomCursor
