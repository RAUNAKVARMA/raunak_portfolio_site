import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float, useTexture } from '@react-three/drei'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import { drawingArtworks } from '../../../data/drawings'
import { useReducedMotionProfile } from '../../../hooks/useReducedMotionProfile'
import { useLenis } from '../../../providers/SmoothScrollProvider'
import WebGLErrorBoundary from '../../ui/WebGLErrorBoundary'
import DrawingHelixCanvas from './DrawingHelixCanvas'

function clamp(n, a, b) {
  return Math.min(b, Math.max(a, n))
}

function InspectPlane({ src, pointer }) {
  const texture = useTexture(src)
  const mesh = useRef(null)
  const target = useRef({ x: 0, y: 0 })

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8
    texture.needsUpdate = true
  }, [texture])

  const aspect =
    texture.image?.width && texture.image?.height
      ? texture.image.width / texture.image.height
      : 0.75
  const h = 2.45
  const w = h * aspect

  useFrame((_, dt) => {
    if (!mesh.current) return
    target.current.x += (pointer.current.x * 0.4 - target.current.x) * Math.min(1, dt * 7)
    target.current.y += (pointer.current.y * 0.28 - target.current.y) * Math.min(1, dt * 7)
    mesh.current.rotation.y = target.current.x
    mesh.current.rotation.x = -target.current.y
  })

  return (
    <Float speed={1.05} rotationIntensity={0.06} floatIntensity={0.18}>
      <mesh ref={mesh}>
        <planeGeometry args={[w, h, 1, 1]} />
        <meshPhysicalMaterial
          map={texture}
          roughness={0.65}
          metalness={0.04}
          clearcoat={0.22}
          clearcoatRoughness={0.5}
          toneMapped
        />
      </mesh>
    </Float>
  )
}

function DrawingInspectCanvas({ src, active, mobileLite, onContextLost }) {
  const pointer = useRef({ x: 0, y: 0 })
  if (!active || !src) return null

  return (
    <Canvas
      className="drawing-inspect-canvas"
      dpr={mobileLite ? 1.25 : 1.5}
      camera={{ position: [0, 0.12, 4.05], fov: 34, near: 0.1, far: 40 }}
      gl={{ antialias: !mobileLite, alpha: true, powerPreference: 'high-performance' }}
      onPointerMove={(e) => {
        pointer.current = {
          x: (e.clientX / window.innerWidth) * 2 - 1,
          y: (e.clientY / window.innerHeight) * 2 - 1,
        }
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0)
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.08
        gl.domElement.addEventListener('webglcontextlost', () => onContextLost?.(), { once: true })
      }}
    >
      <ambientLight intensity={0.48} />
      <directionalLight position={[3.2, 4.2, 2.8]} intensity={1.4} />
      <directionalLight position={[-2.8, 1.2, -2]} intensity={0.38} color="#c4c8d8" />
      <Suspense fallback={null}>
        <InspectPlane src={src} pointer={pointer} />
        {!mobileLite ? <Environment preset="warehouse" /> : null}
      </Suspense>
    </Canvas>
  )
}

/**
 * Full-viewport Coil — progress driven by local wheel/touch (not page sticky scroll).
 */
function DrawingArchiveExperience() {
  const { prefersReducedMotion, isTouchLike } = useReducedMotionProfile()
  const lenisRef = useLenis()
  const stageRef = useRef(null)
  const progressRef = useRef(0)
  const velocityRef = useRef(0)
  const focusRef = useRef(0)
  const progressFillRef = useRef(null)
  const progressLabelRef = useRef(null)
  const metaTitleRef = useRef(null)
  const metaNoteRef = useRef(null)
  const metaIndexRef = useRef(null)
  const watermarkRef = useRef(null)
  const flowWashRef = useRef(null)
  const metaBlockRef = useRef(null)
  const dotRefs = useRef(new Map())
  const onProgressRef = useRef(null)
  const rafRef = useRef(0)

  const [mode, setMode] = useState('world')
  const [inspectIndex, setInspectIndex] = useState(0)
  const [webglOk, setWebglOk] = useState(true)

  const total = drawingArtworks.length
  const maxProgress = Math.max(0.001, total - 1)

  const inspectPiece = drawingArtworks[inspectIndex]
  const seedPiece = drawingArtworks[0]

  const scrollToProgress = useCallback(
    (p) => {
      progressRef.current = clamp(p, 0, maxProgress)
      velocityRef.current = 0
    },
    [maxProgress],
  )

  const openInspect = useCallback((index) => {
    setInspectIndex(index)
    setMode('inspect')
  }, [])

  const closeInspect = useCallback(() => setMode('world'), [])

  const stepWorld = useCallback(
    (dir) => scrollToProgress(Math.round(focusRef.current) + dir),
    [scrollToProgress],
  )

  const stepInspect = useCallback(
    (dir) => setInspectIndex((i) => clamp(i + dir, 0, total - 1)),
    [total],
  )

  onProgressRef.current = (progress, focus, flow = 0, colors) => {
    const pct = clamp(progress / maxProgress, 0, 1)
    const stage = stageRef.current
    if (stage && colors) {
      stage.style.setProperty('--coil-a', colors.a)
      stage.style.setProperty('--coil-b', colors.b)
      stage.style.setProperty('--coil-flow', String(flow))
    }
    if (progressFillRef.current) {
      progressFillRef.current.style.strokeDashoffset = String((1 - pct) * 144.5)
      progressFillRef.current.style.stroke = colors?.a || '#2EC4B6'
    }
    if (progressLabelRef.current) {
      progressLabelRef.current.textContent = String(Math.round(pct * 100)).padStart(2, '0')
    }
    if (flowWashRef.current) {
      flowWashRef.current.style.opacity = String(0.2 + flow * 0.55)
    }

    const nextFocus = clamp(focus, 0, total - 1)
    if (nextFocus !== focusRef.current) {
      focusRef.current = nextFocus
      const piece = drawingArtworks[nextFocus]
      if (!piece) return

      if (watermarkRef.current) {
        watermarkRef.current.textContent = String(nextFocus + 1).padStart(2, '0')
        watermarkRef.current.classList.remove('is-pulse')
        void watermarkRef.current.offsetWidth
        watermarkRef.current.classList.add('is-pulse')
      }
      if (metaBlockRef.current) {
        metaBlockRef.current.classList.remove('is-swap')
        void metaBlockRef.current.offsetWidth
        metaBlockRef.current.classList.add('is-swap')
      }
      if (metaIndexRef.current) {
        metaIndexRef.current.textContent = `${String(nextFocus + 1).padStart(2, '0')}  —  ${String(total).padStart(2, '0')}`
      }
      if (metaTitleRef.current) metaTitleRef.current.textContent = piece.title
      if (metaNoteRef.current) metaNoteRef.current.textContent = piece.note ?? ''
      drawingArtworks.forEach((p, i) => {
        const dot = dotRefs.current.get(p.id)
        if (dot) {
          const active = i === nextFocus
          dot.classList.toggle('is-active', active)
          if (active && piece.accent) {
            dot.style.background = piece.accent
            dot.style.boxShadow = `0 0 14px ${piece.accent}`
          } else {
            dot.style.background = ''
            dot.style.boxShadow = ''
          }
        }
      })
    }
  }

  useEffect(() => {
    drawingArtworks.forEach((piece) => {
      const img = new Image()
      img.decoding = 'async'
      img.src = piece.src
    })
  }, [])

  // Pause document Lenis — Coil owns the wheel
  useEffect(() => {
    const lenis = lenisRef?.current
    try {
      lenis?.stop?.()
    } catch {
      /* */
    }
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      try {
        lenis?.start?.()
      } catch {
        /* */
      }
    }
  }, [lenisRef])

  // Inertia integrator for local scroll progress
  useEffect(() => {
    if (mode !== 'world') return undefined

    let last = performance.now()
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      let v = velocityRef.current
      if (Math.abs(v) > 0.0001) {
        progressRef.current = clamp(progressRef.current + v * dt, 0, maxProgress)
        v *= Math.pow(0.92, dt * 60)
        if (Math.abs(v) < 0.002) v = 0
        velocityRef.current = v
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [mode, maxProgress])

  // Local wheel / touch → Coil progress
  useEffect(() => {
    if (mode !== 'world') return undefined

    let touchY = null
    let samples = []

    const onWheel = (e) => {
      const node = stageRef.current
      if (!node) return
      const r = node.getBoundingClientRect()
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
        return
      }
      e.preventDefault()
      e.stopPropagation()

      let dy = e.deltaY
      if (e.deltaMode === 1) dy *= 16
      if (e.deltaMode === 2) dy *= 320

      // Positive scroll → later studies
      const boost = (dy / 420) * 2.8
      velocityRef.current = clamp(velocityRef.current + boost, -18, 18)
      progressRef.current = clamp(progressRef.current + boost * 0.35, 0, maxProgress)
    }

    const onTouchStart = (e) => {
      const node = stageRef.current
      if (!node?.contains(e.target)) return
      if (e.target?.closest?.('button, a, [role="navigation"]')) {
        touchY = null
        return
      }
      const y = e.touches[0]?.clientY ?? null
      touchY = y
      samples = y == null ? [] : [{ y, t: performance.now() }]
    }

    const onTouchMove = (e) => {
      if (touchY == null) return
      e.preventDefault()
      const y = e.touches[0]?.clientY
      if (y == null) return
      const dy = touchY - y
      const boost = (dy / 280) * 2.2
      velocityRef.current = clamp(velocityRef.current + boost, -18, 18)
      progressRef.current = clamp(progressRef.current + boost * 0.45, 0, maxProgress)
      touchY = y
      samples.push({ y, t: performance.now() })
      if (samples.length > 6) samples.shift()
    }

    const onTouchEnd = () => {
      if (samples.length >= 2) {
        const a = samples[0]
        const b = samples[samples.length - 1]
        const v = ((a.y - b.y) / Math.max(1, b.t - a.t)) * 3.4
        velocityRef.current = clamp(velocityRef.current + v, -18, 18)
      }
      touchY = null
      samples = []
    }

    window.addEventListener('wheel', onWheel, { passive: false, capture: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true, capture: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false, capture: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true, capture: true })

    return () => {
      window.removeEventListener('wheel', onWheel, { capture: true })
      window.removeEventListener('touchstart', onTouchStart, { capture: true })
      window.removeEventListener('touchmove', onTouchMove, { capture: true })
      window.removeEventListener('touchend', onTouchEnd, { capture: true })
    }
  }, [mode, maxProgress])

  useEffect(() => {
    if (mode !== 'inspect') return undefined
    document.body.classList.add('drawing-inspect-active')
    return () => document.body.classList.remove('drawing-inspect-active')
  }, [mode])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && mode === 'inspect') {
        e.preventDefault()
        closeInspect()
        return
      }
      if (mode === 'inspect') {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault()
          stepInspect(1)
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault()
          stepInspect(-1)
        }
        return
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        stepWorld(1)
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        stepWorld(-1)
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        openInspect(focusRef.current)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode, closeInspect, openInspect, stepInspect, stepWorld])

  if (prefersReducedMotion) {
    return (
      <div className="drawing-gallery" role="list">
        {drawingArtworks.map((piece, index) => (
          <figure
            key={piece.id}
            role="listitem"
            className={`drawing-tile${piece.featured ? ' is-featured' : ''}`}
          >
            <span className="drawing-tile-media">
              <img
                src={piece.src}
                alt={piece.title}
                loading={index < 2 ? 'eager' : 'lazy'}
                decoding="async"
              />
            </span>
            <figcaption className="drawing-tile-meta">
              <span className="drawing-tile-index">{String(index + 1).padStart(2, '0')}</span>
              <span className="drawing-tile-title">{piece.title}</span>
              {piece.note ? <span className="drawing-tile-note">{piece.note}</span> : null}
            </figcaption>
          </figure>
        ))}
      </div>
    )
  }

  const helixActive = mode === 'world' && webglOk

  return (
    <div className={`drawing-spiral-track drawing-spiral-track-local is-entered`}>
      <div
        ref={stageRef}
        className={`drawing-archive drawing-spiral drawing-spiral-sticky${mode === 'inspect' ? ' is-inspect' : ''}${isTouchLike ? ' is-touch' : ''}`}
      >
        {mode === 'world' ? (
          <>
            <div className="drawing-helix-stage">
              {webglOk ? (
                <WebGLErrorBoundary
                  fallback={
                    <img className="drawing-helix-fallback" src={seedPiece?.src} alt="" />
                  }
                >
                  <DrawingHelixCanvas
                    progressRef={progressRef}
                    maxProgress={maxProgress}
                    active={helixActive}
                    mobileLite={isTouchLike}
                    onContextLost={() => setWebglOk(false)}
                    onSelect={(index) => openInspect(index)}
                    onProgress={(progress, focus, flow, colors) =>
                      onProgressRef.current?.(progress, focus, flow, colors)
                    }
                  />
                </WebGLErrorBoundary>
              ) : (
                <img className="drawing-helix-fallback" src={seedPiece?.src} alt="" />
              )}
            </div>

            <div className="drawing-spiral-atmosphere drawing-spiral-atmosphere-lite" aria-hidden>
              <div ref={flowWashRef} className="drawing-spiral-flow-wash" />
              <div className="drawing-spiral-plinth" />
              <div className="drawing-spiral-vignette" />
              <div className="drawing-spiral-frame">
                <span className="drawing-spiral-corner is-tl" />
                <span className="drawing-spiral-corner is-tr" />
                <span className="drawing-spiral-corner is-bl" />
                <span className="drawing-spiral-corner is-br" />
              </div>
              <p className="drawing-spiral-watermark" ref={watermarkRef}>
                01
              </p>
            </div>

            <div className="drawing-archive-spine" aria-hidden>
              <span>The Coil</span>
              <span className="drawing-archive-spine-rule" />
              <span>Studies</span>
            </div>

            <div className="drawing-archive-chrome">
              <div className="drawing-archive-brand">
                <span className="drawing-archive-monogram" aria-hidden>
                  C
                </span>
                <p className="drawing-archive-seal">The Coil</p>
              </div>
              <div className="drawing-spiral-meter" aria-hidden>
                <svg viewBox="0 0 56 56" className="drawing-spiral-meter-svg">
                  <circle cx="28" cy="28" r="23" className="drawing-spiral-meter-track" />
                  <circle
                    ref={progressFillRef}
                    cx="28"
                    cy="28"
                    r="23"
                    className="drawing-spiral-meter-fill"
                    style={{ strokeDasharray: 144.5, strokeDashoffset: 144.5 }}
                  />
                </svg>
                <span ref={progressLabelRef}>00</span>
              </div>
            </div>

            <div
              ref={metaBlockRef}
              className="drawing-archive-meta drawing-archive-meta-iconic"
              aria-live="polite"
            >
              <span className="drawing-archive-kicker">Study</span>
              <span className="drawing-archive-index" ref={metaIndexRef}>
                01  —  {String(total).padStart(2, '0')}
              </span>
              <h3 className="drawing-archive-title" ref={metaTitleRef}>
                {seedPiece?.title}
              </h3>
              <span className="drawing-archive-note" ref={metaNoteRef}>
                {seedPiece?.note ?? ''}
              </span>
              <button
                type="button"
                className="drawing-archive-open"
                data-cursor-hover="true"
                onClick={() => openInspect(focusRef.current)}
              >
                Inspect
              </button>
            </div>

            <p className="drawing-archive-scrollcue" aria-hidden>
              Scroll the river
            </p>

            <div className="drawing-archive-rail" role="navigation" aria-label="Jump to piece">
              {drawingArtworks.map((piece, i) => (
                <button
                  key={`dot-${piece.id}`}
                  type="button"
                  className={`drawing-archive-dot${i === 0 ? ' is-active' : ''}`}
                  ref={(el) => {
                    if (el) dotRefs.current.set(piece.id, el)
                    else dotRefs.current.delete(piece.id)
                  }}
                  aria-label={`Go to ${piece.title}`}
                  data-cursor-hover="true"
                  onClick={() => scrollToProgress(i)}
                />
              ))}
            </div>
          </>
        ) : (
          <motion.div
            className="drawing-inspect"
            role="dialog"
            aria-modal="true"
            aria-label={inspectPiece?.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.28 }}
          >
            <header className="drawing-inspect-chrome">
              <button
                type="button"
                className="drawing-inspect-back"
                data-cursor-hover="true"
                onClick={closeInspect}
              >
                ← Back
              </button>
              <div className="drawing-inspect-meta">
                <p className="drawing-inspect-index">
                  Study {String(inspectIndex + 1).padStart(2, '0')}
                </p>
                <h3 className="drawing-inspect-title">{inspectPiece?.title}</h3>
                {inspectPiece?.note ? <p className="drawing-inspect-note">{inspectPiece.note}</p> : null}
              </div>
              <div className="drawing-inspect-nav">
                <button
                  type="button"
                  className="drawing-inspect-step"
                  data-cursor-hover="true"
                  disabled={inspectIndex <= 0}
                  onClick={() => stepInspect(-1)}
                >
                  Prev
                </button>
                <button
                  type="button"
                  className="drawing-inspect-step"
                  data-cursor-hover="true"
                  disabled={inspectIndex >= total - 1}
                  onClick={() => stepInspect(1)}
                >
                  Next
                </button>
              </div>
            </header>
            <div className="drawing-inspect-stage">
              <WebGLErrorBoundary
                fallback={
                  <img className="drawing-inspect-fallback" src={inspectPiece?.src} alt={inspectPiece?.title} />
                }
              >
                <DrawingInspectCanvas
                  src={inspectPiece?.src}
                  active={mode === 'inspect'}
                  mobileLite={isTouchLike}
                  onContextLost={() => setWebglOk(false)}
                />
              </WebGLErrorBoundary>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default DrawingArchiveExperience
