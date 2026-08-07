import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { editingClips } from '../../../data/editingClips'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { useLenis } from '../../../providers/SmoothScrollProvider'

/** Orbit paths through depth — Felix Brady floating collage feel. */
const PATHS = [
  { x: -18, y: 8, rx: 8, ry: -6, w: 42 },
  { x: 22, y: -10, rx: 4, ry: 8, w: 28 },
  { x: 8, y: 18, rx: 12, ry: -2, w: 24 },
  { x: -8, y: -16, rx: 6, ry: 10, w: 34 },
  { x: 28, y: 12, rx: 10, ry: -8, w: 26 },
  { x: -26, y: -4, rx: 5, ry: 4, w: 30 },
  { x: 4, y: 4, rx: 14, ry: 0, w: 38 },
  { x: 16, y: -18, rx: 2, ry: -10, w: 22 },
  { x: -14, y: 16, rx: 9, ry: 6, w: 32 },
  { x: 32, y: 0, rx: 7, ry: -4, w: 24 },
  { x: -4, y: -8, rx: 11, ry: 3, w: 36 },
]

function clamp(n, a, b) {
  return Math.min(b, Math.max(a, n))
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

/**
 * Continuous depth gallery matching Felix Brady scroll world:
 * layered translucent frames fly toward the camera; click / › opens cinema.
 * @see https://graceful-lebkuchen-fac26a.netlify.app/
 */
function VideoEditingExperience() {
  useDocumentTitle('Video Editing')
  const navigate = useNavigate()
  const lenisRef = useLenis()
  const stageRef = useRef(null)
  const cinemaRef = useRef(null)
  const progressRef = useRef(0)
  const targetRef = useRef(0)
  const rafRef = useRef(0)

  const [mode, setMode] = useState('world') // world | cinema
  const [progress, setProgress] = useState(0)
  const [cinemaIndex, setCinemaIndex] = useState(0)
  const [muted, setMuted] = useState(true)
  const [infosOpen, setInfosOpen] = useState(false)
  const [isFs, setIsFs] = useState(false)

  const total = editingClips.length
  const spacing = 1 // progress units between clips
  const maxProgress = Math.max(0.001, (total - 1) * spacing)

  const focusIndex = useMemo(() => {
    const raw = progress / spacing
    return clamp(Math.round(raw), 0, total - 1)
  }, [progress, spacing, total])

  const focusClip = editingClips[focusIndex]
  const cinemaClip = editingClips[cinemaIndex]

  const openCinema = (index) => {
    setCinemaIndex(index)
    setMode('cinema')
    setInfosOpen(false)
  }

  const closeCinema = () => {
    if (document.fullscreenElement) document.exitFullscreen?.()
    setMode('world')
    setInfosOpen(false)
  }

  const stepCinema = useCallback(
    (dir) => {
      setCinemaIndex((i) => (i + dir + total) % total)
    },
    [total],
  )

  // Lock page scroll / Lenis while immersive
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    document.body.classList.add('editing-experience-active')
    try {
      lenisRef?.current?.stop()
    } catch {
      /* */
    }
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
      document.body.classList.remove('editing-experience-active')
      try {
        lenisRef?.current?.start()
      } catch {
        /* */
      }
      cancelAnimationFrame(rafRef.current)
    }
  }, [lenisRef])

  // Smooth lerp of scroll progress
  useEffect(() => {
    if (mode !== 'world') return undefined

    const tick = () => {
      const current = progressRef.current
      const target = targetRef.current
      const next = current + (target - current) * 0.085
      progressRef.current = next
      setProgress(next)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [mode])

  useEffect(() => {
    if (mode !== 'world') return undefined

    const onWheel = (e) => {
      e.preventDefault()
      const delta = e.deltaY * 0.0022
      targetRef.current = clamp(targetRef.current + delta, 0, maxProgress)
    }

    let touchY = null
    const onTouchStart = (e) => {
      touchY = e.touches[0]?.clientY ?? null
    }
    const onTouchMove = (e) => {
      if (touchY == null) return
      const y = e.touches[0]?.clientY
      if (y == null) return
      e.preventDefault()
      const delta = (touchY - y) * 0.008
      touchY = y
      targetRef.current = clamp(targetRef.current + delta, 0, maxProgress)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [mode, maxProgress])

  useEffect(() => {
    if (mode !== 'cinema') return undefined
    const el = cinemaRef.current
    if (!el) return undefined
    el.load()
    el.muted = muted
    const p = el.play()
    if (p?.catch) p.catch(() => {})
    return undefined
  }, [mode, cinemaIndex, muted])

  useEffect(() => {
    const onFs = () => setIsFs(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen?.()
          return
        }
        if (mode === 'cinema') {
          closeCinema()
          return
        }
        navigate('/beyond')
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        if (mode === 'cinema') stepCinema(1)
        else targetRef.current = clamp(targetRef.current + spacing, 0, maxProgress)
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        if (mode === 'cinema') stepCinema(-1)
        else targetRef.current = clamp(targetRef.current - spacing, 0, maxProgress)
      }
      if (mode === 'cinema' && (e.key === 'm' || e.key === 'M')) setMuted((v) => !v)
      if (e.key === 'i' || e.key === 'I') setInfosOpen((v) => !v)
      if (mode === 'world' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        openCinema(focusIndex)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [focusIndex, maxProgress, mode, navigate, spacing, stepCinema])

  const toggleFullscreen = async () => {
    const node = stageRef.current
    if (!node) return
    try {
      if (!document.fullscreenElement) await node.requestFullscreen?.()
      else await document.exitFullscreen?.()
    } catch {
      /* */
    }
  }

  const frames = editingClips.map((clip, i) => {
    const path = PATHS[i % PATHS.length]
    const depth = i * spacing - progress
    // depth 0 = focus plane; negative = past camera; positive = ahead
    const z = depth * -420
    const drift = depth * 28
    const visible = Math.abs(depth) < 2.35
    const near = 1 - clamp(Math.abs(depth) / 1.85, 0, 1)
    const opacity = smoothstep(0.05, 0.95, near) * (0.35 + near * 0.65)
    const scale = 0.72 + near * 0.38
    const blur = clamp((Math.abs(depth) - 0.35) * 4.5, 0, 10)

    return {
      clip,
      i,
      visible,
      near,
      opacity,
      blur,
      style: {
        width: `${path.w}vw`,
        maxWidth: '560px',
        opacity,
        filter: blur > 0.4 ? `blur(${blur}px)` : 'none',
        transform: `
          translate(-50%, -50%)
          translate3d(calc(${path.x}vw + ${drift * (path.x >= 0 ? 0.35 : -0.25)}px), calc(${path.y}vh + ${depth * 18}px), ${z}px)
          rotateX(${path.rx + depth * 4}deg)
          rotateY(${path.ry + depth * -3}deg)
          scale(${scale})
        `,
        zIndex: Math.round(1000 - Math.abs(depth) * 100),
      },
      isFocus: i === focusIndex,
    }
  })

  return (
    <div ref={stageRef} className={`felix-root${mode === 'cinema' ? ' is-cinema' : ''}`}>
      {mode === 'world' ? (
        <div className="felix-world">
          <header className="felix-chrome felix-chrome-top">
            <p className="felix-wordmark">Raunak</p>
            <div className="felix-chrome-right">
              <button
                type="button"
                className="felix-text-btn"
                data-cursor-hover="true"
                onClick={() => setInfosOpen((v) => !v)}
              >
                Infos
              </button>
              <Link to="/beyond" className="felix-text-btn" data-cursor-hover="true">
                Close
              </Link>
            </div>
          </header>

          {infosOpen ? (
            <aside className="felix-infos" aria-label="About these edits">
              <p>Scroll to move through the reel. Press › or click a frame to watch.</p>
            </aside>
          ) : null}

          <div className="felix-focus-meta" aria-live="polite">
            <span>Cut {String(focusIndex + 1).padStart(2, '0')}</span>
            <span className="felix-focus-gap">{focusClip?.title}</span>
            <span className="felix-focus-note">{focusClip?.note}</span>
          </div>

          <div className="felix-depth" aria-label="Editing depth gallery">
            {frames.map((frame) => {
              if (!frame.visible && !frame.isFocus) return null
              return (
                <button
                  key={frame.clip.id}
                  type="button"
                  className={`felix-card${frame.isFocus ? ' is-focus' : ''}`}
                  style={frame.style}
                  data-cursor-hover="true"
                  onClick={() => openCinema(frame.i)}
                  aria-label={`Open ${frame.clip.title}`}
                >
                  <video
                    src={frame.clip.src}
                    muted
                    loop
                    playsInline
                    autoPlay={frame.near > 0.25}
                    preload={frame.near > 0.15 ? 'auto' : 'metadata'}
                    aria-hidden
                  />
                  {frame.isFocus ? (
                    <span className="felix-play" aria-hidden>
                      ›
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>

          <div className="felix-chrome felix-chrome-bottom">
            <div className="felix-chrome-left">
              <button
                type="button"
                className="felix-text-btn"
                data-cursor-hover="true"
                onClick={() => {
                  targetRef.current = clamp(targetRef.current - spacing, 0, maxProgress)
                }}
              >
                Prev
              </button>
              <button
                type="button"
                className="felix-text-btn"
                data-cursor-hover="true"
                onClick={() => {
                  targetRef.current = clamp(targetRef.current + spacing, 0, maxProgress)
                }}
              >
                Next
              </button>
            </div>
            <button
              type="button"
              className="felix-text-btn"
              data-cursor-hover="true"
              onClick={() => openCinema(focusIndex)}
            >
              Watch
            </button>
          </div>
        </div>
      ) : null}

      {mode === 'cinema' && cinemaClip ? (
        <div className="felix-cinema">
          <video
            key={cinemaClip.id}
            ref={cinemaRef}
            className="felix-cinema-video"
            src={cinemaClip.src}
            playsInline
            loop
            muted={muted}
            autoPlay
            preload="auto"
            aria-label={cinemaClip.title}
          />

          <header className="felix-chrome felix-chrome-top">
            <p className="felix-wordmark">Raunak</p>
            <div className="felix-chrome-right">
              <button
                type="button"
                className="felix-text-btn"
                data-cursor-hover="true"
                aria-expanded={infosOpen}
                onClick={() => setInfosOpen((v) => !v)}
              >
                Infos
              </button>
              <button type="button" className="felix-text-btn" data-cursor-hover="true" onClick={closeCinema}>
                Close
              </button>
            </div>
          </header>

          {infosOpen ? (
            <aside className="felix-infos felix-infos-cinema" aria-label="Cut info">
              <p className="felix-infos-title">
                {cinemaClip.title}
                {cinemaClip.note ? `   ${cinemaClip.note}` : ''}
              </p>
            </aside>
          ) : null}

          <div className="felix-chrome felix-chrome-bottom">
            <div className="felix-chrome-left">
              <button type="button" className="felix-text-btn" data-cursor-hover="true" onClick={() => stepCinema(-1)}>
                Prev
              </button>
              <button type="button" className="felix-text-btn" data-cursor-hover="true" onClick={() => stepCinema(1)}>
                Next
              </button>
            </div>
            <div className="felix-chrome-right">
              <button
                type="button"
                className="felix-text-btn"
                data-cursor-hover="true"
                onClick={() => setMuted((v) => !v)}
              >
                {muted ? 'Unmute' : 'Mute'}
              </button>
              <button type="button" className="felix-text-btn" data-cursor-hover="true" onClick={toggleFullscreen}>
                {isFs ? 'Minimize' : 'Fullscreen'}
              </button>
            </div>
          </div>

          <button type="button" className="felix-hit felix-hit-left" aria-label="Previous cut" onClick={() => stepCinema(-1)} />
          <button type="button" className="felix-hit felix-hit-right" aria-label="Next cut" onClick={() => stepCinema(1)} />
        </div>
      ) : null}
    </div>
  )
}

export default VideoEditingExperience
