import { lazy, Suspense } from 'react'
import { useReducedMotionProfile } from '../../hooks/useReducedMotionProfile'
import WebGLErrorBoundary from './WebGLErrorBoundary'
import LoadingExperience from './LoadingExperience'

const SceneCanvas = lazy(() => import('../three/SceneCanvas'))

function StaticAmbientFallback() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[2] bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(255,255,255,0.03),transparent_60%)]"
      aria-hidden
    />
  )
}

function SceneLayer() {
  const { prefersReducedMotion, isTouchLike } = useReducedMotionProfile()

  if (prefersReducedMotion) {
    return <StaticAmbientFallback />
  }

  return (
    <>
      <LoadingExperience />
      {!isTouchLike ? (
        <WebGLErrorBoundary fallback={<StaticAmbientFallback />}>
          <Suspense fallback={<StaticAmbientFallback />}>
            <SceneCanvas />
          </Suspense>
        </WebGLErrorBoundary>
      ) : (
        <WebGLErrorBoundary fallback={<StaticAmbientFallback />}>
          <Suspense fallback={<StaticAmbientFallback />}>
            <SceneCanvas />
          </Suspense>
        </WebGLErrorBoundary>
      )}
    </>
  )
}

export default SceneLayer
