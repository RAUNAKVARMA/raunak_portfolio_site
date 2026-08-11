import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { editingClips } from '../../../data/editingClips'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { useIsMobileOrTouch } from '../../../hooks/useIsMobileOrTouch'
import { useLenis } from '../../../providers/SmoothScrollProvider'

const PATHS_DESKTOP = [
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

/** Same gallery language, frames kept on-phone. */
const PATHS_MOBILE = [
  { x: 0, y: 2, rx: 6, ry: -2, w: 86 },
  { x: -10, y: -6, rx: 4, ry: 4, w: 72 },
  { x: 10, y: 8, rx: 8, ry: -3, w: 70 },
  { x: -6, y: 10, rx: 5, ry: 3, w: 76 },
  { x: 8, y: -8, rx: 7, ry: -4, w: 68 },
]

function clamp(n, a, b) {
  return Math.min(b, Math.max(a, n))
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

function VideoEditingExperience() {
  useDocumentTitle('Video Editing')
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const lenisRef = useLenis()
  const isMobile = useIsMobileOrTouch()

  const stageRef = useRef(null)
  const cinemaRef = useRef(null)
  const progressRef = useRef(0)
  const targetRef = useRef(0)
  const rafRef = useRef(0)
  const touchRef = useRef({ y: null, x: null, moved: false })
  const modeRef = useRef('world')
  const closingCinemaRef = useRef(false)

  const [mode, setMode] = useState('world')
  const [progress, setProgress] = useState(0)
  const [cinemaIndex, setCinemaIndex] = useState(0)
  const [muted, setMuted] = useState(true)
  const [infosOpen, setInfosOpen] = useState(false)
  const [isFs, setIsFs] = useState(false)
  const [fsSupported, setFsSupported] = useState(true)
  const [postersReady, setPostersReady] = useState(false)

  const total = editingClips.length
  const spacing = 1
  const maxProgress = Math.max(0.001, (total - 1) * spacing)
  const paths = isMobile ? PATHS_MOBILE : PATHS_DESKTOP

  modeRef.current = mode

  // Warm the browser cache so swipe-mounted cards paint instantly
  useEffect(() => {
    let cancelled = false
    const links = []
    const preloadFirst = editingClips.slice(0, 4)
    preloadFirst.forEach((clip) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = clip.poster
      document.head.appendChild(link)
      links.push(link)
    })

    Promise.all(
      editingClips.map(
        (clip) =>
          new Promise((resolve) => {
            const img = new Image()
            img.decoding = 'async'
            img.onload = () => resolve()
            img.onerror = () => resolve()
            img.src = clip.poster
          }),
      ),
    ).then(() => {
      if (!cancelled) setPostersReady(true)
    })

    return () => {
      cancelled = true
      links.forEach((link) => link.remove())
    }
  }, [])

  const focusIndex = useMemo(() => {
    return clamp(Math.round(progress / spacing), 0, total - 1)
  }, [progress, spacing, total])

  const focusClip = editingClips[focusIndex]
  const cinemaClip = editingClips[cinemaIndex]

  const exitCinemaChrome = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.()
    if (document.webkitFullscreenElement) document.webkitExitFullscreen?.()
    setMode('world')
    setInfosOpen(false)
  }, [])

  const openCinema = useCallback(
    (index) => {
      const next = clamp(index, 0, total - 1)
      setCinemaIndex(next)
      setMode('cinema')
      setInfosOpen(false)
      touchRef.current.moved = false
      // History entry so phone/browser Back returns to the reel, not Beyond
      setSearchParams({ watch: String(next) }, { replace: false })
    },
    [setSearchParams, total],
  )

  const closeCinema = useCallback(() => {
    exitCinemaChrome()
    if (searchParams.has('watch')) {
      closingCinemaRef.current = true
      navigate(-1)
      return
    }
    setSearchParams({}, { replace: true })
  }, [exitCinemaChrome, navigate, searchParams, setSearchParams])

  // Sync cinema ↔ URL (phone Back / forward / shareable ?watch=)
  useEffect(() => {
    const raw = searchParams.get('watch')
    if (raw == null) {
      closingCinemaRef.current = false
      if (modeRef.current === 'cinema') exitCinemaChrome()
      return
    }
    if (closingCinemaRef.current) return
    const index = clamp(Number.parseInt(raw, 10) || 0, 0, total - 1)
    setCinemaIndex(index)
    setMode('cinema')
  }, [searchParams, total, exitCinemaChrome])

  const stepCinema = useCallback(
    (dir) => {
      setCinemaIndex((i) => {
        const next = (i + dir + total) % total
        setSearchParams({ watch: String(next) }, { replace: true })
        return next
      })
    },
    [setSearchParams, total],
  )

  const stepWorld = useCallback(
    (dir) => {
      targetRef.current = clamp(targetRef.current + dir * spacing, 0, maxProgress)
    },
    [maxProgress, spacing],
  )

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

  useEffect(() => {
    setFsSupported(
      Boolean(document.fullscreenEnabled || document.webkitFullscreenEnabled),
    )
  }, [])

  useEffect(() => {
    if (mode !== 'world') return undefined
    const tick = () => {
      const next = progressRef.current + (targetRef.current - progressRef.current) * (isMobile ? 0.12 : 0.085)
      progressRef.current = next
      setProgress(next)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [mode, isMobile])

  useEffect(() => {
    if (mode !== 'world') return undefined

    const onWheel = (e) => {
      e.preventDefault()
      targetRef.current = clamp(targetRef.current + e.deltaY * 0.0022, 0, maxProgress)
    }

    const onTouchStart = (e) => {
      const t = e.touches[0]
      if (!t) return
      touchRef.current = { y: t.clientY, x: t.clientX, moved: false }
    }

    const onTouchMove = (e) => {
      const start = touchRef.current
      const t = e.touches[0]
      if (start.y == null || !t) return
      const dy = start.y - t.clientY
      const dx = Math.abs(t.clientX - (start.x ?? t.clientX))
      if (Math.abs(dy) > 8 || dx > 8) touchRef.current.moved = true
      if (Math.abs(dy) >= dx) {
        e.preventDefault()
        targetRef.current = clamp(targetRef.current + dy * (isMobile ? 0.014 : 0.008), 0, maxProgress)
        touchRef.current.y = t.clientY
        touchRef.current.x = t.clientX
      }
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [mode, maxProgress, isMobile])

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
    const onFs = () =>
      setIsFs(Boolean(document.fullscreenElement || document.webkitFullscreenElement))
    document.addEventListener('fullscreenchange', onFs)
    document.addEventListener('webkitfullscreenchange', onFs)
    return () => {
      document.removeEventListener('fullscreenchange', onFs)
      document.removeEventListener('webkitfullscreenchange', onFs)
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement || document.webkitFullscreenElement) {
          document.exitFullscreen?.()
          document.webkitExitFullscreen?.()
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
        else stepWorld(1)
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        if (mode === 'cinema') stepCinema(-1)
        else stepWorld(-1)
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
  }, [focusIndex, mode, navigate, stepCinema, stepWorld])

  const toggleFullscreen = async () => {
    const node = stageRef.current
    const video = cinemaRef.current
    if (!node) return
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        await (document.exitFullscreen?.() || document.webkitExitFullscreen?.())
        return
      }
      if (node.requestFullscreen) {
        await node.requestFullscreen()
        return
      }
      if (video?.webkitEnterFullscreen) video.webkitEnterFullscreen()
    } catch {
      /* */
    }
  }

  const zScale = isMobile ? 280 : 420
  // Keep a few neighbors mounted so posters never flash-load mid-swipe
  const visibleWindow = isMobile ? 2.4 : 2.35

  const frames = editingClips.map((clip, i) => {
    const path = paths[i % paths.length]
    const depth = i * spacing - progress
    const z = depth * -zScale
    const drift = depth * (isMobile ? 14 : 28)
    const visible = Math.abs(depth) < visibleWindow
    const near = 1 - clamp(Math.abs(depth) / (isMobile ? 1.45 : 1.85), 0, 1)
    const opacity = smoothstep(0.05, 0.95, near) * (0.4 + near * 0.6)
    const scale = (isMobile ? 0.82 : 0.72) + near * (isMobile ? 0.28 : 0.38)
    const blur = isMobile ? 0 : clamp((Math.abs(depth) - 0.35) * 4.5, 0, 10)
    const rx = isMobile ? path.rx * 0.45 : path.rx
    const ry = isMobile ? path.ry * 0.45 : path.ry

    return {
      clip,
      i,
      visible,
      near,
      style: {
        width: `${path.w}vw`,
        maxWidth: isMobile ? '92vw' : '560px',
        opacity,
        filter: blur > 0.4 ? `blur(${blur}px)` : 'none',
        transform: `
          translate(-50%, -50%)
          translate3d(calc(${path.x}vw + ${drift * (path.x >= 0 ? 0.25 : -0.2)}px), calc(${path.y}vh + ${depth * (isMobile ? 10 : 18)}px), ${z}px)
          rotateX(${rx + depth * (isMobile ? 2 : 4)}deg)
          rotateY(${ry + depth * (isMobile ? -1.5 : -3)}deg)
          scale(${scale})
        `,
        zIndex: Math.round(1000 - Math.abs(depth) * 100),
      },
      isFocus: i === focusIndex,
    }
  })

  return (
    <div
      ref={stageRef}
      className={`felix-root${mode === 'cinema' ? ' is-cinema' : ''}${isMobile ? ' is-mobile' : ''}${postersReady ? ' posters-ready' : ''}`}
    >
      {/* Always in DOM — caches every thumb so cards paint from memory */}
      <div className="felix-poster-cache" aria-hidden>
        {editingClips.map((clip) => (
          <img key={`cache-${clip.id}`} src={clip.poster} alt="" decoding="async" />
        ))}
      </div>
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
              <p>
                {isMobile
                  ? 'Swipe up / down to move through the reel. Tap a frame to watch.'
                  : 'Scroll to move through the reel. Press › or click a frame to watch.'}
              </p>
            </aside>
          ) : null}

          <div className="felix-focus-meta" aria-live="polite">
            <span>Cut {String(focusIndex + 1).padStart(2, '0')}</span>
            <span className="felix-focus-gap">{focusClip?.title}</span>
            <span className="felix-focus-note">{focusClip?.note}</span>
          </div>

          <div className="felix-depth" aria-label="Editing depth gallery">
            {frames.map((frame) => {
              // Mobile keeps every card mounted so posters never remount mid-swipe
              if (!isMobile && !frame.visible && !frame.isFocus) return null
              // Phone: posters only in the reel (live video in cinema). Desktop: soft-play near cards.
              const shouldPlay = !isMobile && frame.near > 0.25
              return (
                <button
                  key={frame.clip.id}
                  type="button"
                  className={`felix-card${frame.isFocus ? ' is-focus' : ''}`}
                  style={frame.style}
                  data-cursor-hover="true"
                  onClick={() => {
                    if (touchRef.current.moved) {
                      touchRef.current.moved = false
                      return
                    }
                    openCinema(frame.i)
                  }}
                  aria-label={`Open ${frame.clip.title}`}
                >
                  <span className="felix-card-media" aria-hidden>
                    <img
                      className="felix-card-poster"
                      src={frame.clip.poster}
                      alt=""
                      draggable={false}
                      loading="eager"
                      decoding={frame.isFocus || Math.abs(frame.i - focusIndex) <= 1 ? 'sync' : 'async'}
                      fetchPriority={frame.isFocus || Math.abs(frame.i - focusIndex) <= 1 ? 'high' : 'low'}
                    />
                    {shouldPlay ? (
                      <video
                        key={`${frame.clip.id}-live`}
                        className="felix-card-video"
                        src={frame.clip.src}
                        poster={frame.clip.poster}
                        muted
                        loop
                        playsInline
                        autoPlay
                        preload="metadata"
                        controls={false}
                        controlsList="nodownload nofullscreen noremoteplayback"
                        disablePictureInPicture
                        disableRemotePlayback
                        onPlaying={(e) => e.currentTarget.classList.add('is-ready')}
                        onLoadedData={(e) => e.currentTarget.classList.add('is-ready')}
                        ref={(el) => {
                          if (!el) return
                          el.muted = true
                          el.defaultMuted = true
                          el.playsInline = true
                          el.setAttribute('playsinline', '')
                          el.setAttribute('webkit-playsinline', '')
                          el.setAttribute('muted', '')
                          const kick = () => {
                            el.muted = true
                            const p = el.play()
                            if (p?.catch) p.catch(() => {})
                          }
                          el.addEventListener('loadeddata', kick, { once: true })
                          kick()
                        }}
                      />
                    ) : null}
                  </span>
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
              <button type="button" className="felix-text-btn" data-cursor-hover="true" onClick={() => stepWorld(-1)}>
                Prev
              </button>
              <button type="button" className="felix-text-btn" data-cursor-hover="true" onClick={() => stepWorld(1)}>
                Next
              </button>
            </div>
            <button
              type="button"
              className="felix-text-btn felix-text-btn-strong"
              data-cursor-hover="true"
              onClick={() => openCinema(focusIndex)}
            >
              Watch
            </button>
          </div>

          {isMobile ? (
            <p className="felix-mobile-hint" aria-hidden>
              Swipe to browse · Tap to play
            </p>
          ) : null}
        </div>
      ) : null}

      {mode === 'cinema' && cinemaClip ? (
        <div className="felix-cinema">
          <video
            key={cinemaClip.id}
            ref={cinemaRef}
            className="felix-cinema-video"
            src={cinemaClip.src}
            poster={cinemaClip.poster}
            playsInline
            loop
            muted={muted}
            autoPlay
            preload="auto"
            controls={false}
            controlsList="nodownload nofullscreen noremoteplayback"
            disablePictureInPicture
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
                Back
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
              {fsSupported || cinemaRef.current?.webkitEnterFullscreen ? (
                <button type="button" className="felix-text-btn" data-cursor-hover="true" onClick={toggleFullscreen}>
                  {isFs ? 'Minimize' : 'Fullscreen'}
                </button>
              ) : null}
            </div>
          </div>

          {isMobile ? (
            <div
              className="felix-cinema-swipe"
              onTouchStart={(e) => {
                touchRef.current = {
                  y: e.touches[0]?.clientY ?? null,
                  x: e.touches[0]?.clientX ?? null,
                  moved: false,
                }
              }}
              onTouchEnd={(e) => {
                const startX = touchRef.current.x
                const endX = e.changedTouches[0]?.clientX
                if (startX == null || endX == null) return
                const dx = endX - startX
                if (Math.abs(dx) < 48) return
                stepCinema(dx < 0 ? 1 : -1)
              }}
              aria-hidden
            />
          ) : (
            <>
              <button
                type="button"
                className="felix-hit felix-hit-left"
                aria-label="Previous cut"
                onClick={() => stepCinema(-1)}
              />
              <button
                type="button"
                className="felix-hit felix-hit-right"
                aria-label="Next cut"
                onClick={() => stepCinema(1)}
              />
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default VideoEditingExperience
