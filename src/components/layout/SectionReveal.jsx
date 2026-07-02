import { useEffect, useRef } from 'react'
import { gsap, registerGsap } from '../../lib/gsap.client'
import { useReducedMotionProfile } from '../../hooks/useReducedMotionProfile'

function SectionReveal({ children, className = '', stagger = 0.08, y = 32 }) {
  const ref = useRef(null)
  const { enableGsapScrub } = useReducedMotionProfile()

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    if (!enableGsapScrub) {
      el.style.opacity = '1'
      el.style.transform = 'none'
      el.querySelectorAll('[data-reveal]').forEach((node) => {
        node.style.opacity = '1'
        node.style.transform = 'none'
      })
      return undefined
    }

    registerGsap()
    const items = el.querySelectorAll('[data-reveal]')
    const targets = items.length ? items : [el]

    gsap.set(targets, { opacity: 0, y })

    const tween = gsap.to(targets, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      stagger,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 82%',
        toggleActions: 'play none none reverse',
      },
    })

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [enableGsapScrub, stagger, y])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

export default SectionReveal
