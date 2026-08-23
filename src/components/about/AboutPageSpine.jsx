import { useLayoutEffect, useRef } from 'react'
import { gsap, registerGsap } from '../../lib/gsap.client'
import { useReducedMotionProfile } from '../../hooks/useReducedMotionProfile'
import { localPoint, spineSegment } from './aboutTopology'

/** Page-level vertical spine linking post-hero sections. */
function AboutPageSpine({ pageRef }) {
  const svgRef = useRef(null)
  const spineRef = useRef(null)
  const nodeRefs = useRef([])
  const { prefersReducedMotion, enableGsapScrub } = useReducedMotionProfile()

  useLayoutEffect(() => {
    const page = pageRef?.current
    const svg = svgRef.current
    const spine = spineRef.current
    if (!page || !svg || !spine) return undefined

    const sections = [...page.querySelectorAll('.about-stage')]
    if (sections.length < 2) return undefined

    const update = () => {
      const pb = page.getBoundingClientRect()
      const x = Math.max(28, pb.width * 0.04)
      svg.style.left = `${x}px`
      svg.style.height = `${page.scrollHeight}px`

      const nodes = nodeRefs.current.filter(Boolean)
      const points = sections.map((sec, i) => {
        const anchor = sec.querySelector('.about-stage__flow') || sec
        const p = localPoint(anchor, page, 0, 0.12)
        if (nodes[i]) {
          nodes[i].setAttribute('cx', x)
          nodes[i].setAttribute('cy', p.y)
        }
        return p.y
      })

      if (points.length >= 2) {
        const y1 = points[0]
        const y2 = points[points.length - 1]
        spine.setAttribute('d', spineSegment(x, y1, y2))
        const len = spine.getTotalLength()
        spine.style.strokeDasharray = `${len}`
        if (prefersReducedMotion || !enableGsapScrub) {
          spine.style.strokeDashoffset = '0'
        }
      }
    }

    update()
    window.addEventListener('resize', update, { passive: true })

    if (prefersReducedMotion || !enableGsapScrub) {
      return () => window.removeEventListener('resize', update)
    }

    registerGsap()
    const ctx = gsap.context(() => {
      gsap.fromTo(
        spine,
        { strokeDashoffset: () => spine.getTotalLength() },
        {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: page,
            scroller: document.documentElement,
            start: 'top 60%',
            end: 'bottom 20%',
            scrub: 0.35,
            onRefresh: update,
          },
        },
      )

      nodeRefs.current.filter(Boolean).forEach((node, i) => {
        gsap.fromTo(
          node,
          { r: 2, opacity: 0 },
          {
            r: 4,
            opacity: 0.7,
            duration: 0.15,
            scrollTrigger: {
              trigger: sections[i],
              scroller: document.documentElement,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          },
        )
      })
    }, page)

    return () => {
      ctx.revert()
      window.removeEventListener('resize', update)
    }
  }, [pageRef, enableGsapScrub, prefersReducedMotion])

  if (prefersReducedMotion) return null

  return (
    <svg ref={svgRef} className="about-page-spine" aria-hidden="true">
      <path
        ref={spineRef}
        className="about-page-spine__line"
        fill="none"
        stroke="url(#about-topology-stroke)"
        strokeWidth="1"
      />
      {[0, 1, 2, 3].map((i) => (
        <circle
          key={i}
          ref={(el) => {
            nodeRefs.current[i] = el
          }}
          className="about-page-spine__node"
          r="3"
          fill="rgba(184, 196, 168, 0.5)"
        />
      ))}
    </svg>
  )
}

export default AboutPageSpine
