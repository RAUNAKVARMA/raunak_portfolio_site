import { lazy, Suspense } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useIsMobileOrTouch } from '../../hooks/useIsMobileOrTouch'
import SciFiScanlines from './SciFiScanlines'
import WebGLErrorBoundary from './WebGLErrorBoundary'

const SciFiCanvas = lazy(() => import('../three/SciFiCanvas'))

/**
 * Heavy sci-fi atmosphere: WebGL (desktop) + scanlines (no floating shard debris).
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
        <WebGLErrorBoundary>
          <Suspense fallback={null}>
            <SciFiCanvas />
          </Suspense>
        </WebGLErrorBoundary>
      )}
      <SciFiScanlines />
    </>
  )
}

export default SciFiLayer
