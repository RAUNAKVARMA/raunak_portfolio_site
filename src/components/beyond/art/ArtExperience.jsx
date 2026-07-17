import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { RiArrowLeftLine } from 'react-icons/ri'
import WebGLErrorBoundary from '../../ui/WebGLErrorBoundary'
import { useReducedMotionProfile } from '../../../hooks/useReducedMotionProfile'
import { useLenis } from '../../../providers/SmoothScrollProvider'
import ArtCylinderCanvas from './ArtCylinderCanvas'
import { artScrollState } from './artScrollState'

function ImmersiveFallback() {
  return (
    <div className="absolute inset-0">
      <img src="/images/art-canyon-organic.png" alt="" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="font-heading text-5xl font-bold uppercase tracking-[0.2em] text-white">
          Drawing
        </p>
      </div>
    </div>
  )
}

function applyScrollDelta(deltaY) {
  if (!artScrollState.enabled) return
  // Page-based scroll: wheel nudges to next/prev full image
  const boost = Math.sign(deltaY) * Math.min(Math.abs(deltaY) * 0.012, 2.5)
  artScrollState.velocity += boost
}

function ArtExperience() {
  const navigate = useNavigate()
  const lenisRef = useLenis()
  const touchY = useRef(null)
  const [effectOn, setEffectOn] = useState(true)
  const { prefersReducedMotion } = useReducedMotionProfile()
  const useStatic = prefersReducedMotion

  useEffect(() => {
    artScrollState.position = 0
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
      applyScrollDelta(e.deltaY)
    }

    const onTouchStart = (e) => {
      touchY.current = e.touches[0]?.clientY ?? null
    }

    const onTouchMove = (e) => {
      if (touchY.current == null) return
      e.preventDefault()
      const y = e.touches[0]?.clientY
      if (y == null) return
      applyScrollDelta(touchY.current - y)
      touchY.current = y
    }

    const onKey = (e) => {
      if (e.key === 'Escape') navigate('/beyond')
      if (e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault()
        applyScrollDelta(80)
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        applyScrollDelta(-80)
      }
    }

    window.addEventListener('wheel', onWheel, { passive: false, capture: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true, capture: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false, capture: true })
    window.addEventListener('keydown', onKey)

    return () => {
      window.removeEventListener('wheel', onWheel, { capture: true })
      window.removeEventListener('touchstart', onTouchStart, { capture: true })
      window.removeEventListener('touchmove', onTouchMove, { capture: true })
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
          <ArtCylinderCanvas active paused={!effectOn} />
        </WebGLErrorBoundary>
      )}

      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_40%_50%_at_50%_50%,transparent_0%,rgba(0,0,0,0.45)_100%)]" />

      <div className="absolute left-5 top-5 z-30 sm:left-7 sm:top-7">
        <Link to="/beyond" className="art-back-btn inline-flex items-center gap-2">
          <RiArrowLeftLine />
          Back
        </Link>
      </div>

      {/* Center pill — VL style */}
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
