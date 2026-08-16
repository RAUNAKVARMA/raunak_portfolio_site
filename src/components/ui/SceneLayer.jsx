import { lazy, Suspense } from 'react'
import { useLocation } from 'react-router-dom'
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
  const { pathname } = useLocation()
  const { prefersReducedMotion, isTouchLike } = useReducedMotionProfile()
  const skipHeroWebGL =
    pathname.startsWith('/beyond/cars') ||
    pathname.startsWith('/beyond/movies') ||
    pathname.startsWith('/beyond/music') ||
    pathname.startsWith('/beyond/drawing')

  if (prefersReducedMotion || skipHeroWebGL) {
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
