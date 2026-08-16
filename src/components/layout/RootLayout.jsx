import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../Navbar'
import Footer from '../Footer'
import SceneLayer from '../ui/SceneLayer'
import SceneController from '../three/SceneController'
import ScrollSceneTriggers from '../three/ScrollSceneTriggers'
import CustomCursor from '../ui/CustomCursor'
import FluidCanvas from '../ui/FluidCanvas'
import ScrollProgressBar from '../ui/ScrollProgressBar'
import PageTransition from './PageTransition'
import { useSceneProgress } from '../../providers/SceneProgressProvider'
import { useLenis } from '../../providers/SmoothScrollProvider'
import { useReducedMotionProfile } from '../../hooks/useReducedMotionProfile'
import { useRouteScene } from '../../hooks/useRouteScene'

function CursorBodyClass() {
  const { enableCustomCursor } = useReducedMotionProfile()

  useEffect(() => {
    document.body.classList.toggle('custom-cursor-active', enableCustomCursor)
    return () => document.body.classList.remove('custom-cursor-active')
  }, [enableCustomCursor])

  return null
}

function RootLayout() {
  const { pathname } = useLocation()
  const lenisRef = useLenis()
  const { setMorphProgress, setContactProgress, setScrollProgress } = useSceneProgress()
  const isDrawingImmersive = pathname.startsWith('/beyond/drawing')
  const isMoviesImmersive = pathname.startsWith('/beyond/movies')
  const isMusicImmersive = pathname.startsWith('/beyond/music')
  const isImmersive = isDrawingImmersive || isMoviesImmersive || isMusicImmersive
  const hideFluid = isMoviesImmersive || isMusicImmersive

  useRouteScene()

  // Warm garage GLBs as soon as the site is idle so /beyond/cars opens in <1s.
  useEffect(() => {
    let cancelled = false
    const run = () => {
      if (cancelled) return
      import('../beyond/cars/carGltf')
        .then(({ bootGarageAssets }) => import('../../data/favoriteCars').then(({ favoriteCars }) => ({
          bootGarageAssets,
          favoriteCars,
        })))
        .then(({ bootGarageAssets, favoriteCars }) => {
          if (cancelled) return
          bootGarageAssets(favoriteCars.map((c) => c.modelUrl), { concurrency: 5 })
        })
        .catch(() => {})
    }
    const ric = window.requestIdleCallback
    const idleId =
      typeof ric === 'function' ? ric(run, { timeout: 900 }) : window.setTimeout(run, 280)
    return () => {
      cancelled = true
      if (typeof ric === 'function' && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId)
      } else {
        window.clearTimeout(idleId)
      }
    }
  }, [])

  useEffect(() => {
    setMorphProgress(0)
    setContactProgress(0)
    setScrollProgress(0)

    const lenis = lenisRef?.current
    if (lenis) {
      lenis.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo(0, 0)
    }

    const main = document.getElementById('main-content')
    if (main) {
      main.focus({ preventScroll: true })
    }
  }, [pathname, lenisRef, setMorphProgress, setContactProgress, setScrollProgress])

  useEffect(() => {
    document.documentElement.classList.toggle('drawing-immersive', isDrawingImmersive)
    document.body.classList.toggle('drawing-immersive', isDrawingImmersive)
    return () => {
      document.documentElement.classList.remove('drawing-immersive')
      document.body.classList.remove('drawing-immersive')
    }
  }, [isDrawingImmersive])

  return (
    <div className={`relative z-10${isDrawingImmersive ? ' is-drawing-immersive' : ''}`}>
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      <CursorBodyClass />
      <SceneController />
      <ScrollSceneTriggers />
      <SceneLayer />
      {!hideFluid ? <FluidCanvas /> : null}
      {!hideFluid ? (
        <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(28,105,212,0.08),transparent_60%)]" aria-hidden />
      ) : null}
      <div className="noise-overlay" />
      <CustomCursor />
      {!isImmersive ? <ScrollProgressBar /> : null}
      {!isImmersive ? <Navbar /> : null}

      <main id="main-content" className="relative isolate z-10 bg-black" tabIndex={-1}>
        <PageTransition routeKey={pathname}>
          <Outlet />
        </PageTransition>
      </main>

      {!isImmersive ? <Footer /> : null}
    </div>
  )
}

export default RootLayout
