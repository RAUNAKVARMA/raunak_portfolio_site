import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap, registerGsap, ScrollTrigger } from '../../lib/gsap.client'
import { useSceneProgress } from '../../providers/SceneProgressProvider'
import { useReducedMotionProfile } from '../../hooks/useReducedMotionProfile'

/**
 * Wires GSAP ScrollTrigger scrub per route: hero->about morph on Home,
 * and a contact closing beat wherever a #contact section exists.
 */
export function useScrollSceneTriggers() {
  const { pathname } = useLocation()
  const { setMorphProgress, setContactProgress } = useSceneProgress()
  const { enableGsapScrub } = useReducedMotionProfile()

  useEffect(() => {
    if (!enableGsapScrub) return undefined

    registerGsap()

    // Let the new route's DOM paint before measuring.
    const raf = requestAnimationFrame(() => {
      const hero = document.getElementById('hero')
      const about = document.getElementById('about')
      const contact = document.getElementById('contact')
      const morphProxy = { value: 0 }
      const contactProxy = { value: 0 }

      if (hero && about) {
        gsap.to(morphProxy, {
          value: 1,
          ease: 'none',
          onUpdate: () => setMorphProgress(morphProxy.value),
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            endTrigger: about,
            end: 'top 40%',
            scrub: 0.8,
          },
        })
      }

      if (contact) {
        gsap.to(contactProxy, {
          value: 1,
          ease: 'none',
          onUpdate: () => setContactProgress(contactProxy.value),
          scrollTrigger: {
            trigger: contact,
            start: 'top 85%',
            end: 'bottom bottom',
            scrub: 0.6,
          },
        })
      }

      ScrollTrigger.refresh()
    })

    return () => {
      cancelAnimationFrame(raf)
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [enableGsapScrub, pathname, setMorphProgress, setContactProgress])
}

function ScrollSceneTriggers() {
  useScrollSceneTriggers()
  return null
}

export default ScrollSceneTriggers
