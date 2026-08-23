import { useLayoutEffect, useRef, useState } from 'react'
import { gsap, registerGsap } from '../../lib/gsap.client'
import { useReducedMotionProfile } from '../../hooks/useReducedMotionProfile'
import { useAboutCardTilt } from './useAboutCardTilt'
import { setHangProgress, setStoryPinActive, triggerLandingPulse } from './aboutWebStore'
import { refreshAboutScroll } from './aboutScrollMount'

const columns = [
  {
    index: '01',
    title: 'My identity',
    body: 'I study B.Tech Computer Science at Manipal University Jaipur (2023–2027). Jaipur is where I train — in labs, papers, and systems that have to ship.',
    dropRot: -7,
    dropX: -24,
    depth: 0.94,
  },
  {
    index: '02',
    title: 'My growth',
    body: 'Research came first: Springer and IEEE. Then product: co-founding Rauran Charge under Atal Incubation Centre. Now I build enterprise ML as an AI intern at EY in Gurgaon.',
    dropRot: 0,
    dropX: 0,
    depth: 1,
  },
  {
    index: '03',
    title: 'My practice',
    body: 'I specialize in LLMs, RAG pipelines, and multi-agent systems. A Certified Project Manager from BITSOM — research, internships, and startups as one practice.',
    dropRot: 7,
    dropX: 24,
    depth: 0.94,
  },
]

/** Center card first, then left, then right */
const DROP_ORDER = [1, 0, 2]

const STORY = {
  pinStart: 'top 75%',
  pinEnd: '+=160%',
  dropLead: 0.08,
  dropStagger: 0.22,
  dropDuration: 0.7,
}

const CINEMATIC_MQ = '(min-width: 901px)'

function useCinematicStory() {
  const [cinematic, setCinematic] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(CINEMATIC_MQ).matches : true,
  )

  useLayoutEffect(() => {
    const media = window.matchMedia(CINEMATIC_MQ)
    const update = () => setCinematic(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return cinematic
}

function settleDrop(drop, cardIndex, { clearInlineTransform = true } = {}) {
  if (!drop) return
  drop.classList.add('about-net-card__drop--ready', 'about-net-card__drop--settled')
  drop.classList.remove('about-net-card__drop--falling')
  drop.style.removeProperty('--drop-trail')
  drop.style.removeProperty('--drop-speed')
  drop.style.setProperty('--hang-p', '1')
  if (clearInlineTransform) {
    drop.style.transform = 'none'
  }
  drop.querySelector('.about-net-card')?.classList.add('about-net-card--landed')
  setHangProgress(`story-card-${cardIndex}`, 1)
}

function StoryCard({ col, nodeId, index, tiltEnabled }) {
  const tilt = useAboutCardTilt(tiltEnabled ? 5 : 0)

  return (
    <article className="about-net-card-wrap" style={{ '--card-index': index }}>
      <div
        className="about-net-card__drop about-net-card__drop--ready"
        data-about-node={nodeId}
        data-about-node-x="0.5"
        data-about-node-y="0"
        data-about-tether="true"
        style={{
          '--card-depth': col.depth,
          '--hang-rot': `${col.dropRot * 0.06}deg`,
        }}
      >
        <span className="about-net-card__trail" aria-hidden="true" />
        <span className="about-net-card__tether-glow" aria-hidden="true" />
        <div className="about-net-card__sway">
          <div
            ref={tilt.ref}
            data-cursor-hover={tiltEnabled ? 'true' : undefined}
            className="about-stage__card about-net-card"
            onPointerMove={tiltEnabled ? tilt.onMove : undefined}
            onPointerLeave={tiltEnabled ? tilt.onLeave : undefined}
            onPointerDown={tiltEnabled ? tilt.onDown : undefined}
            onPointerUp={tiltEnabled ? tilt.onUp : undefined}
          >
            <span className="about-net-card__scrim" aria-hidden="true" />
            <span className="about-net-card__edge" aria-hidden="true" />
            <span className="about-net-card__sheen" aria-hidden="true" />
            <span className="about-net-card__pin" aria-hidden="true" />
            <span className="about-stage__card-index" aria-hidden="true">
              {col.index}
            </span>
            <span className="about-net-card__glow" aria-hidden="true" />
            <h3>{col.title}</h3>
            <p className="about-stage__card-body">{col.body}</p>
          </div>
        </div>
      </div>
    </article>
  )
}

function AboutStoryStage() {
  const rootRef = useRef(null)
  const hubRef = useRef(null)
  const { prefersReducedMotion, enableGsapScrub } = useReducedMotionProfile()
  const isCinematicLayout = useCinematicStory()
  const runCinematic = isCinematicLayout && enableGsapScrub && !prefersReducedMotion

  useLayoutEffect(() => {
    const root = rootRef.current
    const hub = hubRef.current
    const flowEl = root?.querySelector('.about-stage__flow--story')
    if (!root || !hub || !flowEl) return undefined

    const drops = [...root.querySelectorAll('.about-net-card__drop')]
    root.classList.toggle('about-stage--story-cinematic', runCinematic)
    root.classList.toggle('about-stage--story-static', !runCinematic)

    const settleAll = ({ clearInlineTransform = true } = {}) => {
      hub.classList.add('about-stage__hub--active')
      drops.forEach((drop, i) => settleDrop(drop, i, { clearInlineTransform }))
    }

    // Phone / tablet / reduced-motion: readable stack, no pin, no off-screen hang.
    if (!runCinematic) {
      settleAll()
      setStoryPinActive(false)

      if (prefersReducedMotion || !enableGsapScrub) {
        refreshAboutScroll()
        return () => {
          setStoryPinActive(false)
          columns.forEach((_, i) => setHangProgress(`story-card-${i}`, 0))
        }
      }

      registerGsap()
      const ctx = gsap.context(() => {
        const headBits = root.querySelectorAll(
          '.about-stage__story-kicker, .about-stage__story-title, .about-stage__story-deck',
        )
        gsap.from(headBits, {
          y: 14,
          opacity: 0.35,
          duration: 0.45,
          stagger: 0.06,
          ease: 'power2.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: root,
            scroller: document.documentElement,
            start: 'top 85%',
            once: true,
          },
        })

        gsap.from(drops, {
          y: 18,
          opacity: 0.4,
          duration: 0.45,
          stagger: 0.07,
          ease: 'power2.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: root.querySelector('.about-stage__cards'),
            scroller: document.documentElement,
            start: 'top 90%',
            once: true,
          },
          onComplete() {
            drops.forEach((drop, i) => {
              gsap.set(drop, { clearProps: 'transform,opacity' })
              settleDrop(drop, i)
            })
          },
        })
      }, root)

      refreshAboutScroll()
      return () => {
        setStoryPinActive(false)
        columns.forEach((_, i) => setHangProgress(`story-card-${i}`, 0))
        ctx.revert()
      }
    }

    const cardHang = [0, 0, 0]
    const landed = [false, false, false]
    const dropY = -(Math.min(window.innerHeight * 0.82, 920))

    const applyCardHang = (cardIndex, progress) => {
      const p = Math.max(0, Math.min(1, progress))
      cardHang[cardIndex] = p
      setHangProgress(`story-card-${cardIndex}`, p)
      const drop = drops[cardIndex]
      if (!drop) return

      drop.style.setProperty('--hang-p', String(p))
      drop.style.setProperty('--drop-trail', String(Math.sin(p * Math.PI) * 0.9))
      drop.style.setProperty('--drop-speed', String(Math.abs(Math.cos(p * Math.PI * 0.85))))
      drop.classList.toggle('about-net-card__drop--falling', p > 0.02 && p < 0.98)
      drop.classList.toggle('about-net-card__drop--settled', p >= 0.98)
    }

    const syncHubState = () => {
      let anyLive = false
      columns.forEach((_, i) => {
        const p = cardHang[i]
        const drop = drops[i]
        if (p > 0.03 && p < 0.98) anyLive = true

        if (!landed[i] && p >= 0.93) {
          landed[i] = true
          triggerLandingPulse(`story-card-${i}`)
          drop?.querySelector('.about-net-card')?.classList.add('about-net-card--landed')
        } else if (landed[i] && p < 0.82) {
          landed[i] = false
          drop?.querySelector('.about-net-card')?.classList.remove('about-net-card--landed')
        }
      })
      hub.classList.toggle('about-stage__hub--live', anyLive)
      hub.classList.toggle('about-stage__hub--active', cardHang.some((p) => p > 0.04) || anyLive)
    }

    registerGsap()

    const resetCards = () => {
      landed.fill(false)
      cardHang.fill(0)
      hub.classList.remove('about-stage__hub--active', 'about-stage__hub--live')
      drops.forEach((drop, i) => {
        const col = columns[i]
        drop.classList.add('about-net-card__drop--ready')
        drop.classList.remove('about-net-card__drop--settled', 'about-net-card__drop--falling')
        drop.style.setProperty('--drop-trail', '0')
        drop.style.setProperty('--hang-p', '0')
        drop.style.setProperty('--drop-speed', '0')
        drop.style.removeProperty('transform')
        drop.querySelector('.about-net-card')?.classList.remove('about-net-card--landed')
        gsap.set(drop, {
          y: dropY,
          x: col.dropX * 1.1,
          rotation: col.dropRot * 1.4,
          opacity: 1,
          scale: 0.9 * col.depth,
          transformOrigin: '50% 0%',
          force3D: true,
        })
        setHangProgress(`story-card-${i}`, 0)
      })
    }

    resetCards()

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          scroller: document.documentElement,
          start: STORY.pinStart,
          end: STORY.pinEnd,
          scrub: 0.55,
          pin: flowEl,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onToggle: (self) => {
            setStoryPinActive(self.isActive)
            if (self.isActive) hub.classList.add('about-stage__hub--active')
          },
          onLeaveBack: (self) => {
            if (self.progress < 0.02) resetCards()
          },
          onUpdate: syncHubState,
        },
      })

      tl.fromTo(hub, { scale: 0.42, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.12, ease: 'power3.out' }, 0)
      tl.fromTo(
        root.querySelector('.about-stage__story-kicker'),
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.1, ease: 'power3.out' },
        0,
      )
      tl.fromTo(
        root.querySelector('.about-stage__story-title'),
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.12, ease: 'power3.out' },
        0.02,
      )
      tl.fromTo(
        root.querySelector('.about-stage__story-deck'),
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.1, ease: 'power2.out' },
        0.04,
      )

      DROP_ORDER.forEach((cardIndex, orderIndex) => {
        const drop = drops[cardIndex]
        const col = columns[cardIndex]
        if (!drop) return
        const at = STORY.dropLead + orderIndex * STORY.dropStagger

        tl.fromTo(
          drop,
          {
            y: dropY,
            x: col.dropX * 1.1,
            rotation: col.dropRot * 1.4,
            opacity: 1,
            scale: 0.9 * col.depth,
            transformOrigin: '50% 0%',
          },
          {
            y: 0,
            x: 0,
            rotation: col.dropRot * 0.06,
            scale: col.depth,
            duration: STORY.dropDuration,
            ease: 'back.out(1.28)',
            immediateRender: false,
            onUpdate() {
              applyCardHang(cardIndex, this.progress())
            },
            onComplete() {
              applyCardHang(cardIndex, 1)
              syncHubState()
            },
          },
          at,
        )
      })
    }, root)

    refreshAboutScroll()

    return () => {
      setStoryPinActive(false)
      hub.classList.remove('about-stage__hub--live', 'about-stage__hub--active')
      root.classList.remove('about-stage--story-cinematic', 'about-stage--story-static')
      columns.forEach((_, i) => setHangProgress(`story-card-${i}`, 0))
      ctx.revert()
    }
  }, [enableGsapScrub, prefersReducedMotion, runCinematic])

  return (
    <section id="about-story" ref={rootRef} className="about-stage about-stage--story" aria-labelledby="about-story-heading">
      <div className="about-stage__flow about-stage__flow--story">
        <p className="about-stage__story-ghost" aria-hidden="true">
          PROFILE
        </p>

        <div
          className="about-stage__story-head"
          data-about-node="story-head"
          data-about-node-x="0"
          data-about-node-y="0.85"
        >
          <p className="about-stage__story-kicker">Story arc</p>
          <h2 id="about-story-heading" className="about-stage__story-title">
            Three threads
            <span className="about-stage__story-accent"> of one practice.</span>
          </h2>
          <p className="about-stage__story-deck">
            Identity, growth, and the systems I build — from Jaipur labs to production ML.
          </p>
        </div>

        <div
          ref={hubRef}
          className="about-stage__hub"
          data-about-node="story-hub"
          data-about-node-x="0.5"
          data-about-node-y="0.5"
          aria-hidden="true"
        >
          <span className="about-stage__hub-core" />
          <span className="about-stage__hub-ring about-stage__hub-ring--outer" />
          <span className="about-stage__hub-ring about-stage__hub-ring--inner" />
          <span className="about-stage__hub-flare" />
        </div>

        <div className="about-stage__cards">
          {columns.map((col, i) => (
            <StoryCard
              key={col.title}
              col={col}
              index={i}
              nodeId={`story-card-${i}`}
              tiltEnabled={runCinematic}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default AboutStoryStage
