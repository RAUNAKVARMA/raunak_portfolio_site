import { useCallback, useRef } from 'react'
import { useReducedMotionProfile } from '../../hooks/useReducedMotionProfile'

function GlassCard({ className = '', children, cursorLabel, ...props }) {
  const cardRef = useRef(null)
  const { prefersReducedMotion } = useReducedMotionProfile()

  const handleMove = useCallback(
    (event) => {
      if (prefersReducedMotion || !cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width - 0.5
      const y = (event.clientY - rect.top) / rect.height - 0.5
      cardRef.current.style.transform = `perspective(800px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateY(-2px)`
    },
    [prefersReducedMotion],
  )

  const handleLeave = useCallback(() => {
    if (!cardRef.current) return
    cardRef.current.style.transform = ''
  }, [])

  return (
    <div
      ref={cardRef}
      className={`glass-card ${className}`.trim()}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      data-cursor-hover="true"
      {...(cursorLabel ? { 'data-cursor-label': cursorLabel } : {})}
      {...props}
    >
      {children}
    </div>
  )
}

export default GlassCard
