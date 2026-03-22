import { Suspense, lazy } from 'react'
import { MotionConfig } from 'framer-motion'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Stats from './components/Stats'
import About from './components/About'
import ScrollProgressBar from './components/ui/ScrollProgressBar'
import ParticleBackground from './components/ui/ParticleBackground'
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
        <ParticleBackground />
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
