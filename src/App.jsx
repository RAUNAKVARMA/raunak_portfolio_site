import { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import RootLayout from './components/layout/RootLayout'
import { SceneProgressProvider } from './providers/SceneProgressProvider'
import { SmoothScrollProvider } from './providers/SmoothScrollProvider'
import { lazyWithRetry } from './lib/lazyWithRetry'
import AboutPage from './pages/AboutPage'

const HomePage = lazyWithRetry(() => import('./pages/HomePage'))
const WorkPage = lazyWithRetry(() => import('./pages/WorkPage'))
const ExperiencePage = lazyWithRetry(() => import('./pages/ExperiencePage'))
const BeyondPage = lazyWithRetry(() => import('./pages/BeyondPage'))
const CarsPage = lazyWithRetry(() => import('./pages/CarsPage'))
const DrawingPage = lazyWithRetry(() => import('./pages/DrawingPage'))
const ArtExperiencePage = lazyWithRetry(() => import('./pages/ArtExperiencePage'))
const SpacePage = lazyWithRetry(() => import('./pages/SpacePage'))
const EditingPage = lazyWithRetry(() => import('./pages/EditingPage'))
const MoviesPage = lazyWithRetry(() => import('./pages/MoviesPage'))
const MusicPage = lazyWithRetry(() => import('./pages/MusicPage'))
const ContactPage = lazyWithRetry(() => import('./pages/ContactPage'))
const NotFoundPage = lazyWithRetry(() => import('./pages/NotFoundPage'))

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
                element={<AboutPage />}
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
                path="beyond/drawing"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <DrawingPage />
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
                path="beyond/movies"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <MoviesPage />
                  </Suspense>
                }
              />
              <Route
                path="beyond/music"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <MusicPage />
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
