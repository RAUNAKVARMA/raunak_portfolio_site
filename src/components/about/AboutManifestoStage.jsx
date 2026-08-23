import { useLayoutEffect, useMemo, useRef } from 'react'
import { gsap, registerGsap } from '../../lib/gsap.client'
import { useReducedMotionProfile } from '../../hooks/useReducedMotionProfile'
import { aboutScrubRange } from './aboutScrollConfig'

const quote =
  'For me, a model is not just code on a screen.'
const body =
  'Since 2023 I have been dedicated to machine learning that is measured — papers, pipelines, and products that have to hold in production.'

function AboutManifestoStage() {
  const rootRef = useRef(null)
  const { prefersReducedMotion, enableGsapScrub } = useReducedMotionProfile()
  const words = useMemo(() => quote.split(' '), [])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    const wordEls = [...root.querySelectorAll('.about-stage__word')]
    const bodyEl = root.querySelector('.about-stage__manifesto-body')
    const ring = root.querySelector('.about-stage__manifesto-ring')

    if (prefersReducedMotion || !enableGsapScrub) {
      gsap.set(wordEls, { clearProps: 'all' })
      return undefined
    }

    registerGsap()

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          scroller: document.documentElement,
          ...aboutScrubRange('top 85%', 'bottom 15%'),
          scrub: 0.95,
          invalidateOnRefresh: true,
        },
      })

      tl.fromTo(
        root.querySelectorAll('.about-stage__manifesto-years span'),
        { y: 32, opacity: 0 },
        { y: 0, opacity: 0.08, duration: 0.3, stagger: 0.06, ease: 'power2.out' },
        0,
      )

      if (ring) {
        tl.fromTo(ring, { rotate: -24, scale: 0.92, opacity: 0.3 }, { rotate: 60, scale: 1, opacity: 1, duration: 0.6, ease: 'none' }, 0)
      }

      wordEls.forEach((word, i) => {
        tl.fromTo(
          word,
          { opacity: 0.2, y: 14 },
          { opacity: 1, y: 0, duration: 0.05, ease: 'power2.out' },
          0.12 + i * 0.045,
        )
      })

      if (bodyEl) {
        tl.fromTo(bodyEl, { y: 18, opacity: 0.3 }, { y: 0, opacity: 1, duration: 0.22, ease: 'power2.out' }, 0.72)
      }
    }, root)

    return () => ctx.revert()
  }, [enableGsapScrub, prefersReducedMotion])

  return (
    <section ref={rootRef} className="about-stage about-stage--manifesto" aria-labelledby="about-manifesto-heading">
      <div className="about-stage__flow">
        <p className="about-stage__manifesto-years" aria-hidden="true">
          <span>2023</span>
          <span>2027</span>
        </p>

        <div
          className="about-stage__manifesto-ring"
          data-about-node="manifesto-core"
          data-about-node-x="0.5"
          data-about-node-y="0.5"
          aria-hidden="true"
        />

        <div className="about-stage__manifesto-inner">
          <span
            className="about-stage__manifesto-mark"
            data-about-node="manifesto-mark"
            data-about-node-x="0.5"
            data-about-node-y="0.5"
            aria-hidden="true"
          >
            ML
          </span>
          <h2
            id="about-manifesto-heading"
            className="about-stage__manifesto-quote"
            data-about-node="manifesto-quote"
            data-about-node-x="0.5"
            data-about-node-y="0.35"
          >
            {words.map((word, i) => (
              <span key={`${word}-${i}`} className="about-stage__word">
                {word}
              </span>
            ))}
          </h2>
          <p
            className="about-stage__manifesto-body"
            data-about-node="manifesto-body"
            data-about-node-x="0.5"
            data-about-node-y="0.5"
          >
            {body}
          </p>
        </div>
      </div>
    </section>
  )
}

export default AboutManifestoStage
