import { useEffect } from 'react'
import { useReducedMotionProfile } from '../../hooks/useReducedMotionProfile'
import { registerWebCard, unregisterWebCard } from './aboutWebEngine'

/** Register card with the unified web physics engine. */
export function useWebSuspension(ref, hubRef, options = {}) {
  const { prefersReducedMotion } = useReducedMotionProfile()
  const { phase = 0, nodeId = '', sway = 8, stiffness = 28, damping = 0.82 } = options

  useEffect(() => {
    if (prefersReducedMotion) return undefined
    const el = ref.current
    if (!el) return undefined

    const id = nodeId || `card-${phase}`
    registerWebCard(id, el, hubRef, { phase, nodeId, sway, stiffness, damping })

    return () => unregisterWebCard(id)
  }, [ref, hubRef, phase, nodeId, sway, stiffness, damping, prefersReducedMotion])
}
