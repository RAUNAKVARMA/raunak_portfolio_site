import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { RiArrowLeftLine, RiArrowDownLine } from 'react-icons/ri'
import WebGLErrorBoundary from '../../ui/WebGLErrorBoundary'
import { spaceChapters } from '../../../data/spaceChapters'
import { getPresetById } from '../../../lib/galaxyParams'
import { useReducedMotionProfile } from '../../../hooks/useReducedMotionProfile'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import GalaxyColorControls from './GalaxyColorControls'

const GalaxyCanvas = lazy(() => import('./GalaxyCanvas'))

function chapterVisibility(progress, index, total) {
  if (total <= 1) return 1
  const start = index / total
  const end = (index + 1) / total
  const mid = (start + end) / 2
  const half = (end - start) * 0.52
  const dist = Math.abs(progress - mid)
  return Math.max(0, 1 - dist / half)
}

function SpaceExperience() {
  useDocumentTitle('Space')
  const trackRef = useRef(null)
  const [progress, setProgress] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const [showCue, setShowCue] = useState(true)
  const [presetId, setPresetId] = useState('ideal')
  const [customColors, setCustomColors] = useState(null)
  const { prefersReducedMotion, isTouchLike } = useReducedMotionProfile()

  const palette = useMemo(() => {
    if (customColors) return customColors
    return getPresetById(presetId)
  }, [customColors, presetId])

  const total = spaceChapters.length
  const memoirStart = spaceChapters.findIndex((c) => c.kind === 'memoir')
  const memoirMix =
    memoirStart < 0
      ? 0
      : Math.min(1, Math.max(0, (progress - memoirStart / total) / (1 - memoirStart / total + 0.001)))

  useEffect(() => {
    const el = trackRef.current
    if (!el) return undefined

    let raf = 0
    const update = () => {
      const rect = el.getBoundingClientRect()
      const scrollable = Math.max(1, rect.height - window.innerHeight)
      const scrolled = Math.min(scrollable, Math.max(0, -rect.top))
      const next = scrolled / scrollable
      setProgress(next)
      setShowCue(next < 0.03)

      let best = 0
      let bestScore = -1
      for (let i = 0; i < total; i += 1) {
        const score = chapterVisibility(next, i, total)
        if (score > bestScore) {
          bestScore = score
          best = i
        }
      }
      setActiveIndex(best)
    }

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [total])

  const zoom = prefersReducedMotion
    ? 0.55
    : Math.min(1, progress * (total / Math.max(1, memoirStart || total * 0.55)))

  const galaxyFade = prefersReducedMotion ? 0.45 : 1 - memoirMix * 0.42
  const atExit = progress > 0.92

  return (
    <div className="cosmos-root">
      <Link to="/beyond" className="cosmos-back" data-cursor-hover="true">
        <RiArrowLeftLine aria-hidden />
        <span>Beyond</span>
      </Link>

      <GalaxyColorControls
        presetId={presetId}
        custom={customColors}
        onSelectPreset={(id) => {
          setCustomColors(null)
          setPresetId(id)
        }}
        onCustomChange={(next) => {
          setCustomColors(next)
          setPresetId('custom')
        }}
      />

      <div className="cosmos-progress" role="navigation" aria-label="Space chapter progress">
        {spaceChapters.map((chapter, index) => (
          <span
            key={chapter.id}
            className={`cosmos-progress-dot${index === activeIndex ? ' is-active' : ''}${
              chapter.kind === 'memoir' ? ' is-memoir' : ''
            }`}
            aria-hidden
          />
        ))}
        <span className="cosmos-progress-label" aria-live="polite">
          {String(activeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>

      <div
        ref={trackRef}
        className="cosmos-track"
        style={{ height: `${Math.max(4, total) * 115}vh` }}
      >
        <div className="cosmos-sticky">
          <div
            className="cosmos-canvas"
            style={{ opacity: galaxyFade, transition: 'opacity 500ms ease' }}
          >
            {prefersReducedMotion ? (
              <div className="cosmos-fallback" aria-hidden />
            ) : (
              <WebGLErrorBoundary fallback={<div className="cosmos-fallback" aria-hidden />}>
                <Suspense fallback={<div className="cosmos-fallback" aria-hidden />}>
                  <GalaxyCanvas
                    zoom={zoom}
                    mobileLite={isTouchLike}
                    reducedMotion={Boolean(prefersReducedMotion)}
                    insideColor={palette.insideColor}
                    midColor={palette.midColor}
                    outsideColor={palette.outsideColor}
                  />
                </Suspense>
              </WebGLErrorBoundary>
            )}
          </div>

          <div className="cosmos-vignette" aria-hidden />
          <div
            className={`cosmos-memoir-haze${memoirMix > 0.08 ? ' is-on' : ''}`}
            style={{ opacity: memoirMix * 0.9 }}
            aria-hidden
          />

          <div className={`cosmos-chapters${memoirMix > 0.2 ? ' is-memoir-mode' : ''}`}>
            {spaceChapters.map((chapter, index) => {
              const visibility = chapterVisibility(progress, index, total)
              const active = visibility > 0.14
              const isMemoir = chapter.kind === 'memoir'
              return (
                <article
                  key={chapter.id}
                  className={`cosmos-chapter${isMemoir ? ' is-memoir' : ''}${
                    active ? ' is-active' : ''
                  }`}
                  style={{
                    opacity: visibility,
                    transform: `translate3d(0, ${(1 - visibility) * (isMemoir ? 28 : 16)}px, 0) scale(${
                      0.985 + visibility * 0.015
                    })`,
                    filter: `blur(${(1 - visibility) * (isMemoir ? 2.4 : 1.2)}px)`,
                    pointerEvents: active ? 'auto' : 'none',
                  }}
                  aria-hidden={!active}
                >
                  {chapter.era ? <p className="cosmos-era">{chapter.era}</p> : null}
                  <p className="cosmos-eyebrow">{chapter.eyebrow}</p>
                  <p className="cosmos-body">{chapter.body}</p>
                </article>
              )
            })}
          </div>

          {showCue ? (
            <p className="cosmos-scroll-cue" aria-hidden>
              <RiArrowDownLine />
              Scroll to zoom out
            </p>
          ) : null}

          <div className={`cosmos-exit${atExit ? ' is-visible' : ''}`}>
            <Link to="/beyond" className="cosmos-note-link" data-cursor-hover="true">
              ← Back to interests
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpaceExperience
