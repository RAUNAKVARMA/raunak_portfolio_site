import { Suspense, lazy, useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Stats from './components/Stats'
import About from './components/About'
import ScrollProgressBar from './components/ui/ScrollProgressBar'
import SceneLayer from './components/ui/SceneLayer'
import SceneController from './components/three/SceneController'
import ScrollSceneTriggers from './components/three/ScrollSceneTriggers'
import CustomCursor from './components/ui/CustomCursor'
import Footer from './components/Footer'
import { SceneProgressProvider } from './providers/SceneProgressProvider'
import { SmoothScrollProvider } from './providers/SmoothScrollProvider'
import { useReducedMotionProfile } from './hooks/useReducedMotionProfile'

const Projects = lazy(() => import('./components/Projects'))
const ExperienceTimeline = lazy(() => import('./components/sections/ExperienceTimeline'))
const Achievements = lazy(() => import('./components/Achievements'))
const Skills = lazy(() => import('./components/Skills'))
const Certifications = lazy(() => import('./components/Certifications'))
const Contact = lazy(() => import('./components/Contact'))

function SectionSkeleton({ height = 'h-[260px]' }) {
  return (
    <div className={`section-container ${height} animate-pulse rounded-2xl border border-borderColor bg-white/[0.02]`} />
  )
}

function CursorBodyClass() {
  const { enableCustomCursor } = useReducedMotionProfile()

  useEffect(() => {
    document.body.classList.toggle('custom-cursor-active', enableCustomCursor)
    return () => document.body.classList.remove('custom-cursor-active')
  }, [enableCustomCursor])

  return null
}

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <SceneProgressProvider>
        <SmoothScrollProvider>
          <CursorBodyClass />
          <SceneController />
          <ScrollSceneTriggers />
          <div className="relative z-10">
            <a href="#main-content" className="skip-to-main">
              Skip to main content
            </a>
            <SceneLayer />
            <div className="pointer-events-none fixed inset-0 z-[1] bg-ambient" aria-hidden />
            <div className="noise-overlay" />
            <CustomCursor />
            <ScrollProgressBar />
            <Navbar />

            <main id="main-content" className="relative z-10" tabIndex={-1}>
              <Hero />
              <About />
              <Stats />

              <Suspense fallback={<SectionSkeleton />}>
                <Skills />
              </Suspense>
              <Suspense fallback={<SectionSkeleton />}>
                <Projects />
              </Suspense>
              <Suspense fallback={<SectionSkeleton height="h-[480px]" />}>
                <ExperienceTimeline />
              </Suspense>
              <Suspense fallback={<SectionSkeleton />}>
                <Achievements />
              </Suspense>
              <Suspense fallback={<SectionSkeleton />}>
                <Certifications />
              </Suspense>
              <Suspense fallback={<SectionSkeleton />}>
                <Contact />
              </Suspense>
            </main>

            <Footer />
          </div>
        </SmoothScrollProvider>
      </SceneProgressProvider>
    </MotionConfig>
  )
}

export default App
