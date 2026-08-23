import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { gsap, registerGsap, ScrollTrigger } from '../../lib/gsap.client'
import { useLenis } from '../../providers/SmoothScrollProvider'
import { lazyWithRetry } from '../../lib/lazyWithRetry'
import { createRigState } from './aboutHeroLayout'
import { releaseAboutScrollLock, withTimeout } from './aboutHeroScrollLock'
import { ABOUT_PIN_START, aboutPinEnd } from './aboutScrollConfig'
import { scheduleScrollRefresh } from './scheduleScrollRefresh'

const AboutLetterCanvas = lazyWithRetry(() => import('./AboutLetterCanvas'))

function AboutHero({ lines, reducedMotion = false }) {
  const lenisRef = useLenis()
  const sceneRef = useRef(null)
  const panelRef = useRef(null)
  const portraitRef = useRef(null)
  const shieldRef = useRef(null)
  const pillRef = useRef(null)
  const copyRef = useRef(null)
  const rigRef = useRef(createRigState())
  const portraitMotion = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })

  const lineNodes = useMemo(
    () =>
      lines.map((line, lineIndex) => ({
        line,
        chars: [...line].map((ch, charIndex) => ({ ch, charIndex })),
      })),
    [lines],
  )

  useEffect(() => {
    const panel = panelRef.current
    if (!panel || reducedMotion) return undefined

    const onMove = (event) => {
      const rect = panel.getBoundingClientRect()
      rigRef.current.mouseTarget.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      rigRef.current.mouseTarget.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
      portraitMotion.current.targetX = rigRef.current.mouseTarget.x
      portraitMotion.current.targetY = rigRef.current.mouseTarget.y
    }

    panel.addEventListener('pointermove', onMove, { passive: true })

    let rafId
    const tick = () => {
      const m = portraitMotion.current
      const scroll = rigRef.current?.scroll ?? 0
      m.x += (m.targetX - m.x) * 0.1
      m.y += (m.targetY - m.y) * 0.1

      const topPct = 76 - scroll * 34 * (0.55 + scroll * 0.45)
      const scale = 0.52 + scroll * 0.48
      const parallax = 1 - scroll * 0.65

      if (portraitRef.current) {
        portraitRef.current.style.top = `${topPct}%`
        portraitRef.current.style.transform = `translate(-50%, -50%) translate3d(${m.x * 12 * parallax}px, ${m.y * 8 * parallax}px, ${m.x * 18 * parallax}px) rotateX(${m.y * -2.2 * parallax}deg) rotateY(${m.x * 3 * parallax}deg) scale(${scale})`
      }
      if (shieldRef.current) {
        shieldRef.current.style.top = `${topPct}%`
        shieldRef.current.style.transform = `translate(-50%, -50%) scale(${scale * 0.86})`
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    return () => {
      panel.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(rafId)
    }
  }, [reducedMotion])

  useLayoutEffect(() => {
    const scene = sceneRef.current
    const panel = panelRef.current
    const copy = copyRef.current
    if (!scene || !panel) return undefined

    if (reducedMotion) {
      if (copy) copy.style.opacity = '1'
      copy?.querySelectorAll('.about-hero__char').forEach((el) => {
        el.style.opacity = '1'
      })
      if (pillRef.current) pillRef.current.style.opacity = '1'
      return undefined
    }

    registerGsap()

    const curtain = panel.querySelector('.about-hero__curtain')
    const meta = panel.querySelectorAll('.about-hero__meta')
    const hint = panel.querySelector('.about-hero__scroll-hint')
    const portrait = portraitRef.current
    const portraitImg = portrait?.querySelector('img')

    gsap.set(curtain, { opacity: 1 })
    gsap.set(meta, { opacity: 0, y: 10 })
    gsap.set(hint, { opacity: 0 })
    if (copy) gsap.set(copy, { opacity: 1, y: 0 })
    copy?.querySelectorAll('.about-hero__char').forEach((el) => {
      gsap.set(el, { opacity: 0 })
    })
    if (pillRef.current) gsap.set(pillRef.current, { opacity: 0, y: 22 })
    if (portrait) {
      gsap.set(portrait, { opacity: 1, top: '76%', left: '50%', xPercent: -50, yPercent: -50 })
    }
    if (portraitImg) {
      gsap.set(portraitImg, { scale: 1, filter: 'blur(0px) grayscale(1) contrast(1.1)' })
    }

    Object.assign(rigRef.current, createRigState())

    let ctx
    let cancelled = false

    const buildScroll = () => {
      if (cancelled) return

      ctx?.revert()
      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: scene,
            scroller: document.documentElement,
            start: ABOUT_PIN_START,
            end: aboutPinEnd(480),
            pin: panel,
            pinSpacing: true,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })

        tl.to(curtain, { opacity: 0, duration: 0.1, ease: 'power2.out' }, 0)

        tl.fromTo(
          rigRef.current,
          { scrollTarget: 0 },
          { scrollTarget: 1, duration: 1, ease: 'none' },
          0,
        )

        tl.to(meta, { opacity: 1, y: 0, duration: 0.14, stagger: 0.05, ease: 'power2.out' }, 0.06)
        tl.to(hint, { opacity: 0.52, duration: 0.12, ease: 'power2.out' }, 0.14)
        tl.to(hint, { opacity: 0, duration: 0.1, ease: 'power2.in' }, 0.28)

        if (pillRef.current) {
          tl.to(pillRef.current, { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' }, 0.82)
        }
      }, scene)

      scheduleScrollRefresh()
    }

    requestAnimationFrame(() => buildScroll())

    const runIntro = () => {
      if (cancelled) return
      gsap.to(curtain, { opacity: 0, duration: 0.45, ease: 'power2.out' })
      gsap.to(meta, { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: 'power2.out', delay: 0.08 })
      gsap.to(hint, { opacity: 0.48, duration: 0.3, ease: 'power2.out', delay: 0.2 })
      gsap.fromTo(
        rigRef.current,
        { introTarget: 0, watermarkTarget: 0 },
        { introTarget: 1, watermarkTarget: 1, duration: 1.35, ease: 'power2.inOut', delay: 0.12 },
      )
      scheduleScrollRefresh()
    }

    Promise.all([
      withTimeout(document.fonts?.ready, 280),
      withTimeout(
        portraitImg?.complete ? Promise.resolve() : portraitImg?.decode?.().catch(() => undefined),
        280,
      ),
    ])
      .catch(() => undefined)
      .then(runIntro)

    document.fonts?.ready?.then(() => scheduleScrollRefresh())

    return () => {
      cancelled = true
      ctx?.revert()
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === scene) st.kill()
      })
      releaseAboutScrollLock(lenisRef)
      Object.assign(rigRef.current, createRigState())
    }
  }, [lines, reducedMotion, lenisRef])

  useEffect(() => {
    const hint = panelRef.current?.querySelector('.about-hero__scroll-hint')
    if (!hint || reducedMotion) return undefined

    const pulse = gsap.to(hint, {
      y: 8,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })

    return () => pulse.kill()
  }, [reducedMotion])

  return (
    <div className="about-hero-scene" ref={sceneRef}>
      <section className="about-hero-scene__panel" ref={panelRef} aria-labelledby="about-hero-heading">
        <div className="about-hero__curtain" aria-hidden="true" />
        <div className="about-hero__grain" aria-hidden="true" />
        <div className="about-hero__portrait-shield" ref={shieldRef} aria-hidden="true" />

        <p className="about-hero__meta about-hero__kicker">( about. )</p>
        <p className="about-hero__meta about-hero__index">[ N.002 ]</p>

        {!reducedMotion ? (
          <Suspense fallback={null}>
            <AboutLetterCanvas lines={lines} rigRef={rigRef} copyRef={copyRef} />
          </Suspense>
        ) : null}

        <div className="about-hero__portrait-wrap" ref={portraitRef}>
          <figure className="about-hero__portrait">
            <img
              src="/images/raunak-portrait-professional.png"
              alt="Raunak Varma — AI engineer and researcher"
              width="480"
              height="640"
              fetchpriority="high"
              decoding="async"
            />
          </figure>
        </div>

        <div className="about-hero__copy" ref={copyRef}>
          <h1 id="about-hero-heading" className="about-hero__headline">
            {lineNodes.map(({ line, chars }, lineIndex) => (
              <span key={line} className="about-hero__line">
                {chars.map(({ ch, charIndex }) => (
                  <span
                    key={`${line}-${charIndex}`}
                    className="about-hero__char"
                    data-line={lineIndex}
                    data-char={charIndex}
                  >
                    {ch === ' ' ? '\u00a0' : ch}
                  </span>
                ))}
              </span>
            ))}
          </h1>
          <a className="about-hero__pill" href="#about-story" ref={pillRef} data-cursor-hover="true">
            About me
          </a>
        </div>

        <p className="about-hero__scroll-hint" aria-hidden="true">
          <span className="about-hero__scroll-line" />
          Scroll
        </p>
      </section>
    </div>
  )
}

export default AboutHero
