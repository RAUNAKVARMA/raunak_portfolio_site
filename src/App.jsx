import { Suspense, lazy } from 'react'
import { MotionConfig } from 'framer-motion'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Stats from './components/Stats'
import About from './components/About'
import ScrollProgressBar from './components/ui/ScrollProgressBar'
import SpaceBackdrop from './components/ui/SpaceBackdrop'
import SciFiLayer from './components/ui/SciFiLayer'
import SciFiHUD from './components/ui/SciFiHUD'
import CustomCursor from './components/ui/CustomCursor'
import Footer from './components/Footer'

const Projects = lazy(() => import('./components/Projects'))
const Research = lazy(() => import('./components/Research'))
const Experience = lazy(() => import('./components/Experience'))
const Achievements = lazy(() => import('./components/Achievements'))
const Skills = lazy(() => import('./components/Skills'))
const Certifications = lazy(() => import('./components/Certifications'))
const Contact = lazy(() => import('./components/Contact'))

function SectionSkeleton({ height = 'h-[260px]' }) {
  return (
    <div className={`section-container ${height} animate-pulse rounded-2xl border border-borderColor bg-white/[0.02]`} />
  )
}

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative z-10">
        <SpaceBackdrop />
        <SciFiLayer />
        <div className="pointer-events-none fixed inset-0 z-[6] bg-[radial-gradient(ellipse_70%_45%_at_50%_-10%,rgba(34,211,238,0.09),transparent_55%)]" />
        <div className="pointer-events-none fixed inset-0 z-[6] bg-[radial-gradient(ellipse_55%_40%_at_100%_30%,rgba(232,121,249,0.06),transparent_50%)]" />
        <SciFiHUD />
        <div className="noise-overlay" />
        <CustomCursor />
        <ScrollProgressBar />
        <Navbar />

        <main className="relative z-10">
          <Hero />
          <Stats />
          <About />

          <Suspense fallback={<SectionSkeleton />}>
            <Projects />
          </Suspense>
          <Suspense fallback={<SectionSkeleton />}>
            <Research />
          </Suspense>
          <Suspense fallback={<SectionSkeleton height="h-[380px]" />}>
            <Experience />
          </Suspense>
          <Suspense fallback={<SectionSkeleton />}>
            <Achievements />
          </Suspense>
          <Suspense fallback={<SectionSkeleton />}>
            <Skills />
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
    </MotionConfig>
  )
}

export default App
