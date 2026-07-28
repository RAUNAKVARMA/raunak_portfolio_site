import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ArtCylinderCanvas from './ArtCylinderCanvas'
import { artScrollState } from './artScrollState'
import WebGLErrorBoundary from '../../ui/WebGLErrorBoundary'
import { useReducedMotionProfile } from '../../../hooks/useReducedMotionProfile'

const SKETCH_TILES = [
  { label: 'Astro', image: '/images/art-vortex-astro.png' },
  { label: 'Velocity', image: '/images/art-vortex-lambo.png' },
  { label: 'Concept', image: '/images/art-vortex-concept.png' },
]

function VortexFallback({ className = '' }) {
  return (
    <div className={`absolute inset-0 ${className}`.trim()} aria-hidden>
      <img
        src="/images/art-vortex-astro.png"
        alt=""
        className="h-full w-full object-cover object-center"
        loading="eager"
        decoding="async"
      />
      <div className="absolute inset-0 bg-black/45" />
    </div>
  )
}

/**
 * Beyond art section — vortex preview that stays visible on phones
 * (image base layer + optional WebGL when the block is on screen).
 */
function ArtSection() {
  const previewRef = useRef(null)
  const [inView, setInView] = useState(false)
  const [webglOk, setWebglOk] = useState(true)
  const { prefersReducedMotion, isTouchLike } = useReducedMotionProfile()

  // Phones always get a visible image; WebGL enhances when allowed.
  const tryLiveVortex = inView && webglOk && !prefersReducedMotion

  useEffect(() => {
    const node = previewRef.current
    if (!node) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.05, rootMargin: '120px 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!tryLiveVortex) {
      artScrollState.enabled = false
      artScrollState.velocity = 0
      return undefined
    }

    artScrollState.enabled = true
    return () => {
      artScrollState.enabled = false
      artScrollState.velocity = 0
    }
  }, [tryLiveVortex])

  return (
    <section className="studio-section" aria-labelledby="art-section-title">
      <div className="studio-container">
        <p className="studio-eyebrow">Art</p>
        <h2 id="art-section-title" className="studio-title">
          Drawing
        </h2>
        <p className="studio-lede">
          Twin-vortex visual field — scroll-warped studies from space, machines, and graphite.
          Enter the full-screen experience when ready.
        </p>

        {/* Explicit height so absolute WebGL/image layers don't collapse on mobile */}
        <div
          ref={previewRef}
          className="relative mt-6 h-[min(70dvh,560px)] min-h-[280px] w-full overflow-hidden border border-[color:var(--studio-border-muted)] bg-black"
        >
          <VortexFallback />

          {tryLiveVortex && (
            <WebGLErrorBoundary fallback={null}>
              <div className="absolute inset-0 z-[1]">
                <ArtCylinderCanvas
                  active
                  mobileLite={isTouchLike}
                  onContextLost={() => setWebglOk(false)}
                />
              </div>
            </WebGLErrorBoundary>
          )}

          <div
            className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(to_top,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.25)_45%,rgba(0,0,0,0.35)_100%)]"
            aria-hidden
          />

          <div className="absolute inset-x-0 bottom-0 z-[3] flex flex-col items-start p-4 sm:p-7">
            <p className="studio-eyebrow !text-white/75">Beyond Work — Art</p>
            <p className="mt-2 max-w-md text-[12px] leading-[18px] text-white/85">
              {tryLiveVortex
                ? 'Live twin vortices. Open immersive mode for full scroll warp.'
                : 'Vortex field preview. Open immersive mode for the full experience.'}
            </p>
            <Link
              to="/beyond/art"
              className="studio-link pointer-events-auto mt-4 min-h-11 items-center !text-white hover:!text-white/70"
              data-cursor-hover="true"
            >
              Enter art experience →
            </Link>
          </div>
        </div>

        <h3 className="studio-eyebrow mt-10">Sketches &amp; studies</h3>
        <div className="studio-sketch-grid mt-4">
          {SKETCH_TILES.map((tile) => (
            <figure key={tile.label} className="studio-sketch">
              <img src={tile.image} alt={`${tile.label} sketch study`} loading="lazy" />
              <figcaption>{tile.label}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ArtSection
