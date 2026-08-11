import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { RiArrowLeftLine } from 'react-icons/ri'
import WebGLErrorBoundary from '../../ui/WebGLErrorBoundary'
import { useReducedMotionProfile } from '../../../hooks/useReducedMotionProfile'
import { useLenis } from '../../../providers/SmoothScrollProvider'
import ArtCylinderCanvas from './ArtCylinderCanvas'
import { artScrollState, impulseFlick, impulseScroll } from './artScrollState'

function ImmersiveFallback() {
  return (
    <div className="absolute inset-0">
      <img src="/images/drawings/aurora-wolf.png" alt="" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="font-heading text-5xl font-bold uppercase tracking-[0.2em] text-white">
          Drawing
        </p>
      </div>
    </div>
  )
}

function ArtExperience() {
  const navigate = useNavigate()
  const lenisRef = useLenis()
  const touchY = useRef(null)
  const touchSamples = useRef([])
  const [effectOn, setEffectOn] = useState(true)
  const { prefersReducedMotion, isTouchLike } = useReducedMotionProfile()
  const useStatic = prefersReducedMotion

  useEffect(() => {
    artScrollState.position = 0
    artScrollState.display = 0
    artScrollState.velocity = 0
    artScrollState.energy = 0
    artScrollState.enabled = true

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    document.body.classList.add('art-experience-active')

    try {
      lenisRef?.current?.stop()
    } catch {
      /* */
    }

    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
      document.body.classList.remove('art-experience-active')
      try {
        lenisRef?.current?.start()
      } catch {
        /* */
      }
      artScrollState.enabled = false
    }
  }, [lenisRef])

  useEffect(() => {
    artScrollState.enabled = effectOn
    if (!effectOn) artScrollState.velocity = 0
  }, [effectOn])

  useEffect(() => {
    if (useStatic) return undefined

    const onWheel = (e) => {
      e.preventDefault()
      e.stopPropagation()
      impulseScroll(e.deltaY, { deltaMode: e.deltaMode })
    }

    const onTouchStart = (e) => {
      const y = e.touches[0]?.clientY ?? null
      touchY.current = y
      touchSamples.current = y == null ? [] : [{ y, t: performance.now() }]
    }

    const onTouchMove = (e) => {
      if (touchY.current == null) return
      e.preventDefault()
      const y = e.touches[0]?.clientY
      if (y == null) return
      const dy = touchY.current - y
      touchY.current = y
      const now = performance.now()
      touchSamples.current.push({ y, t: now })
      if (touchSamples.current.length > 6) touchSamples.current.shift()
      impulseScroll(dy * 2.4)
    }

    const onTouchEnd = () => {
      const samples = touchSamples.current
      touchY.current = null
      if (samples.length >= 2) {
        const a = samples[0]
        const b = samples[samples.length - 1]
        const dt = Math.max(1, b.t - a.t)
        impulseFlick((a.y - b.y) / dt)
      }
      touchSamples.current = []
    }

    const onKey = (e) => {
      if (e.key === 'Escape') navigate('/beyond/drawing')
      if (e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault()
        impulseScroll(100)
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        impulseScroll(-100)
      }
    }

    window.addEventListener('wheel', onWheel, { passive: false, capture: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true, capture: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false, capture: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true, capture: true })
    window.addEventListener('touchcancel', onTouchEnd, { passive: true, capture: true })
    window.addEventListener('keydown', onKey)

    return () => {
      window.removeEventListener('wheel', onWheel, { capture: true })
      window.removeEventListener('touchstart', onTouchStart, { capture: true })
      window.removeEventListener('touchmove', onTouchMove, { capture: true })
      window.removeEventListener('touchend', onTouchEnd, { capture: true })
      window.removeEventListener('touchcancel', onTouchEnd, { capture: true })
      window.removeEventListener('keydown', onKey)
    }
  }, [useStatic, navigate])

  return (
    <div
      className="fixed inset-0 z-[9999] touch-none bg-black"
      role="dialog"
      aria-modal="true"
      aria-labelledby="art-experience-title"
    >
      {useStatic ? (
        <ImmersiveFallback />
      ) : (
        <WebGLErrorBoundary fallback={<ImmersiveFallback />}>
          <ArtCylinderCanvas active paused={!effectOn} mobileLite={isTouchLike} />
        </WebGLErrorBoundary>
      )}

      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_55%_60%_at_50%_50%,transparent_40%,rgba(0,0,0,0.18)_100%)]" />

      <div className="absolute left-5 top-5 z-30 sm:left-7 sm:top-7">
        <Link to="/beyond/drawing" className="art-back-btn inline-flex items-center gap-2">
          <RiArrowLeftLine />
          Back
        </Link>
      </div>

      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6">
        <div className="art-cylinder-pill text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/70">
            Beyond Work — Art
          </p>
          <h1
            id="art-experience-title"
            className="mt-1 font-heading text-[15px] font-medium tracking-wide text-white sm:text-base"
          >
            Drawing &amp; Visual Thinking
          </h1>
        </div>
      </div>

      {!useStatic && (
        <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center">
          <button
            type="button"
            className="art-cylinder-toggle"
            aria-pressed={effectOn}
            onClick={() => setEffectOn((v) => !v)}
          >
            DRAWING — {effectOn ? 'ON' : 'OFF'}
          </button>
        </div>
      )}
    </div>
  )
}

export default ArtExperience
