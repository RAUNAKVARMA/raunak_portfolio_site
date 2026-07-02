import { useEffect } from 'react'
import { gsap, registerGsap } from '../../lib/gsap.client'
import { useSceneProgress } from '../../providers/SceneProgressProvider'
import { useReducedMotionProfile } from '../../hooks/useReducedMotionProfile'

/**
 * Wires GSAP ScrollTrigger scrub for hero→about morph and contact closing beat.
 */
export function useScrollSceneTriggers() {
  const { setMorphProgress, setContactProgress } = useSceneProgress()
  const { enableGsapScrub } = useReducedMotionProfile()

  useEffect(() => {
    if (!enableGsapScrub) return undefined

    registerGsap()
    const hero = document.getElementById('hero')
    const about = document.getElementById('about')
    const contact = document.getElementById('contact')

    const triggers = []
    const morphProxy = { value: 0 }
    const contactProxy = { value: 0 }

    if (hero && about) {
      const morphTween = gsap.to(morphProxy, {
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
      triggers.push(morphTween.scrollTrigger)
    }

    if (contact) {
      const contactTween = gsap.to(contactProxy, {
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
      triggers.push(contactTween.scrollTrigger)
    }

    return () => {
      triggers.forEach((t) => t?.kill())
    }
  }, [enableGsapScrub, setMorphProgress, setContactProgress])
}

function ScrollSceneTriggers() {
  useScrollSceneTriggers()
  return null
}

export default ScrollSceneTriggers
