import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useIsMobileOrTouch } from '../../hooks/useIsMobileOrTouch'

const CLICKABLE_SELECTOR =
  'a, button, input, textarea, select, [role="button"], [data-cursor-hover="true"]'

function CustomCursor() {
  const prefersReducedMotion = useReducedMotion()
  const isTouchLike = useIsMobileOrTouch()
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const targetRef = useRef({ x: 0, y: 0 })
  const ringPosRef = useRef({ x: 0, y: 0 })
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    if (isTouchLike || prefersReducedMotion) return undefined

    targetRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    ringPosRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 }

    const onMouseMove = (event) => {
      targetRef.current = { x: event.clientX, y: event.clientY }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${event.clientX - 6}px, ${event.clientY - 6}px, 0)`
      }
    }

    const onMouseOver = (event) => {
      const target = event.target
      if (target instanceof Element) {
        setHovering(Boolean(target.closest(CLICKABLE_SELECTOR)))
      }
    }

    let frame = 0
    const animate = () => {
      const ring = ringRef.current
      if (ring) {
        ringPosRef.current.x += (targetRef.current.x - ringPosRef.current.x) * 0.14
        ringPosRef.current.y += (targetRef.current.y - ringPosRef.current.y) * 0.14
        ring.style.transform = `translate3d(${ringPosRef.current.x}px, ${ringPosRef.current.y}px, 0) translate(-50%, -50%)`
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
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[80] h-3 w-3 rounded-full bg-accentPrimary shadow-[0_0_16px_rgba(0,212,255,0.95)]"
      />
      <div
        ref={ringRef}
        className={`pointer-events-none fixed left-0 top-0 z-[79] rounded-full border border-accentPrimary/80 transition-all duration-200 ease-neural ${
          hovering
            ? 'h-14 w-14 bg-accentPrimary/10 shadow-[0_0_20px_rgba(0,212,255,0.35)]'
            : 'h-9 w-9 bg-transparent'
        }`}
      />
    </>
  )
}

export default CustomCursor
