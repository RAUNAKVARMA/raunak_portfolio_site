import { useEffect, useRef, useState } from 'react'
import ArtCylinderCanvas from '../art/ArtCylinderCanvas'
import { artScrollState, impulseFlick, impulseScroll } from '../art/artScrollState'
import WebGLErrorBoundary from '../../ui/WebGLErrorBoundary'
import { useReducedMotionProfile } from '../../../hooks/useReducedMotionProfile'
import { prefetchVortexAtlas, subscribeVortexAtlas } from '../../../lib/vortexAtlas'
import { drawingArtworks } from '../../../data/drawings'

function VortexFallback() {
  return (
    <div className="drawing-field-fallback" aria-hidden>
      <img
        src="/images/drawings/aurora-wolf.png"
        alt=""
        loading="eager"
        decoding="async"
        fetchpriority="high"
      />
    </div>
  )
}

/* Full-viewport twin vortex.
 * Gate pill: RAUNAK VARMA STUDIO → enter archive.
 */
function DrawingFieldExperience({
  title = 'Drawing',
  blurb,
  story = [],
  onOpenArchive,
  active = true,
}) {
  const stageRef = useRef(null)
  const [webglOk, setWebglOk] = useState(true)
  const [atlasReady, setAtlasReady] = useState(false)
  const [layer, setLayer] = useState('gate') // 'gate' | 'menu'
  const { prefersReducedMotion, isTouchLike } = useReducedMotionProfile()
  const showLive = webglOk && !prefersReducedMotion
  const vortexActive = showLive && active

  useEffect(() => {
    // Start bootstrap atlas on first paint — don't wait for idle
    prefetchVortexAtlas(8).catch(() => {})
    return subscribeVortexAtlas((atlas) => {
      if (atlas?.texture) setAtlasReady(true)
    })
  }, [])

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = '/images/drawings/aurora-wolf.png'
    link.fetchPriority = 'high'
    document.head.appendChild(link)
    return () => {
      try {
        document.head.removeChild(link)
      } catch {
        /* */
      }
    }
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
    let touchDrivesVortex = false

    const isOnStage = (clientX, clientY) => {
      const node = stageRef.current
      if (!node) return false
      const r = node.getBoundingClientRect()
      return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom
    }

    const isOverCards = (target) =>
      Boolean(target?.closest?.('.drawing-field-stack, .drawing-field-panel, .drawing-field-work, .drawing-field-gate'))

    const onWheel = (e) => {
      if (!isOnStage(e.clientX, e.clientY)) return
      // Over open cards / pill: let the card panel scroll natively
      if (isOverCards(e.target)) return
      e.preventDefault()
      e.stopPropagation()
      impulseScroll(e.deltaY, { deltaMode: e.deltaMode })
    }

    const onTouchStart = (e) => {
      const node = stageRef.current
      if (!node?.contains(e.target)) return
      if (isOverCards(e.target)) {
        touchDrivesVortex = false
        touchY = null
        samples = []
        return
      }
      touchDrivesVortex = true
      const y = e.touches[0]?.clientY ?? null
      touchY = y
      samples = y == null ? [] : [{ y, t: performance.now() }]
    }

    const onTouchMove = (e) => {
      if (!touchDrivesVortex || touchY == null) return
      e.preventDefault()
      const y = e.touches[0]?.clientY
      if (y == null) return
      impulseScroll((touchY - y) * 2.4)
      touchY = y
      samples.push({ y, t: performance.now() })
      if (samples.length > 6) samples.shift()
    }

    const onTouchEnd = () => {
      if (touchDrivesVortex && samples.length >= 2) {
        const a = samples[0]
        const b = samples[samples.length - 1]
        impulseFlick((a.y - b.y) / Math.max(1, b.t - a.t))
      }
      touchDrivesVortex = false
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

  const featured = drawingArtworks.filter((p) => p.featured).slice(0, 3)
  const storyLines =
    story?.length > 0
      ? story
      : [
          'I started drawing in first grade — self-taught, chasing shapes until they felt right.',
          'I love making sketches in my free time. Graphite, color, stillness — it is how I enjoy the world.',
        ]

  return (
    <div
      ref={stageRef}
      className={`drawing-field is-${layer}`}
      aria-label="Twin vortex field"
    >
      {/* Hide static underlay once the live twin is up — otherwise it reads as extra eyes */}
      {!atlasReady || !showLive ? <VortexFallback /> : null}

      {showLive ? (
        <WebGLErrorBoundary fallback={null}>
          <div className={`drawing-field-canvas${atlasReady ? ' is-live' : ''}`}>
            <ArtCylinderCanvas
              active={vortexActive}
              mobileLite={isTouchLike}
              onContextLost={() => setWebglOk(false)}
            />
          </div>
        </WebGLErrorBoundary>
      ) : null}

      <div className="drawing-field-veil" aria-hidden />

      <div className="drawing-field-hud">
        {layer === 'gate' ? (
          <button
            type="button"
            className="drawing-field-gate"
            data-cursor-hover="true"
            data-lenis-prevent
            onClick={onOpenArchive}
            aria-label="Raunak Varma Studio — enter archive"
          >
            <span className="drawing-field-gate-title">RAUNAK VARMA STUDIO</span>
            <span className="drawing-field-gate-eyebrow">enter archive</span>
          </button>
        ) : (
          <div className="drawing-field-stack" data-lenis-prevent>
            <article className="drawing-field-panel" aria-labelledby="drawing-field-info-title">
              <div className="drawing-field-panel-head">
                <span className="drawing-field-pill">Information</span>
                <button
                  type="button"
                  className="drawing-field-panel-close"
                  data-cursor-hover="true"
                  onClick={() => setLayer('gate')}
                  aria-label="Back to field"
                >
                  Close
                </button>
              </div>
              <p className="drawing-field-kicker">
                Interest 03 · {String(drawingArtworks.length).padStart(2, '0')} studies
              </p>
              <h2 id="drawing-field-info-title" className="drawing-field-title">
                {title}
              </h2>
              {blurb ? <p className="drawing-field-blurb">{blurb}</p> : null}
              <div className="drawing-field-bio">
                {storyLines.map((line) => (
                  <p key={line.slice(0, 24)}>{line}</p>
                ))}
              </div>
              <div className="drawing-field-meta-grid">
                <div>
                  <p className="drawing-field-meta-label">Practice</p>
                  <p className="drawing-field-meta-value">Self-taught · since first grade</p>
                </div>
                <div>
                  <p className="drawing-field-meta-label">Medium</p>
                  <p className="drawing-field-meta-value">Graphite · color · studies</p>
                </div>
                <div>
                  <p className="drawing-field-meta-label">When</p>
                  <p className="drawing-field-meta-value">Free time · for the joy of it</p>
                </div>
              </div>
            </article>

            <section className="drawing-field-work" aria-labelledby="drawing-field-work-title">
              <div className="drawing-field-work-head">
                <h3 id="drawing-field-work-title">Selected studies</h3>
                <span>{drawingArtworks.length} sheets</span>
              </div>

              <button
                type="button"
                className="drawing-field-archive-card"
                data-cursor-hover="true"
                onClick={onOpenArchive}
              >
                <span className="drawing-field-archive-card-media" aria-hidden>
                  {featured.map((piece) => (
                    <img key={piece.id} src={piece.src} alt="" />
                  ))}
                </span>
                <span className="drawing-field-archive-card-body">
                  <span className="drawing-field-archive-card-eyebrow">Archive</span>
                  <span className="drawing-field-archive-card-title">The Coil</span>
                  <span className="drawing-field-archive-card-note">
                    Open the river of studies — one sheet at a time through light.
                  </span>
                  <span className="drawing-field-archive-card-cta">Open archive →</span>
                </span>
              </button>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

export default DrawingFieldExperience
