import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import RootLayout from './components/layout/RootLayout'
import { SceneProgressProvider } from './providers/SceneProgressProvider'
import { SmoothScrollProvider } from './providers/SmoothScrollProvider'

const HomePage = lazy(() => import('./pages/HomePage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const WorkPage = lazy(() => import('./pages/WorkPage'))
const ExperiencePage = lazy(() => import('./pages/ExperiencePage'))
const BeyondPage = lazy(() => import('./pages/BeyondPage'))
const CarsPage = lazy(() => import('./pages/CarsPage'))
const ArtExperiencePage = lazy(() => import('./pages/ArtExperiencePage'))
const SpacePage = lazy(() => import('./pages/SpacePage'))
const EditingPage = lazy(() => import('./pages/EditingPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function PageFallback() {
  return (
    <div className="section-container flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-pulse border border-white/20 bg-white/[0.04]" />
    </div>
  )
}

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <SceneProgressProvider>
        <SmoothScrollProvider>
          <Routes>
            <Route element={<RootLayout />}>
              <Route
                index
                element={
                  <Suspense fallback={<PageFallback />}>
                    <HomePage />
                  </Suspense>
                }
              />
              <Route
                path="about"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <AboutPage />
                  </Suspense>
                }
              />
              <Route
                path="work"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <WorkPage />
                  </Suspense>
                }
              />
              <Route
                path="experience"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <ExperiencePage />
                  </Suspense>
                }
              />
              <Route
                path="beyond"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <BeyondPage />
                  </Suspense>
                }
              />
              <Route
                path="beyond/cars"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <CarsPage />
                  </Suspense>
                }
              />
              <Route
                path="beyond/art"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <ArtExperiencePage />
                  </Suspense>
                }
              />
              <Route
                path="beyond/space"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <SpacePage />
                  </Suspense>
                }
              />
              <Route
                path="beyond/editing"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <EditingPage />
                  </Suspense>
                }
              />
              <Route
                path="contact"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <ContactPage />
                  </Suspense>
                }
              />
              <Route
                path="*"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <NotFoundPage />
                  </Suspense>
                }
              />
            </Route>
          </Routes>
        </SmoothScrollProvider>
      </SceneProgressProvider>
    </MotionConfig>
  )
}

export default App
