import { lazy, Suspense } from 'react'
import { useReducedMotionProfile } from '../../hooks/useReducedMotionProfile'
import WebGLErrorBoundary from './WebGLErrorBoundary'
import LoadingExperience from './LoadingExperience'

const SceneCanvas = lazy(() => import('../three/SceneCanvas'))

function StaticAmbientFallback() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[2] bg-ambient"
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
