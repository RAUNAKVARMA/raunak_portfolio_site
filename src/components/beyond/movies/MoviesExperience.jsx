import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { RiArrowLeftLine } from 'react-icons/ri'
import { movies } from '../../../data/movies'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { useReducedMotionProfile } from '../../../hooks/useReducedMotionProfile'
import { useLenis } from '../../../providers/SmoothScrollProvider'
import { gsap, registerGsap, ScrollTrigger } from '../../../lib/gsap.client'
import MoviesPadCanvas from './MoviesPadCanvas'

const SCROLL_PER_FILM_DESKTOP = 1.75
const SCROLL_PER_FILM_TOUCH = 1.2
const ARC_STEP = 0.3
/** Desktop: creamier catch-up (Lenis already smooths the wheel) */
const POS_LAMBDA_DESKTOP = 5.2
/** Touch: lock tighter to finger so dual-lag doesn't feel laggy */
const POS_LAMBDA_TOUCH = 11.5
const LEAN_LAMBDA_DESKTOP = 3.4
const LEAN_LAMBDA_TOUCH = 6.2
const VELOCITY_LEAN = 4.2
const CULL_DISTANCE = 2.7

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function smoothstep(t) {
  const x = clamp(t, 0, 1)
  return x * x * (3 - 2 * x)
}

/**
 * Ciao gamme rail — hero in the light, neighbors still readable in the arc
 * (not crushed into silhouette / blur mud).
 */
function cardPose(index, activeFloat, cardW, velocity = 0, time = 0, settled = false, lite = false) {
  const d = index - activeFloat
  const angle = d * ARC_STEP
  const radius = Math.max(cardW * (lite ? 2.6 : 3.05), lite ? 440 : 580)
  const x = Math.sin(angle) * radius
  const z = (Math.cos(angle) - 1) * radius * (lite ? 1.0 : 1.18)
  const abs = Math.abs(d)
  const fall = smoothstep(abs / 2.2)
  const isHero = abs < 0.38
  const lean = clamp(velocity * VELOCITY_LEAN, -8, 8)
  const floatY = !lite && isHero && settled ? Math.sin(time * 0.75) * 4 : 0

  return {
    d,
    x,
    y: floatY + (isHero ? (lite ? -6 : -10) : fall * (lite ? 12 : 18)),
    z,
    rotY: clamp((-angle * 180) / Math.PI + lean * 0.28, -72, 72),
    rotX: isHero ? (lite ? -3 : -6) + lean * 0.05 : (lite ? 4 : 6) + fall * (lite ? 8 : 12),
    rotZ: lean * 0.1,
    scale: lerp(lite ? 1.22 : 1.32, lite ? 0.52 : 0.48, fall),
    opacity: lerp(1, lite ? 0.22 : 0.18, fall),
    zIndex: 160 - Math.round(abs * 20),
    isHero,
    shadeOpacity: isHero ? 0 : lerp(0.28, 0.78, fall),
    blur: 0,
    culled: abs > CULL_DISTANCE,
  }
}

function MoviesExperience() {
  useDocumentTitle('Movies')
  const trackRef = useRef(null)
  const stageRef = useRef(null)
  const chamberRef = useRef(null)
  const cardMeasureRef = useRef(null)
  const cardRefs = useRef([])
  const shadeRefs = useRef([])
  const posterUrlsRef = useRef([])
  const detailRef = useRef(null)
  const thumbRef = useRef(null)
  const progressRef = useRef(null)
  const cueRef = useRef(null)
  const reflectionRef = useRef(null)
  const scrollTriggerRef = useRef(null)
  const metricsRef = useRef({ cardW: 240 })
  const activeIndexRef = useRef(0)
  const targetProgressRef = useRef(0)
  const displayProgressRef = useRef(0)
  const leanVelRef = useRef(0)
  const lastChromeRef = useRef({ pct: -1, cue: null })
  const lastHeroSrcRef = useRef('')
  const timeRef = useRef(0)
  const rafRef = useRef(0)
  const dragRef = useRef({
    active: false,
    moved: false,
    axis: null,
    startX: 0,
    startY: 0,
    startProgress: 0,
    lastX: 0,
    lastT: 0,
    velocity: 0,
  })
  const suppressClickRef = useRef(false)
  const lenisRef = useLenis()

  const [activeIndex, setActiveIndex] = useState(0)
  const [spotAccent, setSpotAccent] = useState(movies[0]?.accent ?? '#5b9fd4')
  const { prefersReducedMotion, isTouchLike } = useReducedMotionProfile()

  const total = movies.length
  const active = movies[activeIndex] ?? movies[0]
  const lite = isTouchLike

  const applyCardPoses = useCallback(
    (activeFloat, leanVel = 0, time = 0, settled = false) => {
      const cardW = metricsRef.current.cardW
      let heroPoster = null

      for (let index = 0; index < movies.length; index += 1) {
        const card = cardRefs.current[index]
        if (!card) continue

        const pose = cardPose(index, activeFloat, cardW, leanVel, time, settled, lite)

        if (pose.culled) {
          if (card.style.visibility !== 'hidden') {
            card.style.visibility = 'hidden'
            card.style.opacity = '0'
            card.style.pointerEvents = 'none'
          }
          continue
        }

        if (card.style.visibility === 'hidden') card.style.visibility = 'visible'

        card.style.transform = `translate3d(-50%, -50%, 0) translate3d(${pose.x.toFixed(2)}px, ${pose.y.toFixed(2)}px, ${pose.z.toFixed(2)}px) rotateY(${pose.rotY.toFixed(2)}deg) rotateX(${pose.rotX.toFixed(2)}deg) rotateZ(${pose.rotZ.toFixed(2)}deg) scale(${pose.scale.toFixed(4)})`
        card.style.opacity = pose.opacity.toFixed(3)
        if (card.style.filter) card.style.filter = 'none'

        const nextZ = String(pose.zIndex)
        if (card.style.zIndex !== nextZ) card.style.zIndex = nextZ

        const wasHero = card.classList.contains('is-active')
        if (pose.isHero !== wasHero) {
          card.classList.toggle('is-active', pose.isHero)
          if (pose.isHero) card.setAttribute('aria-current', 'true')
          else card.removeAttribute('aria-current')
        }

        if (pose.isHero) {
          heroPoster = posterUrlsRef.current[index] || card.querySelector('img')?.currentSrc || null
        }

        const shade = shadeRefs.current[index]
        if (shade) shade.style.opacity = pose.shadeOpacity.toFixed(3)
      }

      if (!lite && reflectionRef.current && heroPoster && heroPoster !== lastHeroSrcRef.current) {
        lastHeroSrcRef.current = heroPoster
        reflectionRef.current.style.backgroundImage = `url("${heroPoster}")`
        reflectionRef.current.style.opacity = '1'
      }
    },
    [lite],
  )

  const syncChrome = useCallback(
    (progress) => {
      const nextIndex = clamp(Math.round(progress * Math.max(1, total - 1)), 0, total - 1)
      const progressPct = Math.round(progress * 100)
      const cueVisible = progress < 0.03
      const chrome = lastChromeRef.current

      if (thumbRef.current) {
        thumbRef.current.style.left = `${(progress * 100).toFixed(3)}%`
      }

      if (progressRef.current && chrome.pct !== progressPct) {
        chrome.pct = progressPct
        progressRef.current.textContent = `${String(progressPct).padStart(2, '0')}%`
      }

      if (cueRef.current && chrome.cue !== cueVisible) {
        chrome.cue = cueVisible
        cueRef.current.classList.toggle('is-visible', cueVisible)
      }

      if (nextIndex !== activeIndexRef.current) {
        activeIndexRef.current = nextIndex
        setActiveIndex(nextIndex)
        setSpotAccent(movies[nextIndex]?.accent ?? '#5b9fd4')
      }
    },
    [total],
  )

  const readMetrics = useCallback(() => {
    const card = cardMeasureRef.current
    if (!card) return null
    const shell = card.querySelector('.movies-card__shell')
    return { cardW: shell?.offsetWidth || card.offsetWidth }
  }, [])

  const scrollDistance = useCallback(() => {
    const perFilm = lite ? SCROLL_PER_FILM_TOUCH : SCROLL_PER_FILM_DESKTOP
    return Math.max(window.innerHeight * 1.05, (total - 1) * window.innerHeight * perFilm)
  }, [lite, total])

  const scrollToProgress = useCallback(
    (progress, duration = 1.85) => {
      const st = scrollTriggerRef.current
      if (!st) return
      const y = st.start + (st.end - st.start) * clamp(progress, 0, 1)
      const lenis = lenisRef?.current
      const touchDuration = prefersReducedMotion ? 0 : Math.min(duration, lite ? 0.85 : duration)
      if (lenis) {
        lenis.scrollTo(y, {
          duration: touchDuration,
          easing: (t) => 1 - (1 - t) ** 3,
        })
      } else {
        window.scrollTo({ top: y, behavior: prefersReducedMotion || lite ? 'auto' : 'smooth' })
        if (lite && !prefersReducedMotion) {
          // Native smooth can stutter with pin; animate progress locally instead
          targetProgressRef.current = clamp(progress, 0, 1)
        }
      }
    },
    [lenisRef, lite, prefersReducedMotion],
  )

  const scrollToIndex = useCallback(
    (index) => {
      if (total <= 1) return
      scrollToProgress(index / (total - 1), lite ? 0.9 : 1.9)
    },
    [lite, scrollToProgress, total],
  )

  /* Dual-lag smooth: position + trailing lean (tighter on touch) */
  useEffect(() => {
    if (prefersReducedMotion) {
      applyCardPoses(0, 0, 0, true)
      return undefined
    }

    let running = true
    let last = performance.now()
    const posLambda = lite ? POS_LAMBDA_TOUCH : POS_LAMBDA_DESKTOP
    const leanLambda = lite ? LEAN_LAMBDA_TOUCH : LEAN_LAMBDA_DESKTOP

    const tick = (now) => {
      if (!running) return
      const dt = Math.min(lite ? 0.033 : 0.048, (now - last) / 1000)
      last = now
      timeRef.current += dt

      const target = targetProgressRef.current
      const current = displayProgressRef.current
      const posAlpha = 1 - Math.exp(-posLambda * dt)
      const next = current + (target - current) * posAlpha
      const rawVel = dt > 0 ? (next - current) / dt : 0

      const leanAlpha = 1 - Math.exp(-leanLambda * dt)
      leanVelRef.current += (rawVel - leanVelRef.current) * leanAlpha

      displayProgressRef.current = Math.abs(target - next) < 0.00004 ? target : next

      const settled =
        Math.abs(target - displayProgressRef.current) < 0.0012 && Math.abs(leanVelRef.current) < 0.015
      const activeFloat = displayProgressRef.current * Math.max(1, total - 1)
      applyCardPoses(activeFloat, leanVelRef.current, timeRef.current, settled)
      syncChrome(displayProgressRef.current)

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      running = false
      cancelAnimationFrame(rafRef.current)
    }
  }, [applyCardPoses, lite, prefersReducedMotion, syncChrome, total])

  useEffect(() => {
    const next = readMetrics()
    if (next) {
      metricsRef.current = next
      applyCardPoses(0, 0, 0)
    }

    const onResize = () => {
      const m = readMetrics()
      if (m) {
        metricsRef.current = m
        applyCardPoses(displayProgressRef.current * Math.max(1, total - 1), 0, timeRef.current)
      }
      ScrollTrigger.refresh()
    }

    window.addEventListener('resize', onResize, { passive: true })
    window.addEventListener('orientationchange', onResize, { passive: true })
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [applyCardPoses, readMetrics, total])

  useEffect(() => {
    const track = trackRef.current
    const stage = stageRef.current
    if (!track || !stage) return undefined

    registerGsap()
    if (prefersReducedMotion) return undefined

    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: track,
        start: 'top top',
        end: () => `+=${scrollDistance()}`,
        pin: stage,
        pinSpacing: true,
        scrub: lite ? 0.35 : true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        scroller: document.documentElement,
        snap:
          total > 1
            ? {
                snapTo: 1 / (total - 1),
                duration: lite ? { min: 0.28, max: 0.62 } : { min: 0.7, max: 1.55 },
                delay: lite ? 0.04 : 0.18,
                ease: lite ? 'power2.out' : 'power3.inOut',
                inertia: false,
              }
            : false,
        onUpdate(self) {
          if (!dragRef.current.active) {
            targetProgressRef.current = self.progress
          }
        },
      })

      scrollTriggerRef.current = st
      targetProgressRef.current = st.progress
      displayProgressRef.current = st.progress
      ScrollTrigger.refresh()
    }, track)

    return () => {
      scrollTriggerRef.current = null
      ctx.revert()
    }
  }, [lite, prefersReducedMotion, scrollDistance, total])

  /* Drag / swipe the shelf — axis-locked so vertical scroll stays buttery */
  useEffect(() => {
    const chamber = chamberRef.current
    if (!chamber || prefersReducedMotion || total <= 1) return undefined

    const onPointerDown = (e) => {
      if (e.button !== 0) return
      if (e.target.closest('a, .movies-chevron, .movies-rail__tick, .movies-back')) return
      const now = performance.now()
      dragRef.current = {
        active: true,
        moved: false,
        axis: null,
        startX: e.clientX,
        startY: e.clientY,
        startProgress: targetProgressRef.current,
        lastX: e.clientX,
        lastT: now,
        velocity: 0,
      }
      chamber.setPointerCapture?.(e.pointerId)
    }

    const onPointerMove = (e) => {
      if (!dragRef.current.active) return
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY

      if (!dragRef.current.axis) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
        // Prefer vertical page scroll on phones unless the gesture is clearly horizontal
        dragRef.current.axis = Math.abs(dx) > Math.abs(dy) * (lite ? 1.15 : 1) ? 'x' : 'y'
        if (dragRef.current.axis === 'x') {
          chamber.classList.add('is-dragging')
          const lenis = lenisRef?.current
          lenis?.stop?.()
        }
      }

      if (dragRef.current.axis !== 'x') return

      e.preventDefault()
      dragRef.current.moved = true
      const now = performance.now()
      const dt = Math.max(1, now - dragRef.current.lastT)
      const frameDx = dragRef.current.lastX - e.clientX
      dragRef.current.velocity = frameDx / dt
      dragRef.current.lastX = e.clientX
      dragRef.current.lastT = now

      const sensitivity = window.innerWidth * (lite ? 0.58 : 0.72)
      const delta = (dragRef.current.startX - e.clientX) / sensitivity
      targetProgressRef.current = clamp(dragRef.current.startProgress + delta, 0, 1)
    }

    const onPointerUp = (e) => {
      if (!dragRef.current.active) return
      const moved = dragRef.current.moved
      const wasHorizontal = dragRef.current.axis === 'x'
      const flick = dragRef.current.velocity
      dragRef.current.active = false
      dragRef.current.moved = false
      dragRef.current.axis = null
      chamber.classList.remove('is-dragging')
      chamber.releasePointerCapture?.(e.pointerId)

      const lenis = lenisRef?.current
      lenis?.start?.()

      if (!wasHorizontal) return

      if (moved) suppressClickRef.current = true

      let progress = targetProgressRef.current
      if (lite && Math.abs(flick) > 0.45) {
        const step = 1 / Math.max(1, total - 1)
        progress = clamp(progress + Math.sign(flick) * step * 0.55, 0, 1)
      }
      const snapped = Math.round(progress * (total - 1)) / (total - 1)
      scrollToProgress(snapped, moved ? (lite ? 0.7 : 1.15) : lite ? 0.55 : 0.8)
    }

    chamber.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove, { passive: false })
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)

    return () => {
      chamber.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
    }
  }, [lenisRef, lite, prefersReducedMotion, scrollToProgress, total])

  useEffect(() => {
    const detail = detailRef.current
    if (!detail || prefersReducedMotion) return undefined

    registerGsap()
    const lines = detail.querySelectorAll('.movies-detail__line, .movies-title__line')
    const meta = detail.querySelector('.movies-detail__meta, .movies-title__meta')

    const ctx = gsap.context(() => {
      gsap.fromTo(
        [...lines, meta].filter(Boolean),
        { opacity: 0, y: lite ? 14 : 28 },
        {
          opacity: 1,
          y: 0,
          duration: lite ? 0.45 : 0.85,
          stagger: lite ? 0.04 : 0.07,
          ease: lite ? 'power3.out' : 'power4.out',
          overwrite: true,
        },
      )
    }, detail)

    return () => ctx.revert()
  }, [activeIndex, lite, prefersReducedMotion])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        scrollToIndex(Math.min(total - 1, activeIndex + 1))
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        scrollToIndex(Math.max(0, activeIndex - 1))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeIndex, scrollToIndex, total])

  useEffect(() => {
    document.documentElement.classList.add('movies-immersive')
    document.body.classList.add('movies-immersive')
    if (lite) {
      document.documentElement.classList.add('movies-touch')
      document.body.classList.add('movies-touch')
    }
    return () => {
      document.documentElement.classList.remove('movies-immersive', 'movies-touch')
      document.body.classList.remove('movies-immersive', 'movies-touch')
    }
  }, [lite])

  /* Shorter Lenis inertia on phones so scroll doesn't feel syrupy behind the cards */
  useEffect(() => {
    if (!lite || prefersReducedMotion) return undefined
    const lenis = lenisRef?.current
    if (!lenis?.options) return undefined

    const prevDuration = lenis.options.duration
    const prevTouch = lenis.options.touchMultiplier
    lenis.options.duration = 0.8
    lenis.options.touchMultiplier = 1.2

    return () => {
      lenis.options.duration = prevDuration
      lenis.options.touchMultiplier = prevTouch
    }
  }, [lenisRef, lite, prefersReducedMotion])

  return (
    <div
      className={`movies-scroll-track${lite ? ' is-touch' : ''}`}
      ref={trackRef}
      style={{
        '--spot-accent': spotAccent,
        minHeight: `${Math.max(total, 2) * 100}svh`,
      }}
    >
      <div className="movies-stage" ref={stageRef}>
        <div className="movies-void" aria-hidden />
        <div className="movies-void movies-void--accent" aria-hidden />
        <div className="movies-horizon" aria-hidden />
        <div className="movies-fog" aria-hidden />

        <div className="movies-hud" aria-hidden>
          <span className="movies-hud__corner movies-hud__corner--tl" />
          <span className="movies-hud__corner movies-hud__corner--tr" />
          <span className="movies-hud__corner movies-hud__corner--bl" />
          <span className="movies-hud__corner movies-hud__corner--br" />
        </div>

        <Link to="/beyond" className="movies-back" data-cursor-hover="true">
          <RiArrowLeftLine aria-hidden />
          <span>Beyond</span>
        </Link>

        <p className="movies-progress" ref={progressRef} aria-hidden>
          00%
        </p>

        <div className="movies-chamber" ref={chamberRef}>
          <div className="movies-ring movies-ring--top">
            <p className="movies-brand">Film Shelf</p>
            <MoviesPadCanvas placement="top" lite={lite} />
            <div className="movies-beam" aria-hidden />
          </div>

          <div className="movies-shelf">
            <div className="movies-shelf-viewport">
              {movies.map((film, index) => (
                <button
                  key={film.id}
                  type="button"
                  ref={(node) => {
                    cardRefs.current[index] = node
                    if (index === 0) cardMeasureRef.current = node
                    posterUrlsRef.current[index] = film.poster
                  }}
                  className="movies-card"
                  style={{ '--movie-accent': film.accent }}
                  data-cursor-hover="true"
                  aria-label={`${film.title}, ${film.year}`}
                  onClick={(e) => {
                    if (suppressClickRef.current) {
                      e.preventDefault()
                      suppressClickRef.current = false
                      return
                    }
                    scrollToIndex(index)
                  }}
                >
                  <span className="movies-card__shell">
                    <span className="movies-card__glow" aria-hidden />
                    <span className="movies-card__poster">
                      <img
                        src={film.poster}
                        alt=""
                        draggable={false}
                        loading={index < (lite ? 4 : 3) ? 'eager' : 'lazy'}
                        decoding="async"
                        fetchPriority={index === 0 ? 'high' : 'auto'}
                      />
                      <span className="movies-card__sheen" />
                      <span
                        className="movies-card__shade"
                        ref={(node) => {
                          shadeRefs.current[index] = node
                        }}
                        aria-hidden
                      />
                    </span>
                  </span>
                </button>
              ))}
            </div>

            {!lite ? <div className="movies-reflection" ref={reflectionRef} aria-hidden /> : null}
            <div className="movies-shelf-vignette" aria-hidden />

            <button
              type="button"
              className="movies-chevron movies-chevron--prev"
              data-cursor-hover="true"
              aria-label="Previous film"
              disabled={activeIndex <= 0}
              onClick={() => scrollToIndex(activeIndex - 1)}
            >
              <span className="movies-chevron__dots" aria-hidden />
            </button>
            <button
              type="button"
              className="movies-chevron movies-chevron--next"
              data-cursor-hover="true"
              aria-label="Next film"
              disabled={activeIndex >= total - 1}
              onClick={() => scrollToIndex(activeIndex + 1)}
            >
              <span className="movies-chevron__dots" aria-hidden />
            </button>
          </div>

          <div className="movies-title" aria-live="polite">
            <div className="movies-title__inner" ref={detailRef} key={active.id}>
              <h2 className="movies-title__split">
                <span className="movies-title__line">{active.line1}</span>
                {active.line2 ? (
                  <span className="movies-title__line">{active.line2}</span>
                ) : null}
              </h2>
              <p className="movies-title__meta">
                <span>{active.year}</span>
                <span aria-hidden>·</span>
                <span>{active.director}</span>
              </p>
            </div>
          </div>

          <div className="movies-ring movies-ring--bottom">
            <MoviesPadCanvas placement="bottom" lite={lite} />
          </div>
        </div>

        <div className="movies-rail">
          <div className="movies-rail__bar" aria-hidden>
            <span className="movies-rail__glow" />
            <span className="movies-rail__track" />
            {movies.map((film, index) => (
              <button
                key={film.id}
                type="button"
                className={`movies-rail__tick${index === activeIndex ? ' is-active' : ''}`}
                style={{ left: `${total > 1 ? (index / (total - 1)) * 100 : 0}%` }}
                aria-label={`Go to ${film.title}`}
                onClick={() => scrollToIndex(index)}
              />
            ))}
            <span className="movies-rail__thumb" ref={thumbRef} style={{ left: '0%' }} />
          </div>
          <p className="movies-rail__cue" ref={cueRef}>
            {lite ? 'Swipe to discover' : 'Scroll to discover'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default MoviesExperience
