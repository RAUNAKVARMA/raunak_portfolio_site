import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../Navbar'
import Footer from '../Footer'
import SceneLayer from '../ui/SceneLayer'
import SceneController from '../three/SceneController'
import ScrollSceneTriggers from '../three/ScrollSceneTriggers'
import CustomCursor from '../ui/CustomCursor'
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

  useRouteScene()

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

  return (
    <div className="relative z-10">
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      <CursorBodyClass />
      <SceneController />
      <ScrollSceneTriggers />
      <SceneLayer />
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(28,105,212,0.08),transparent_60%)]" aria-hidden />
      <div className="noise-overlay" />
      <CustomCursor />
      <ScrollProgressBar />
      <Navbar />

      <main id="main-content" className="relative isolate z-10 bg-black" tabIndex={-1}>
        <PageTransition routeKey={pathname}>
          <Outlet />
        </PageTransition>
      </main>

      <Footer />
    </div>
  )
}

export default RootLayout
