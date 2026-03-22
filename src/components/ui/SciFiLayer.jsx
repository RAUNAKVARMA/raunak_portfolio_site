import { lazy, Suspense } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useIsMobileOrTouch } from '../../hooks/useIsMobileOrTouch'
import SciFiShards from './SciFiShards'
import SciFiScanlines from './SciFiScanlines'

const SciFiCanvas = lazy(() => import('../three/SciFiCanvas'))

/**
 * Heavy sci-fi atmosphere: WebGL (desktop) + CSS shards + scanlines.
 * Skips WebGL on touch / reduced-motion for battery & a11y.
 */
function SciFiLayer() {
  const prefersReducedMotion = useReducedMotion()
  const isTouchLike = useIsMobileOrTouch()

  if (prefersReducedMotion) {
    return null
  }

  return (
    <>
      {!isTouchLike && (
        <Suspense fallback={null}>
          <SciFiCanvas />
        </Suspense>
      )}
      <SciFiShards />
      <SciFiScanlines />
    </>
  )
}

export default SciFiLayer
