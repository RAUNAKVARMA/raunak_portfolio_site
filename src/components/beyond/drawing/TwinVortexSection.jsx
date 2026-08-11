import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ArtCylinderCanvas from '../art/ArtCylinderCanvas'
import { artScrollState, impulseFlick, impulseScroll } from '../art/artScrollState'
import WebGLErrorBoundary from '../../ui/WebGLErrorBoundary'
import { useReducedMotionProfile } from '../../../hooks/useReducedMotionProfile'
import { prefetchVortexAtlas } from '../../../lib/vortexAtlas'

function VortexFallback({ dimmed = true }) {
  return (
    <div className="absolute inset-0" aria-hidden>
      <img
        src="/images/drawings/aurora-wolf.png"
        alt=""
        className="h-full w-full object-cover object-center"
        loading="eager"
        decoding="async"
        fetchPriority="high"
      />
      {dimmed ? <div className="absolute inset-0 bg-black/25" /> : null}
    </div>
  )
}

/**
 * Twin-vortex field for the Drawing interest page —
 * atlas + WebGL warm on mount so the field is ready when scrolled into view.
 */
function TwinVortexSection() {
  const previewRef = useRef(null)
  const [inView, setInView] = useState(false)
  const [webglOk, setWebglOk] = useState(true)
  const { prefersReducedMotion, isTouchLike } = useReducedMotionProfile()
  const showLive = webglOk && !prefersReducedMotion
  const vortexActive = showLive && inView

  // Start strip atlas + image decode as soon as this section mounts (often with the hero)
  useEffect(() => {
    prefetchVortexAtlas(8).catch(() => {})
  }, [])

  useEffect(() => {
    const node = previewRef.current
    if (!node) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      // Warm early — start animating GPU a screen before the stage is fully centered
      { threshold: 0.02, rootMargin: '50% 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!vortexActive) {
      artScrollState.enabled = false
      artScrollState.velocity = 0
      return undefined
    }
    artScrollState.enabled = true

    let touchY = null
    let samples = []

    const onWheel = (e) => {
      const node = previewRef.current
      if (!node) return
      const r = node.getBoundingClientRect()
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
        return
      }
      e.preventDefault()
      impulseScroll(e.deltaY, { deltaMode: e.deltaMode })
    }

    const onTouchStart = (e) => {
      const node = previewRef.current
      if (!node?.contains(e.target)) return
      const y = e.touches[0]?.clientY ?? null
      touchY = y
      samples = y == null ? [] : [{ y, t: performance.now() }]
    }

    const onTouchMove = (e) => {
      if (touchY == null) return
      e.preventDefault()
      const y = e.touches[0]?.clientY
      if (y == null) return
      impulseScroll((touchY - y) * 1.45)
      touchY = y
      samples.push({ y, t: performance.now() })
      if (samples.length > 6) samples.shift()
    }

    const onTouchEnd = () => {
      if (samples.length >= 2) {
        const a = samples[0]
        const b = samples[samples.length - 1]
        impulseFlick((a.y - b.y) / Math.max(1, b.t - a.t))
      }
      touchY = null
      samples = []
    }

    window.addEventListener('wheel', onWheel, { passive: false, capture: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true, capture: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false, capture: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true, capture: true })

    return () => {
      artScrollState.enabled = false
      artScrollState.velocity = 0
      window.removeEventListener('wheel', onWheel, { capture: true })
      window.removeEventListener('touchstart', onTouchStart, { capture: true })
      window.removeEventListener('touchmove', onTouchMove, { capture: true })
      window.removeEventListener('touchend', onTouchEnd, { capture: true })
    }
  }, [vortexActive])

  return (
    <section className="studio-section" aria-labelledby="drawing-vortex-title">
      <div className="studio-container">
        <div className="drawing-vortex-head">
          <p className="studio-eyebrow">Field</p>
          <h2 id="drawing-vortex-title" className="studio-title">
            Twin vortex
          </h2>
          <p className="studio-lede">
            Live WebGL warp of the same archive — scroll inside the frame, then open fullscreen for the
            full cylinder.
          </p>
        </div>

        <div
          ref={previewRef}
          className="drawing-vortex-stage relative mt-6 h-[min(78dvh,640px)] min-h-[300px] w-full overflow-hidden bg-black"
        >
          <VortexFallback dimmed={!vortexActive} />

          {showLive ? (
            <WebGLErrorBoundary fallback={null}>
              <div
                className={`absolute inset-0 z-[1] transition-opacity duration-500 ${
                  vortexActive ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <ArtCylinderCanvas
                  active={vortexActive}
                  mobileLite={isTouchLike}
                  onContextLost={() => setWebglOk(false)}
                />
              </div>
            </WebGLErrorBoundary>
          ) : null}

          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[38%] bg-[linear-gradient(to_top,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.2)_55%,transparent_100%)]"
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 z-[3] flex flex-col items-start p-4 sm:p-7">
            <p className="studio-eyebrow !text-white/75">Beyond Work — Drawing</p>
            <p className="mt-2 max-w-md text-[12px] leading-[18px] text-white/85">
              {vortexActive
                ? 'Live twin vortices. Enter immersive mode for full scroll warp.'
                : 'Vortex field preview. Enter immersive mode for the full experience.'}
            </p>
            <Link
              to="/beyond/art"
              className="studio-link pointer-events-auto mt-4 min-h-11 items-center !text-white hover:!text-white/70"
              data-cursor-hover="true"
              onMouseEnter={() => prefetchVortexAtlas(8).catch(() => {})}
              onFocus={() => prefetchVortexAtlas(8).catch(() => {})}
            >
              Enter immersive vortex →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TwinVortexSection
