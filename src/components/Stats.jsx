import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap, registerGsap } from '../lib/gsap.client'
import { useReducedMotionProfile } from '../hooks/useReducedMotionProfile'
import { aboutScrubRange } from './about/aboutScrollConfig'

const stats = [
  { target: 5, label: 'Publications', detail: 'Springer & IEEE outputs' },
  { target: 3, label: 'Projects', detail: 'Production ML shipped' },
  { target: 1, label: 'Startups', detail: 'Rauran Charge · AIC' },
  { target: 2, label: 'Research yrs', detail: 'Labs that ran' },
]

function pad(value) {
  return String(Math.round(value)).padStart(2, '0')
}

function Stats() {
  const rootRef = useRef(null)
  const { prefersReducedMotion, enableGsapScrub } = useReducedMotionProfile()

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    const nums = [...root.querySelectorAll('[data-stat-num]')]

    if (prefersReducedMotion || !enableGsapScrub) {
      nums.forEach((el) => {
        el.textContent = pad(el.dataset.statNum)
      })
      return undefined
    }

    registerGsap()
    const ctx = gsap.context(() => {
      nums.forEach((el, i) => {
        const target = Number(el.dataset.statNum)
        const proxy = { value: 0 }
        gsap.to(proxy, {
          value: target,
          duration: 1,
          ease: 'power3.out',
          snap: { value: 1 },
          onUpdate: () => {
            el.textContent = pad(proxy.value)
          },
          scrollTrigger: {
            trigger: el,
            scroller: document.documentElement,
            start: 'top 92%',
            toggleActions: 'play none none none',
            once: true,
          },
        })

        gsap.fromTo(
          el.closest('.about-stage__stats-row'),
          { x: 16, opacity: 0.4 },
          {
            x: 0,
            opacity: 1,
            duration: 0.65,
            delay: i * 0.05,
            ease: 'power3.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: el,
              scroller: document.documentElement,
              start: 'top 93%',
              toggleActions: 'play none none none',
              once: true,
            },
          },
        )
      })

      gsap.to(root.querySelector('.about-stage__stats-ticker'), {
        xPercent: -12,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          scroller: document.documentElement,
          ...aboutScrubRange('top bottom', 'bottom top'),
          scrub: 0.4,
        },
      })
    }, root)

    return () => ctx.revert()
  }, [enableGsapScrub, prefersReducedMotion])

  useEffect(() => {
    if (!prefersReducedMotion && enableGsapScrub) return undefined
    rootRef.current?.querySelectorAll('[data-stat-num]').forEach((el) => {
      el.textContent = pad(el.dataset.statNum)
    })
    return undefined
  }, [enableGsapScrub, prefersReducedMotion])

  return (
    <section ref={rootRef} className="about-stage about-stage--stats" aria-labelledby="about-stats-heading">
      <div className="about-stage__flow about-stage__flow--stats">
        <div
          className="about-stage__stats-hub"
          data-about-node="stats-hub"
          data-about-node-x="0.5"
          data-about-node-y="0.5"
          aria-hidden="true"
        >
          <span className="about-stage__stats-hub-core" />
        </div>

        <div className="about-stage__stats-ticker" aria-hidden="true">
          {[...stats, ...stats].map((stat, i) => (
            <span key={`${stat.label}-${i}`} className="about-stage__stats-ticker-num">
              {pad(stat.target)}
            </span>
          ))}
        </div>

        <div className="about-stage__stats-compact">
          <div
            className="about-stage__stats-left"
            data-about-node="stats-title"
            data-about-node-x="0"
            data-about-node-y="0.5"
          >
            <h2 id="about-stats-heading" className="about-stage__stats-title">
              Measured in papers, products, and proof.
            </h2>
            <p className="about-stage__stats-sub">
              Every number is a published output, a shipped system, or a lab that ran.
            </p>
          </div>

          <ul className="about-stage__stats-ledger">
            {stats.map((stat, i) => (
              <li
                key={stat.label}
                className="about-stage__stats-row about-net-row"
                data-about-node={`stats-row-${i}`}
                data-about-node-x="1"
                data-about-node-y="0.35"
                data-cursor-hover="true"
              >
                <span className="about-stage__stats-row-label">{stat.label}</span>
                <span className="about-stage__stats-row-rule" aria-hidden="true" />
                <span className="about-stage__stats-row-num" data-stat-num={stat.target}>
                  {pad(stat.target)}
                </span>
                <span className="about-stage__stats-row-detail">{stat.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default Stats
