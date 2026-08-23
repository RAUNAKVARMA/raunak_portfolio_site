import { useLayoutEffect } from 'react'
import { gsap, registerGsap } from '../../lib/gsap.client'

export function useAboutPageMotion(rootRef, enabled) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || !enabled) return undefined

    registerGsap()

    const ctx = gsap.context(() => {
      gsap.utils.toArray(root.querySelectorAll('[data-about-reveal]')).forEach((el) => {
        gsap.fromTo(
          el,
          { y: 36, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
          },
        )
      })

      const storyIntro = root.querySelector('.about-doc__story-intro')
      if (storyIntro) {
        const title = storyIntro.querySelector('.about-doc__story-title')
        const deck = storyIntro.querySelector('.about-doc__story-deck')
        if (title) {
          gsap.from(title, {
            y: 56,
            opacity: 0,
            duration: 1.05,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: storyIntro,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          })
        }
        if (deck) {
          gsap.from(deck, {
            y: 28,
            opacity: 0,
            duration: 0.9,
            delay: 0.14,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: storyIntro,
              start: 'top 84%',
              toggleActions: 'play none none reverse',
            },
          })
        }
      }

      gsap.utils.toArray(root.querySelectorAll('.about-doc__col')).forEach((col, index) => {
        const title = col.querySelector('h3')
        const body = col.querySelector('p')
        const indexEl = col.querySelector('.about-doc__col-index')

        gsap.from(col, {
          y: 64,
          opacity: 0,
          duration: 1,
          delay: index * 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: col,
            start: 'top 86%',
            toggleActions: 'play none none reverse',
          },
        })

        if (indexEl) {
          gsap.from(indexEl, {
            scale: 0.5,
            opacity: 0,
            duration: 0.85,
            delay: index * 0.1 + 0.06,
            ease: 'back.out(1.5)',
            scrollTrigger: {
              trigger: col,
              start: 'top 86%',
              toggleActions: 'play none none reverse',
            },
          })
        }

        if (title) {
          gsap.from(title, {
            clipPath: 'inset(0 100% 0 0)',
            duration: 0.9,
            delay: index * 0.1 + 0.12,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: col,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          })
        }

        if (body) {
          gsap.from(body, {
            y: 24,
            opacity: 0,
            duration: 0.95,
            delay: index * 0.1 + 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: col,
              start: 'top 84%',
              toggleActions: 'play none none reverse',
            },
          })
        }
      })

      const manifesto = root.querySelector('.about-doc__manifesto')
      if (manifesto) {
        gsap.utils.toArray(manifesto.querySelectorAll('.about-doc__years span')).forEach((span, i) => {
          gsap.from(span, {
            y: 120,
            opacity: 0,
            duration: 1.25,
            delay: i * 0.14,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: manifesto,
              start: 'top 78%',
              toggleActions: 'play none none reverse',
            },
          })
        })

        const mark = manifesto.querySelector('.about-doc__manifesto-mark')
        if (mark) {
          gsap.from(mark, {
            scaleY: 0,
            opacity: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: manifesto,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          })
        }

        const headline = manifesto.querySelector('h2')
        const copy = manifesto.querySelector('p')
        if (headline) {
          gsap.from(headline, {
            y: 48,
            opacity: 0,
            duration: 1.05,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: manifesto,
              start: 'top 76%',
              toggleActions: 'play none none reverse',
            },
          })
        }
        if (copy) {
          gsap.from(copy, {
            y: 28,
            opacity: 0,
            duration: 0.9,
            delay: 0.14,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: manifesto,
              start: 'top 74%',
              toggleActions: 'play none none reverse',
            },
          })
        }
      }

      gsap.utils.toArray(root.querySelectorAll('.about-doc__skill-group')).forEach((group, i) => {
        const chips = group.querySelectorAll('.about-doc__skill-chip')

        gsap.from(group.querySelector('.about-doc__skill-group-head'), {
          x: -24,
          opacity: 0,
          duration: 0.85,
          delay: (i % 2) * 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: group,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        })

        if (chips.length) {
          gsap.from(chips, {
            y: 16,
            opacity: 0,
            duration: 0.65,
            stagger: 0.04,
            delay: (i % 2) * 0.08 + 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: group,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
          })
        }
      })
    }, root)

    return () => ctx.revert()
  }, [enabled, rootRef])
}
