import { useEffect, useRef, useState } from 'react'
import { useReducedMotionProfile } from '../../hooks/useReducedMotionProfile'

const CLICKABLE_SELECTOR =
  'a, button, input, textarea, select, [role="button"], [data-cursor-hover="true"]'

const LERP = { dot: 0.35, ring: 0.12 }

function CustomCursor() {
  const { enableCustomCursor } = useReducedMotionProfile()

  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const labelRef = useRef(null)

  const targetRef = useRef({ x: 0, y: 0 })
  const dotPosRef = useRef({ x: 0, y: 0 })
  const ringPosRef = useRef({ x: 0, y: 0 })

  const [hovering, setHovering] = useState(false)
  const [cursorLabel, setCursorLabel] = useState('')

  useEffect(() => {
    if (!enableCustomCursor) return undefined

    const cx = window.innerWidth / 2
    const cy = window.innerHeight / 2
    targetRef.current = { x: cx, y: cy }
    dotPosRef.current = { x: cx, y: cy }
    ringPosRef.current = { x: cx, y: cy }

    const onMouseMove = (event) => {
      targetRef.current = { x: event.clientX, y: event.clientY }
    }

    const onMouseOver = (event) => {
      const target = event.target
      if (!(target instanceof Element)) return

      const clickable = target.closest(CLICKABLE_SELECTOR)
      setHovering(Boolean(clickable))

      const labeled = target.closest('[data-cursor-label]')
      setCursorLabel(labeled?.getAttribute('data-cursor-label') || '')
    }

    const lerp2d = (pos, dest, t) => {
      pos.x += (dest.x - pos.x) * t
      pos.y += (dest.y - pos.y) * t
    }

    let frame = 0
    const animate = () => {
      const target = targetRef.current
      lerp2d(dotPosRef.current, target, LERP.dot)
      lerp2d(ringPosRef.current, target, LERP.ring)

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotPosRef.current.x}px, ${dotPosRef.current.y}px, 0) translate(-50%, -50%)`
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPosRef.current.x}px, ${ringPosRef.current.y}px, 0) translate(-50%, -50%)`
      }
      if (labelRef.current) {
        labelRef.current.style.left = `${dotPosRef.current.x}px`
        labelRef.current.style.top = `${dotPosRef.current.y}px`
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
  }, [enableCustomCursor])

  if (!enableCustomCursor) return null

  const showLabel = Boolean(cursorLabel)

  return (
    <>
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[79] rounded-full border border-white/80 will-change-transform mix-blend-difference"
        style={{
          width: showLabel ? 72 : hovering ? 48 : 36,
          height: showLabel ? 72 : hovering ? 48 : 36,
          transition: 'width 250ms cubic-bezier(0.16, 1, 0.3, 1), height 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[80] h-2 w-2 rounded-full bg-white will-change-transform mix-blend-difference"
      />

      {showLabel && (
        <div
          ref={labelRef}
          className="pointer-events-none fixed z-[81] -translate-x-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-widest text-white mix-blend-difference"
        >
          {cursorLabel}
        </div>
      )}
    </>
  )
}

export default CustomCursor
